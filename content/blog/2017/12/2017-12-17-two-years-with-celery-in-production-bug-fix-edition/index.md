---
title: "Two years with Celery in Production: Bug Fix Edition"
date: "2017-12-17"
---

![](images/eb89c-1u-zuhl1o4nb9auotowmkgw.png)

Photo by [Martin Oslic](https://unsplash.com/photos/Qi93Pl5vDRw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com)

As mentioned in an [earlier post](https://medium.com/squad-engineering/leveraging-aws-lambda-for-image-compression-at-scale-a01afd756a12), we rely on Celery for publishing and consuming tasks to/from our [RabbitMQ (RMQ)](https://www.rabbitmq.com/) broker. We are very happy with the whole setup and it works reliably for us. But this wasn’t exactly the case up until four weeks back. We were plagued with a plethora of issues which we hadn’t got down to fix, mostly because first, the number of issues was small, and the occurrences less frequent.

But as the frequency and the types of issues increased, we started spending a lot of time in maintenance. I personally would have to keep an eye on the RMQ admin to see which queues weren’t being consumed properly, see if workers (we will use “workers” for celery workers or consumers) were still up or not stuck in an infinite restart loop. And every time I noticed something abnormal, I would have to restart the rogue worker/s manually.

# The Issues

Here is a list of issues that we identified, and fixed:

1. Worker servers always had an unexplainably high RAM usage
2. Worker servers always had an unexplainably high CPU usage
3. Workers stayed idle, not consuming any tasks
4. Workers kept on restarting
5. Publishers did not adhere to [`task_publish_retry_policy`](http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-task_publish_retry_policy)

Let’s go over them one by one

# Worker servers always had an unexplainably high RAM usage

> Tl;dr: We had orphaned child processes still running. Use `stopasgroup` if you are using `supervisord`.

> **UPDATE:** After a month of writing, this is still happening, albeit rarely and less severely. A final solution is to regularly (crons, maybe) kill the processes. This is also hinted at in [Celery’s documentation](http://docs.celeryproject.org/en/latest/userguide/workers.html#stopping-the-worker).

We noticed our worker servers always having 100% RAM usage, and noticed that processes for old workers were still alive. This became apparent because we had very recently changed the configuration and we could see processes for workers with the old configuration (they were listening to inexistent queues). This was a red flag.

We use `supervisor` to control the celery workers and have to do a `reread` every time we change the worker config. On searching, we found out that when we `reread` and `update` or when we `restart`, `supervisor` doesn’t kill the old processes. This was also [raised in an issue on supervisor](https://github.com/Supervisor/supervisor/issues/600). As suggested, we started doing `stop` and `start` instead of a `restart` (in hindsight this looks dumb now since all `restart` does is `stop` and `start`) and before `reread`s as well. _Of course_, this didn’t help things.

A `ps auxf` output (after removing unneeded info) from one of our servers clearly showed how there were old celery processes still hanging out.

USER        START   TIME COMMAND
ubuntu      03:38   0:57  \_ celery worker A
ubuntu      03:38   0:30  |   \_ celery worker A
ubuntu      03:38   0:32  |   \_ celery worker A
ubuntu      03:38   0:32  |   \_ celery worker A
ubuntu      03:38   0:31  |   \_ celery worker A
ubuntu      03:38   0:58  \_ celery worker B
ubuntu      03:38   0:31      \_ celery worker B
ubuntu      03:38   0:31      \_ celery worker B
ubuntu      03:38   0:31      \_ celery worker B
ubuntu      03:38   0:30      \_ celery worker B
ubuntu      Sep09   1:59  celery worker C
ubuntu      Sep10   3:04  celery worker D

It was clear because:

1. We had restarted all the celery workers quiet recently, as is visible by the `START` column, while the other two older processes are at least a day old.
2. How celery, roughly, works is that we start a parent process that starts more child processes (depending on the `concurrency`) and maintains a pool of these workers. This is consistent with how the newer workers are depicted, while the two older ones have no parent/child processes.

On further research, I came across [an issue in celery](https://github.com/celery/celery/issues/102) that mentioned the same problem.

**_Turns out, celery parent processes don’t propagate the_** **_`STOP`_** **_signal to its child processes, leaving them orphaned (these are the old workers we saw in our_** **_`ps`_** **_output above). This got fixed by using_** **_`stopasgroup`_** **_in the_** **_`supervisord`_** **_config._** **_[As documented](http://supervisord.org/configuration.html)_****_, with_** **_`stopasgroup`_** **_set to_** **_`true`_****_, supervisor sends the_** **_`STOP`_** **_signal to the whole process group._**

# Worker servers always had an unexplainably high CPU usage

> Tl;dr: Our `--max-memory-per-child` was set too low, we moved back to using `--max-tasks-per-child`.

We would be okay with this if the tasks were CPU intensive or the rate or volume of task consumption is high. They were not. It was just simple get and set on the database and the rate was about 17 tasks per second when we had ~12 workers spread over 4 servers.

To figure out what is going on, I `ssh`ed into a server with ~100% CPU usage, and did:

ps aux -sort -%cpu

Found a worker process that was taking ~48% of the CPU. To check what was happening with that worker, I checked the logs generated by that worker. The logs showed that the worker was being killed after every 3–4 tasks because of reaching the memory limit (we were starting our workers with a `--max-memory-per-child` of some 200–300mb). Although it did look like a sane value to us, maybe we misunderstood how this limit works.

The logs were similar on other servers. This would explain the high CPU usage. Killing and creating processes would take CPU. And this would also explain the slow rate of execution. So, on a hunch, I removed this limit from the workers and moved back to using `--max-tasks-per-child`.

**_Instantly the rate increased to ~250 tasks per second (from 17) and the CPU usage also settled down. Huge win. Memory leaks are still covered because of the limit on the number of tasks._**

# Workers stayed idle, not consuming any tasks

> Tl;dr: There was a deadlock because of a play between `psycopg2` and `ssl`. Updating `psycopg2` to `2.6.1` fixed the issue.

The queue had available tasks, and healthy consumers, but the tasks weren’t being consumed. This would happen every 2–3 hours for some particular workers. We had to manually restart the hanging workers and quickly became a headache.

One hypothesis was that a particular task was making the workers hang, since the RMQ admin showed picked but `unacked` tasks whenever the workers used to hang. Checking the logs for the hung workers confirmed that the workers had started a particular task but not completed it. Double checked this by looking at the active tasks for hung workers by doing:

celery -A squadrun inspect active

Solution for this, as mentioned on the internet, was to periodically restart the workers. But this looked like a hack and not _the_ solution to me. But we weren’t getting any further headway into this. On a hunch, again, we decided to use `strace` on a hung worker to _actually_ see what a worker was stuck on. This turned out to be a good idea:

sudo strace -p 27067 
Process 27067 attached 
futex(0x33372e8, FUTEX\_WAIT\_PRIVATE, 2, NULL ^C
Process 27067 detached

On searching about what `futex` and `FUTEX_WAIT_PRIVATE` means, and checking similar issues with celery, we stumbled upon a [similar issue as ours](https://github.com/celery/celery/issues/2429).

From [one of the comments](https://github.com/celery/celery/issues/2429#issuecomment-126402926) on the issue:

> Are you using Postgres in any way? Because thats exactly what was happening with us. Postgres registers a locking callback with ssl, which all ssl requests use. Unfortunately Postgres unloads the callback after closing its connections, which is fine for Postgres, but any other ssl consumer (requests included) would be unable to release the lock, allowing a thread to deadlock itself if it tries to reacquire its own lock.

**_As mentioned, updating to_** **_`psycopg2==2.6.1`_** **_(we were at_** **_`2.5.2`_****_) fixed the issue._**

# Workers kept on restarting

> Tl;dr: `celery==4.0` had a bug, which got fixed in `v4.1.0`. But we went ahead with our own fork and applied the patch to it.

Sometimes, we would have our workers continually restarting. This was a problem on our `staging` environment though, and, when nothing worked, emptying the RMQ queue once, and then publishing the tasks fixed the restarting worker.

To figure out what was going wrong, we again went back to the logs, and saw the following exception and traceback:

2017-09-09 16:48:44,188 \[CRITICAL\] celery.worker: Unrecoverable error: TypeError("'NoneType' object is not callable",)
Traceback (most recent call last):
  File "celery/worker/worker.py", line 203, in start
    self.blueprint.start(self)

... ...

  File "billiard/pool.py", line 1487, in apply\_async
    self.\_quick\_put((TASK, (result.\_job, None, func, args, kwds)))
TypeError: 'NoneType' object is not callable

This one was the easiest problem to figure out. Looks like when there are tasks already in the queue, and a worker is consuming from multiple queues, this bug makes an appearance. [They start consuming from the queue even before the queue is ready](https://github.com/celery/celery/issues/3620). This bug was fixed in `celery==4.1.0`. We were at `v4.0`. Before making the update though, we made sure there were no regressions or new bugs introduced in `v4.1.0`, we came across [one major one](https://github.com/celery/celery/issues/4221). This bug made us less confident of making the update, because `v4.1.0` was out fairly recently, and testing it thoroughly to make sure nothing else was broken would have taken a long time.

**_So, we forked celery and_** **_[applied the patch that fixes the bug](https://github.com/ketanbhatt/celery/commit/c81c9f276cf48e68a654d98c5da7c4792ca4e441)_** **_we were facing . with_** **_`v4.0`_****_, and we were good to go!_**

# Publishers did not adhere to “task publish retry policy”

> Tl;dr: _`task_publish_retry_policy`_ _is broken in_ _`kombu==4.1.0`__, we downgraded to_ _`4.0.2`__._

Just when we thought we were done with bugs and issues caused by celery and other related libraries, another made appearance. Somewhere amongst all this, we had also updated `kombu` to `v4.1.0`.

Now, for one of our APIs, we wanted the celery publisher to raise an exception as soon as the connection couldn’t be established while publishing. But it wouldn’t just happen. The worker will go to `sleep(1)` (as found out by the traceback when we killed the process manually) if a connection wasn’t established, and do this infinitely. We tried setting a stricter retry policy explicitly while publishing the task using `apply_async` but it didn’t work out.

**_Finally, we found out that_** **_`task_publish_retry_policy`_** **_was broken in_** **_`kombu==4.1.0`_****_. We downgraded to_** **_`4.0.2`_** **_and things started working as expected._**

# Takeaways:

1. Logs made it easy to debug issues. Long live logs.
2. Test library updates before applying them to production, because great developers make mistakes too :D

A big thank you to [Tarun Garg](https://www.linkedin.com/in/tarungarg546/), my friend and colleague, for helping with the fixes :)

(Originally [posted on my Medium account](https://medium.com/squad-engineering/two-years-with-celery-in-production-bug-fix-edition-22238669601d))

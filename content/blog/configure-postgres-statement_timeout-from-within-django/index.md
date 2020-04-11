---
title: "Configure Postgres statement_timeout from within Django"
date: "2018-04-02"
---

![](https://cdn-images-1.medium.com/max/800/0*N92zoay61K_DEtpN.)

“A close-up of white dials on a music mixer” by [Alexey Ruban](https://unsplash.com/@kartochky?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

In a bid to prepare ourselves for projected growth, we are at the moment trying to figure out what part of our system will break at what scale, and how. One step towards this was to also define strict timeouts for our database queries, and eliminate/fix bad queries in the process.

# The problem

Our requirements were:

1. Be able to define different timeout values for different types of servers (app servers, analytics etc.)
2. The different limits should be well represented in the code so that they’re easy to discover, even by people who join our team in the future
3. It should be easy and quick to modify these limits

We identified multiple sources of our queries. Each of these might need a different query timeout. These sources are:

1. **App servers**: queries that run for our frontend facing APIs, like APIs that our Android app or clients use
2. **Celery servers**: queries made by our celery tasks that run asynchronously
3. **Cron servers**: queries made as part of crons
4. **Alerts**: we have a system that runs SQL queries at configured time intervals, and pushes the data (results of the queries) to relevant people (over Slack)
5. **Analytics**: queries that run as a part of our ETL (v0.1) system

We planned to incrementally reduce the timeouts because at every step/iteration, there will be queries which will not be able to run properly within the planned timeout. We will have to fix all those queries before we reduce the timeout. The incremental limits we defined for each iterations were:

![](https://ktbt10.files.wordpress.com/2018/04/18a82-1cbzgr_6xvpwru0xfhqonew.png)

Timeout planned for each iteration

This is a no-brainer **_if_** your requirements are simple. You can simply [create roles](https://www.postgresql.org/docs/9.6/static/sql-createrole.html) in the database and [set different timeouts for them](https://www.postgresql.org/docs/9.6/static/sql-alterrole.html).

Our backend is built using Django, and to accomplish this we would have to

1. Write a raw SQL migration to create the roles (if needed), and
2. Alter them to set the appropriate timeout
3. Set the [database dictionary](https://docs.djangoproject.com/en/2.0/ref/settings/#databases) differently for different server in Django settings with the correct role and passwords

**Why not just directly log in to the shell and do this?** Because then this change isn’t represented in the code and creates gaps in knowledge over time. But, _even though_ migrations are part of the code, they are just for change management, and rarely does someone go back to migrations to look for “logic” affecting your app’s behaviour.

Since we were planning on having multiple iterations, and there would be a lot of back and forth between the timeout limits while we are experimenting, it would become a hassle to write migrations and apply them every time something had to be changed. _This solution was not for us._

# The solution

We started thinking of a better way to accomplish what we had in mind.

We knew the “ease of configuration” would _only_ come if we can set the timeouts from within Django somehow. Thinking more in this direction and connecting little tidbits we were aware about Django and Postgres, we realized that:

1. One can set a timeout using `SET` inside a Postgres session which is then adhered to until the end of the current session using: `SET statement_timeout=<x>;`.
2. Django publishes a [`connection_created`](https://docs.djangoproject.com/en/1.11/ref/signals/#connection-created) signal every time a new database connection is created. This connection is then [put in the Connection Pool](https://docs.djangoproject.com/en/1.11/ref/databases/#general-notes) from where it can be reused (governed by configuration parameters like [`CONN_MAX_AGE`](https://docs.djangoproject.com/en/1.11/ref/settings/#std:setting-CONN_MAX_AGE))

Aha! Can’t we just catch the connection as soon as it is created, and set the timeout to whatever we desire for the session? Yes we can :)

https://gist.github.com/ketanbhatt/730b86ebece1aa91ebbf2b6182163bb8

We also went ahead and set the timeout separately for each [`connection.alias`](https://docs.djangoproject.com/en/2.0/topics/db/multi-db/#defining-your-databases). That gives us **even more flexibility**, we can now set multiple separate timeout values for the connections from the same server as well (for example: set a timeout of 5s for queries made for our Android app facing APIs, except for login API, for which we set the timeout to 1s. And then use `<queryset>.using('<alias>')` to use the timeout you want).

The benefit of this approach is:

1. Everything is in the code, you can just read and figure out what is happening
2. Easy to modify the timeouts
3. Since the logic is now in the application code, we can do more stuff with this, like setting a certain timeout only for some percentage of the connections.
4. Further, we can set different timeouts for different queries made from the same server

# Caveats

1. Since we are running an additional query every time a connection is made, it has some implications. Even though [Django’s documentation says](https://docs.djangoproject.com/en/2.0/ref/databases/#optimizing-postgresql-s-configuration) that the effect is minor, it is worth checking out if it’s okay for your case
2. Since the timeout is set using Django’s signals, it means that wherever Django does not publish a signal, this will not work. One such case is when you are directly logging in to the Postgres shell (or by doing `python manage.py dbshell`).

The changes mentioned here gives us more control over our queries and we can selectively restrict our systems in case there is a 🔥 that needs strict actions to be taken to keep the more important parts of the app alive (_not the best solution, but sometimes they don’t have to be_ 😃) .

_If you’re a talented developer who believes she’ll be a good fit for Squad —_ _**[we’re hiring!](https://www.squadplatform.com/careers/?utm_source=mediumcom&utm_medium=article&utm_campaign=configure_postgres_statement)**_

(Originally [posted on my Medium account](https://medium.com/squad-engineering/configure-postgres-statement-timeouts-from-within-django-6ce4cd33678a))

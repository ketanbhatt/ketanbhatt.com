---
title: "Can your Code Review system be upgraded?"
date: "2020-04-25"
category: programming
draft: true
---

For a long time, I thought there was only one way how teams ran their code review processes (Not talking about how to write code review comments etc: [link][1]). This was based on my rather limited experience of working in a small company. Even when a friend mentioned how it works in his new larger company, I couldn't comprehend how this system could work, and dismissed it without giving it much thought.

I recently changed jobs and moved to a largiesh company myself. This move has helped me experience alternate ways of doing the same things. One such is code reviews. Now that I have experienced this "other" process, I start to feel how it would work and how it could be useful for teams of 5 people or more. My one regret here is not getting to try this approach out in my previous team, and getting to see how it fares. Maybe I could have unlocked a whole level of effectiveness, knowledge sharing and efficiency for my team? Now we will never know 😬.

My intention in this article is to introduce people like me to this other system of running code reviews. I know I could have benefitted from something like this in the past. I do not know if there are more common ways of referring to these systems, so I am going to make up some headings. Please 🐻 with me.


## I. Explicit Assignment 🤝

![Explicitly assign your Pull Request](./images/explicit-assignment.png)

Whenever a new piece of work is taken up, it is assigned to at least two people. One of the assignee is considered to be the "Primary" owner for the task, and is going to be the person in charge of getting the work done. The other person is the "Secondary" owner and is mostly the explicit, pre-decided, owner for design and code reviews for this piece of work.

This is the process my older team followed. I asked 3-4 of my developer friends working in smaller companies and they mentioned that their teams follow a similar process as well.

### What works well
This process worked well enough for us. I think it had the following benefits

1. You have a go-to person to clarify your doubts and between the two of you, you can arrive at a final decision without waiting for more feedback (unless of course you feel that you should wait for it). Like in distributed systems, you only require 2 people to agree and you have a consensus. This is faster than needing more agreements to arrive at a consensus. Although, this is only valid for those 10% controversial tasks. Most are straightforward.
2. Since the reviewer has explicit ownership, they can plan and pre-allocate time for it. This helps in getting timely reviews done without creating ad-hoc distraction for the reviewer. In theory at least.

### What could be better
I also found things that I wished could be better:

1. If the reviewer is unavailable because of some reason, either the piece of work is blocked/delayed, or someone else needed to take up this review. This, in turn, delayed/blocked the piece of work they were originally supposed to spend time on.
2. Over time, different people had different pockets of expertise in the codebase (remember, I am not talking about the whole company, I am talking about a team that owns a part of that system). This means low bus factor.
3. Many a times, we could have made better choices, if a third person was consulted before getting to work. Ideally, this third person should be the original reviewer, but you can't always objectively quantify who has better know-how about a particular part of the system and/or the kind of problem that is being solved. Sometimes you can have multiple such people (which is a good thing!).
4. And probably one of the worst problem was caused by this shared form of responsibility (Primary and Secondary owners). It is but human nature to become lax if you know there is someone else that should point out things if you missed it (like how sometimes people complaining about devs churning out lower than expected quality of code just because they know there is a QA team that will thoroughly test things before it hits production). On more than one occasion we struggled to figure out where exactly were things missed, and how could we have avoided them. Is it something the Primary owner could have taken care of? Or was it something the Secondary owner should have pointed to while doing reviews? We finally landed on some version of: Everyone could have been more careful 😅 (To be clear, the aim was not to assign blame, but to gather actionable feedback that can be used to grow together as a team).


## II. Volunteering 🙋🏼‍♀️

![Toss your Pull Request in the Channel](./images/toss-in-the-channel.png)

Whenever a new piece of work is taken up, it is (mostly) assigned to a single person. This person is the only owner for this task. This person is responsible for soliciting feedback on his solution and implementation, and then, finally, getting it done. This person would usually share a document describing his solution with the team, and the team can collaborate and give feedback on it. Similarly, the person throws their Pull Request in a channel where anyone can take it up.

This is the process that is followed by Intercom, my current company. This is also the process that is followed at other large companies like Amazon, Freshworks, [Gitlab][2] and Grab.

Sometimes, you do fallback to explicit/implicit assignment, for example when two people are pairing on a particular task, they don't necessarily need someone else to code review. Or if you are working on a critical task and you think there is someone who is extremely relevant and should take a look, you can ask them for a review too.

### What problems does this solve

1. Results in work getting pushed to production faster as you no longer have to depend on one specific person to approve it. Anyone can jump in and review your work.
2. Since there is one clear owner, there is no ambiguity regarding ownership of the work.
3. Increased Bus Factor for the team since more and more people get to review different parts of the system, resulting in a more even knowledge distribution.
4. Pushes you to have a more mature deployment process that allows people to push their code to production safely.


### What problems can this have?

1. Needs more work to begin with to set the right culture. You need to take care of that people are putting in some time for reviews so that timely reviews happen. And also that someone (maybe a new person), isn't feeling confident enough to take up a review.

    ![Sometimes you will have to ask people explicitly](./images/code-review-please.png)

2. Consensus could be hard to achieve, but if it is something controversial, maybe more heads are better than one?


## Parting Words

You can't know you like it, until you have experienced it. Don't be dismissive and make the same mistake as I did. Trying is free (well, in this case at least). Maybe the change will end up improving your team's experience and effectiveness by a noticeable amount? Who knows? (hint: you can get to).

One other reason, and this is me speculating, could be that everyone just assumes that this is the only approach that people follow. All the blogs and articles I came across either talked about how to "do better code reviews" or how their system randomly assigns reviewers to a Pull Request, but doesn't talk about they why behind following this approach at all.

If you find this worthy of giving it a shot, know that it isn't going to be an easy change for you and your team. Start small, try it out with only a few tasks to begin with. But don't judge too early, give it some time. Best case, you strike gold. Most likely non-best case, you get to see what all the fuss is about, and get more confident about your processes.

If you do give it a try, I will be thrilled to learn from your experience. Please reach out.

👋


[1]: https://mtlynch.io/human-code-reviews-1/
[2]: https://docs.gitlab.com/ee/development/code_review.html#reviewer-roulette

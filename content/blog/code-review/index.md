---
title: "Coding review suggestion"
date: "2020-04-25"
category: programming
draft: true
---

Code Reviews around the world majorly follow the same process, in various flavours. You work on a task, and once you are done, toss it out to the team/company for review(s). For example, this process is followed in Amazon, Intercom, Freshworks, Gitlab, Grab.
But to some people working in smaller teams, this might come as utter surprise. I know, because that's what my reaction was. Even when a previous teammate reported the process followed in his new company, we couldn't help but wonder how such a system will even work!
But now I am on the other side, and I have seen it working. This article is an attempt to help people like me make this transition.
👋
This is what your process looks like at the moment, roughly:
When your team decides to take up a piece of work, it is assigned to two people (maybe more). These two people are deemed "Primary" and "Secondary" owners for the task and are supposed to collaborate closely on the task. The "Primary" owner is supposed to come up with the solution to the problem initially, it is discussed among the two owners . Once finalised, the Primary owner gets to work, and produces a Pull Request for the Secondary owner to review. Depending on the task at hand, sometimes other people's help can be sought as well.
This process of pre-deciding the reviewer for a piece of work is very common in small teams (less than 4 people or so). In hindsight, it makes sense. This is the natural way a company grows. It starts with just one developer doing everything, there is no review process in place. A second person joins the team, and it is pre-decided that you will be reviewing each other's work (what's the alternative anyway?). As more people join the team, the process sticks around. First, as a necessity to support new people more efficiently, and then because of inertia.
What is the world doing?
Generally, this is the process that a lot of companies follow:
When a team decides to take up a piece of work, it gets assigned to a single person. This person comes up with a solution and discusses it with the team. Once the solution is finalised, this person gets to work and produces a Pull Request. This Pull Request can now be reviewed by anyone in the team. Depending on the task at hand, the solution and the pull request can be assigned to specific people who might be closer to the problem or experts in the particular domain.
The solution can be shared with the team as a "Design Doc", and the Pull Request might be tossed into a channel to be voluntarily picked or randomly assigned by a bot. The specifics don't matter for our discussion today. We are after the overall idea of this approach.
What benefits does this approach have?
Results in work getting pushed to production faster as you no longer have to depend on one specific person to approve it. Anyone can jump in and review your work.
Since there is one clear owner, there is no ambiguity regarding ownership of the work.
Increased Bus Factor for the team since more and more people get to review different parts of the system, resulting in a more even knowledge distribution.
Pushes you to have a more mature deployment process that allows people to push their code to production safely.
If this is true, why do some teams never transition to this? Sometimes no one in the team has experienced this approach first-hand, or if someone has, they find it difficult to persuade the team to move to this "radically" different approach. By providing a go-to person to unblock you anytime you are stuck, pre-deciding the reviewer also gives an illusion of speed. It is also easier to onboard new people and support them in getting their work pushed to production if you don't have a more mature deployment process that does continuous integration and deployment.
One other reason, and this is me speculating, could be that everyone just assumes that this is the only approach that people follow. All the blogs and articles I came across either talked about how to "do better code reviews" or how their system randomly assigns reviewers to a Pull Request, but doesn't talk about they why behind following this approach at all.
Comments
There are some implementation details to figure out, if you do choose to try this way. What I have described here is just the overall idea, there are still other specific cases that I haven't talked about:
Two developers might be pair-programming on a piece of task. In this case they might not need anyone to review their code at all.
Sometimes, in a volunteer based review system, some Pull Requests might remain unreviewed for a long time. In such cases, you can randomly assign it to someone you think is relevant and can take a look.
You might be working on something really complex. In such cases, you can still toss the Pull Request to the team, but assign it to people whose review you think will be more valuable for the task. It is also completely fine to have it pre-decided who is going to review the Pull Requests in these cases.
You can support new teammates by starting them off with easier tasks, and encourage them to ask for help when they get stuck, or get someone to give them an overview of your system so they can reason better. (Intercom starts you off with a "buddy" in the team, which becomes an easy person for you to approach when you have doubts).
Evolution
My aim with this article was just to make you feel strongly enough about making the transition. I can't tell you how to do it because I haven't done it first-hand. But here is just some common sense advice that I wanted to share:
You can't move to this process overnight. Start small: try it out for tasks that are not too complex. See how it goes.
You will have to build a culture where people understand that reviewing code is as important as writing it.
Some companies follow a more formal process (you should do at least 1 review daily, or randomly assign reviews to people etc.), but this is not the only way forward. In my humble opinion, I think that the culture should be driving this process in smaller teams. You can nudge people to review Pull Requests, but I would avoid mandating it to begin with.
I will be more than happy to discuss specific situations and try to brainstorm solutions together. In time, if I find that I have learnt something about it that I can share with people en masse, I will. Until then, Iterate.

Pre-deciding the reviewer is good enough for teams with less than 4 engineers. But when the same practice sticks around as the team grows and doesn't evolve into it's next natural form, you are leaving money on the table.
Ciao.

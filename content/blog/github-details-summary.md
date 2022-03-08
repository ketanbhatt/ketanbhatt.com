---
title: "Using HTML details tag on Github easily"
date: "2020-04-18"
category: programming
---

I am a big fan of using Github issues for taking notes on the steps I am taking while debugging a weird behaviour or verifying some changes I made, or anything else where having a record of the steps I took will help me or someone else in the future.
These issues tend to become long, specially because I paste logs or outputs of the code I am running. To make the issues (and comments) more readable, I use the [HTML \<details\> tag][1] heavily. This is, thankfully, supported by Github's flavour of Markdown.

It turns long comments like:

>I am going to try and backfill this table.
>
>Running the backfill:
>
>```rb
>[1] App(DEV)> Backfill.run(from: 2.years.ago)
>=> logs.....
>
>....
>...
>more logs...
>
>SUCCESS
>```
>
>That worked!

to something more readable:

> I am going to try and backfill this table.
> 
> <details>
> <summary>Running the backfill:</summary>
> 
> ```rb
> [1] App(DEV)> Backfill.run(from: 2.years.ago)
> => logs.....
> 
> ....
> ...
> more logs...
> 
> SUCCESS
> ```
> </details>
> 
> That worked!

Even though I use this tag almost 5 times a day, and curse having to type so much to get the tag working, and get confused if it is `<details><summary></summary></details>` or `<summary><details></details></summary>` (don't blame me, they both make sense!), I never tried to improve my situation. Until today.

Today I decided to [add a text replacement][2] on my machine that will automatically turn `ghdet` to the correct syntax. I wrote this post to point people to:
1. the details tag and encourage them to use it
2. make it easy for them to use it!

You can add a `new line` character to the text to be replaced by pressing `option + return` while defining the replacement (yes, the same way you add a new line to any other app where pressing `return` would not help). 

Let me know if you have any suggestions.

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
[2]: https://support.apple.com/en-ie/guide/mac-help/mh35735/mac

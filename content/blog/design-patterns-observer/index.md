---
title: "AI and News Flashes: The Observer Pattern"
date: "2016-04-27"
redirect_from:
  - /2016/04/27/design-patterns-observer/
---

### The Observer Pattern:

Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### Principles:

1. Strive for loosely coupled designs between objects that interact.

# when will I need it?

So there is a smart "NewsGetter Machine". It fetches news from different sources on its own (these machines will one day start coding as well :cry:). This news is being consumed by two (for now) "Online Newspapers". You are given the task to implement a way for these newspapers to get the latest news as it comes and display it on their sites. The super-intelligent AI guys who built the NewsGetter also implemented a `news_flash()` method. This method gets called every time the NewsGetter gets some new news.

_Oh, also, there is a 100% chance of more newspapers starting to use the **NewsGetter Machine** as their primary source of news (because AI is the future)._

You, being you, coded the implementation in under 5 minutes:

https://gist.github.com/ketanbhatt/41142ce95eddf53e02db59e510550bd2

Genius! Every time there is a news flash, `news_flash()` gets called, which gets the latest news and you update the newspapers. Simple and sweet. And extensible. No. No? No.

What about the stuff we learnt about in our [Strategy Pattern post](http://ketanbhatt.com/2016/04/26/design-patterns-strategy/)? Looks like **we coded concrete implementations inside the `news_flash()` method. Now every time we get another newspaper that wants to use the `NewsGetter`, we will have to modify our code. That is bad. We should encapsulate what we know will vary.**

# Observer Pattern to the rescue!

Time to use some Design Principles!

In the Observer Pattern we have two entities, **Subject** and **Observer**. As is not clear by the names, **Subject is the _thing_ that holds state** (information, like news in our case) and **Observer is the _thing_ that wants to get notified when the state of the Subject changes**, because the Observer needs to do some crazy things based on the change. It is the Subject's responsibility to notify Observer's whenever it's state changes.

Implementing this for our case, we will define two classes: `Subject` and `Observer`.

- The `Subject` class will implement methods to `register`, `remove` and `notify` Observers.
- The `Observer` class implements the `update` method that is called whenever the Subject notifies the observer.

While we are at it, we will also define a `NewsPaper` class that implements a `display_news` method that is called whenever the observer's `update` method is called. This is done in order to standardize the APIs that newspapers will create. Any newspaper that needs to integrate with the `NewsGetterMachine` will need to inherit from `Observer` _and_ `Newspaper`​ classes and implement the unimplemented methods.

Here is our definition of the superclasses and its usage:

https://gist.github.com/ketanbhatt/bd44a513fadc7c5ad8852512b6536f1d

This was the Observer pattern. Notice how we were **Pushing** the news when we notified observers? This is sometimes not desirable. In that case we can go with a **Pulling** implementation. The call to `notify_observers` is made without any extra information. The observers, when they receive the notification, can call `get_news()` method of the `NewsGetterMachine` to fetch latest news if they want to.

# how did we benefit?

Now we can add any number of newspapers and just register them with the `NewsGetterMachine` and they will get the updated news! We can also register or remove observers at runtime.

Also, the implementation of the newspapers, and how they display the news, is all abstracted away from the `NewsGetterMachine`. All this machine knows is that there are some observers that it has to notify by calling the `update` method on them.

**For an excellent, pro-level, implementation of the Observer pattern, take a look at [Django's Signals](https://docs.djangoproject.com/en/1.9/topics/signals).**

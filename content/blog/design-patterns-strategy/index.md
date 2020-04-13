---
title: "Preventing Rubber Ducks from Flying: The Strategy Pattern"
date: "2016-04-26"
redirect_from:
  - /2016/04/26/design-patterns-strategy/
---

> _Master:_ So Grasshopper, should effort go into reuse **above** maintainability and extensibility?
>
> _Student:_ Master, I believe that there is truth in this.
>
> _Master:_ I can see that you still have much to learn.
>
> \- Head First Design Patterns

#### The Strategy Pattern:

Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from the clients that use it.

#### Principles:

1. Encapsulate what varies: Identify the aspects of your application that vary and separate them from what stays the same.
2. Favour composition over inheritance.
3. Program to interfaces, not implementations.

## when will I need it?

So you are a developer and you are making a _Duck Simulator_\* program. You are a nice person and so you use Inheritance. You have a `Duck` superclass that defines some attributes and methods. This class is inherited by other special `DuckType` classes. Like so:

`gist:ketanbhatt/39ced93e3634fdbb6a579716d4cca0e7`

`quack()` and `swim()` are implemented in the superclass while `display()` is implemented in the child classes as each duck looks different.

Now **you are asked to add a new feature, the ducks can now fly**. Because you used inheritance, you just added the method `fly()` to the superclass :grin:

**But that proved disastrous** because a certain Duck (`RubberDuck`) that wasn't supposed to be flying started doing air acrobatics.

So what? You can easily override `fly()` in `RubberDuck`. But what if we add another Duck `WoodenDuck`? You will again override `fly()` and `quack()` (because wooden ducks don't quack).

_What you thought was great for reuse (Inheritance) turned out to be a nightmare for maintenance._

## Strategy Pattern to the rescue!

Time to use some Design Principles!

We identify that `flying` and `quacking` are varying behaviours so we will abstract them out to interfaces.

We will create `FlyBehavior` and `QuackBehavior` superclasses. Each behaviour will have a set of classes associated with it.

`gist:ketanbhatt/b92a32e49d0a5fb2929b340ead54d79f`

You see the ingenuity of the approach? **Now you can easily add a new Duck type and give it any behaviour you want, without making any change to the superclass `Duck` or without adding any new methods to the child class.** This also prevents disasters like flying rubber ducks.

We took implementation away from the child classes and moved it to classes of their own from where they can be reused. _Now not only can you reuse the `Quack` class inside of any `Duck` type class, but you can also separately use it to, maybe, imitate a duck sound._

You can also add/change behaviours at runtime! Just add a setter method to `Duck` and now we can call the method to set/modify flying behaviour of a duck at runtime.

## but the pattern talks about algorithms?

See it like this: each set of behaviors (`FlyingBehavor` --> `FlyWithWings`, `FlyNoWay`) are like a family of algorithms, and they are \_interchangeable\_.

## how did we benefit?

We now have a \_composition\_. Instead of inheriting behaviours, our `Duck` classes are composed of the appropriate behaviour classes. This is one of the points we mentioned in the principles.

Composition enables us to encapsulate related behaviour together, allowing them to be reused later. And also the behaviour can be changed at runtime.

Also, anytime we have to add a new way of flying (`FlyWithRockets`), all we have to do is add a new child for `FlyBehavior` and chill.

\*_All examples are taken from the [Head First Design Patterns](http://shop.oreilly.com/product/9780596007126.do)_

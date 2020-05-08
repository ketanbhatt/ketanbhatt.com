---
title: "Isolation Levels in database"
date: "2020-05-20"
category: programming
draft: true
---

How do databases work? Want to write in a manner so that everyone can understand, and so that I deeply understand. If I can explain it to a 5 year old, that means I know it now.

We will talk about transactions, what they are. What guarantees does the database provide. What are some faults that transactions guard against. And how does the database implement different isolation levels.

Doesn't talk about distributed transactions. I haven't reached there, but I am sure it will be a whole different can of worms.

## Transactions

- What are transactions
  - Grouping several reads and writes together into a logical unit. Conceptually, all the reads and writes in a transaction are executed as one operation: either the entire transaction succeeds (commit) or it fails (abort, rollback).

- Why were they created?
  - What faults can happen
  - What if there are no transactions --> Handle partial failures, lots of thinking and testing.
  - Transactions allow you to create fault-tolerance
  - Created to simplify the programming model for applications accessing a DB
  - Database provides safety guarantees

- Single object and Multi object transactions.
  - Explain

For a lot of us who work with databases and transactions, we tend to take it for granted. But how does the database actually provide these guarantees? How do transactions work?

> With the hype around this new crop of distributed databases, there emerged a popular belief that transactions were the antithesis of scalability, and that any large-scale system would have to abandon transactions in order to maintain good performance and high availability [5, 6]. On the other hand, transactional guarantees are sometimes presented by database vendors as an essential requirement for “serious applications” with “valuable data.” Both viewpoints are pure hyperbole. The truth is not that simple: like every other technical design choice, transactions have advantages and limitations. In order to understand those trade-offs, let’s go into the details of the guarantees that transactions can provide — both in normal operation and in various extreme (but realistic) circumstances.


## ACID

The safety guarantees that DB provide are described by ACID

- Well known, but poorly defined. Databases have their own meaning

> Today, when a system claims to be “ACID compliant,” it’s unclear what guarantees you can actually expect. ACID has unfortunately become mostly a marketing term. (Systems that do not meet the ACID criteria are sometimes called BASE, which stands for Basically Available, Soft state, and Eventual consistency [9]. This is even more vague than the definition of ACID. It seems that the only sensible definition of BASE is “not ACID”; i.e., it can mean almost anything you want.)

Not going into too much detail here as these concepts are spoken about a lot

- Atomicity - In the context of ACID, atomicity describes what happens when a fault occurs during multiple writes.
- Consistency
- Isolation
- Durability



## What are isolation levels, and why do we need them


## Some concepts

These concepts are needed so we can understand the defects
- Transactions
- Commit
- Rollback
- Concurrency (control)
- race conditions

## Defects
- Dirty reads
- Dirty writes
- Phantoms
- Read skew
- Write skew
- Lost updates


## Different types of isolation levels

## Read Committed

## Snapshot Isolation

## Serializable snapshot isolation

## Serializable

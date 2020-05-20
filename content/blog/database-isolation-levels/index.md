---
title: "Isolation Levels in database"
date: "2020-05-30"
category: programming
draft: true
---

How do databases work? Want to write in a manner so that everyone can understand, and so that I deeply understand. If I can explain it to a 5 year old, that means I know it now. Write for Chetan.

We will talk about transactions, what they are. What guarantees does the database provide. What are some faults that transactions guard against. And how does the database implement different isolation levels.

Doesn't talk about distributed transactions. I haven't reached there, but I am sure it will be a whole different can of worms.


I will begin with some concepts that you need to know before we go further. These are basic concepts and more advanced readers can skip this section, you will not miss anything.

## Some concepts

These concepts are needed so we can understand the defects
- Transactions
- Commit
- Rollback
- Concurrency (control)
- race conditions

## Defects
- Dirty reads
  - If a transaction has made some changes, but those changes are yet to be committed. Can another transaction see that uncommitted data? If yes, it is called a dirty read.
  - Examples of the problem caused by this.
  - Why it is preferable to avoid Dirty Reads
    - if a transaction is making multiple changes, another transaction might only be able to see part of the changes. This is confusing to users and could cause other transactions to take incorrect decisions
    - Another transaction might read and make decision based on an uncommitted change, but that change could get rolled back?
- Dirty writes
  - If a transaction has made some changes, but those changes are yet to be committed. Can another transaction overwrite that uncommitted data? If yes, it is called a dirty write.
  - Examples of the problem caused by this.
  - Why it is preferable to avoid Dirty Writes
    - Transactions might end up overwriting partial data for each other, leaving you in a messed up state that is a mix of the two transactions. Intermingled.
    -
- Read skew
  - This is an example of nonrepeatable read
  - Explain.
- Write skew
- Lost updates
- Phantoms

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


## Transaction Isolation
Why: It is hard enough to develop for a single user. If you have to keep in mind multiple users concurrently using your app, it becomes harder. In large systems, this is even harder since you might not know what part of the application is doing things.

So, database provides "Transaction Isolation". In theory, isolation should make your life easier by letting you pretend that no concurrency is happening. This is also called the "Serializable Isolation". This would be perfect, but has a performance cost.

Therefore, DBs support weaker levels of isolation.

Lots of DBs say they are ACID, but that misses the point. Lots of these databases use weak isolation levels, and won't prevent all bugs related to concurrency. This is why, it is good to develop an understanding of the problems that exist and then learn how to prevent them.


## Weak Isolation levels
Non serializable?

### Read Committed
Most basic. Two guarantees:
1. No dirty reads
2. No dirty writes

#### Implementation
Very popular. Default on Postgres, Oracle, MemSQL, SQL server. (find out where all).

Dirty Writes: Row level locks most common. Avoid dirty writes usually by delaying the second write until the first write's transaction has committed or aborted.

Dirty Reads: Changes only become visible to other transactions once they have been committed.
1. Row level locks. Doesn't work but because one long running transaction can block all reads.
2. Remember the old committed value + the new uncommitted value

#### Prevents
Dirty reads
Dirty Writes

#### Problems?
Read Skew

### Snapshot Isolation (OR Repeatable Read)
The idea is that each transaction reads from a consistent snapshot of the database, i.e., the transaction sees all the data that was committed in the database at the start of the transaction.

#### Implementation
Readers never block writers and writers never block readers.

1. Locks for writes
2. For reads? Genralisation of what we saw for Read Committed: MVVC.
  - Read committed uses a different snapshot for each query while snapshot isolation uses the same snapshot for an entire transaction.

MVVC: Link to better articles.

#### Naming confusion
Called Serializable, and Repeatable Read. Because SQL standard doesn't define snapshot isolation. Check before you trust your database


# NEXT UP: Preventing lost updates.



#### Prevents
Dirty reads
Dirty writes
Read Skew






## Handy table
Headers: Concurrency Defect, Isolation levels ✅❌

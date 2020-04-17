---
title: "Blazingly fast querying on huge tables by avoiding joins"
date: "2017-05-14"
redirect_from:
  - /2017/05/14/blazingly-fast-querying-on-huge-tables-by-avoiding-joins/
category: programming
---

![Cover Image](./images/cover.png)

**Tl;dr:** Avoid joins on large tables and evaluate parts of queries beforehand to get **100–10,000x performance gains**!

As mentioned in a [previous post](http://ketanbhatt.com/2017/05/14/blazingly-fast-querying-on-huge-tables-by-avoiding-joins/), because of some of our tables growing in size, our queries started performing poorly which resulted in a performance hit to our most used APIs. It was time we revisit some of these queries and do something that will give us the best possible outcome with the least effort.

## Diagnosis

Our old query (_that took 29 seconds to run_) was something on the lines of:

`select .. from .. inner join .. where (JOIN_PREDICATE);`

We used `EXPLAIN ANALYSE` and [explain.depesz.com](https://explain.depesz.com) to get an idea of the query that was being run. The reason our queries were running so slowly was:

1. In our case, there was a [`Hash Join`](https://www.depesz.com/2013/05/09/explaining-the-unexplainable-part-3/#hash) taking place, which would create a hash table from rows of one of the candidate tables which match the `join predicate`. Now this table can be quickly used for a lookup with the rows of the other candidate in the JOIN. **But** if we do this for two very large tables _(50m and 150m rows)_, it would mean a lot of memory being used up for the intermediate hash, as well as a lot of rows from the other candidate being looked up against this hash table.
2. Appropriate indices weren’t being used in the prepared queries. That could be due to [various reasons](https://www.depesz.com/2010/09/09/why-is-my-index-not-being-used/).

## Solution

Armed with the knowledge, **we thought that if we could just remove the** **`JOIN`** **from the query, it should return faster.**

We basically had to convert:

`select .. from .. inner join .. where (JOIN_PREDICATE);`

to:

`select ... from .. where (column_value IN (1, 2, 3))`

where `column_value IN (1, 2, 3)` is the _result_ of the `JOIN_PREDICATE` ran separately before.

> Our experiments showed us that there were huge performance gains. Our queries **went down from taking 29 seconds to a few milliseconds!**

## I don’t believe you

Let’s create two tables:

1. `User`
2. `Purchase`

Each `user` can have multiple `purchases`.

The code for creating the tables and inserting data is as follows:

`gist:ketanbhatt/9bfe77cfd2470bf2541f4b987dc482bf`

### What is the query for?

We want to **get all the purchases for the given account IDs.**

### Run 1: Join Query

`gist:ketanbhatt/5699b09bee5475e3f7dcef5abd128f4b`

Here is the `EXPLAIN ANALYSE` output for this query: [https://explain.depesz.com/s/kGP](https://explain.depesz.com/s/kGP)

**Time taken: 100conds**

### Run 2: Evaluate and Select

`gist:ketanbhatt/9771b4caa5f9ef2fe6aaa32935e8cb17`

Here is the `EXPLAIN ANALYSE` output for this query: [https://explain.depesz.com/s/9dE](https://explain.depesz.com/s/9dE)

**Total Time taken: 7 ms**

## Results

Join Query: 100 seconds

Evaluate and Select: 7milliseconds

**Performance Gain: 10,000x**

## Notes

1. Tested on `postgresql 9.6.2`
2. Huge gains only when the `join predicate` matches 100+ rows, otherwise performance will be more or less the same in both the cases.

(Originally [posted on my Medium account](https://medium.com/squad-engineering/blazingly-fast-querying-on-huge-tables-by-avoiding-joins-5be0fca2f523))

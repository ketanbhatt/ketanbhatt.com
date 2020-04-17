---
title: "Postgres: Recreating Indexes supporting Unique, Foreign Key and Primary Key Constraints"
date: "2019-08-16"
description: "I have frequently found myself in situations when I had to reindex a few indexes (because the index got bloated a lot), and I always have to lookup the exact commands, after searching quite a bit, just to be sure that I am doing the right thing and not making a mistake."
redirect_from:
  - /2019/08/16/recreating-indexes-supporting-unique-foreign-key-and-primary-key-constraints/
category: programming
---

I have frequently found myself in situations when I had to reindex a few indexes (because the index got bloated a lot), and I always have to lookup the exact commands, after searching quite a bit, just to be sure that I am doing the right thing and not making a mistake.
In the past, I have referred to the articles I have written multiple times, and I thought I need to create another Reference Guide for myself for this. Hopefully, others on the internet will also found this reference useful.

#### Some basic tips:

1. If you have a large and/or a table which gets a lot of traffic, remember that a plain `REINDEX` command will take a lock on the table that won't allow any `write` operations on the table till the command completes. Reindexing `CONCURRENTLY` is almost always a better option out. You can read more about it in the official docs: [Building Indexes Concurrently](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY).
2. Remember to `set statement_timeout = 0;` before running the reindex command since `CREATE INDEX` commands are also taken as `statements` by Postgres, and they will be killed if they go above a decided threshold.
3. To figure out indexes that a table has and the corresponding bloat percentage for each of them, you can use [this query](https://gist.github.com/mbanck/9976015/71888a24e464e2f772182a7eb54f15a125edf398) (we picked it up from [PgHero's codebase](https://github.com/ankane/pghero/blob/f1183eae03a0f6fca408b899c41476c9cebc627b/lib/pghero/methods/indexes.rb#L187)). We add a `table_name = 'my_sweet_table'` to the `WHERE` clause at the end of the query to only get the indexes for our table, but that is completely optional.
4. You can also use a [simple query to get the definition of all the indexes for a table](https://gist.github.com/ketanbhatt/fdbd6246b4b1b7bb32009de5e468ed57). These definitions can be used as is when we want to recreate them.

## Recreating Indexes supporting Foreign Key constraints

_Indexes that are not created for a constraint can be reindexed in the same way._

We have the definition of the original index, we can just replace the name with a temporary name and use `CONCURRENTLY`:

```sql
CREATE INDEX CONCURRENTLY
  new_idx
ON my_sweet_table USING
  btree (my_fk_column);
```

Now you can safely drop the original index. You can optionally use `CONCURRENTLY` here as well, read more about it in the docs: [Drop Index](https://www.postgresql.org/docs/current/sql-dropindex.html).

```sql
DROP INDEX my_lovely_index;
```

You could also rename the new index to the original name (some frameworks, like Django, autogenerate index names using the table name, the app's name, and a hash of both of these plus the columns of the model. You might want to preserve that name).

```sql
ALTER INDEX
  new_idx
RENAME TO
  my_lovely_index;
```

Also, if the index you are recreating is a unique index, you can add the keyword `UNIQUE` to the `CREATE INDEX` command.

## Recreating Indexes supporting Unique constraints

Recreate the Index, with the keyword `UNIQUE`.

```sql
CREATE UNIQUE INDEX CONCURRENTLY
  new_uniq_idx
ON my_sweet_table USING
  btree (col_a, col_b);
```

Now, we want the constraint to use this new index. For that, we drop the original constraint, and add a new unique constraint that uses our new index. This is done in one atomic statement so that there is no time when there is no constraint on the table.
We don't have to rename the index this time as Postgres automatically renames it to the name of the constraint.

```sql
ALTER TABLE
  my_sweet_table
DROP CONSTRAINT
  uniq_constraint_777,
ADD CONSTRAINT
  uniq_constraint_777 UNIQUE
USING INDEX
  new_uniq_idx;
```

## Recreating Indexes supporting Primary Key constraints

This is achieved in the same manner as we did for recreating the index for a unique constraint. The only difference is that this time the constraint that we add is a `PRIMARY KEY` constraint, of course :D

```sql
CREATE UNIQUE INDEX CONCURRENTLY
  new_pkey_idx
ON my_sweet_table USING
  btree (id);

ALTER TABLE
  my_sweet_table
DROP CONSTRAINT
  my_sweet_table_pkey,
ADD CONSTRAINT
  my_sweet_table_pkey PRIMARY KEY
USING INDEX
  new_pkey_idx;
```


That's it! Tadaaaa.

---
title: Postgres - Recreating Indexes supporting Unique, Foreign Key and Primary Key Constraints
date: "2019-08-16T10:00:00.000Z"
description: "I have frequently found myself in situations when I had to reindex a few indexes (because the index got bloated a lot), and I always have to lookup the exact commands, after searching quite a bit, just to be sure that I am doing the right thing and not making a mistake. In the past, …"
---

I have frequently found myself in situations when I had to reindex a few indexes (because the index got bloated a lot), and I always have to lookup the exact commands, after searching quite a bit, just to be sure that I am doing the right thing and not making a mistake.
In the past, I have referred to the articles I have written multiple times, and I thought I need to create another Reference Guide for myself for this. Hopefully, others on the internet will also found this reference useful.

#### Some basic tips:

<!-- wp:list {"ordered":true} -->
<ol><li>If you have a large and/or a table which gets a lot of traffic, remember that a plain <code>REINDEX</code> command will take a lock on the table that won't allow any <code>write</code> operations on the table till the command completes. Reindexing <code>CONCURRENTLY</code> is almost always a better option out. You can read more about it in the official docs: <a href="https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY">Building Indexes Concurrently</a>.</li><li>Remember to <code>set statement_timeout = 0;</code> before running the reindex command since <code>CREATE INDEX</code> commands are also taken as <code>statements</code> by Postgres, and they will be killed if they go above a decided threshold.</li><li>To figure out indexes that a table has and the corresponding bloat percentage for each of them, you can use <a href="https://gist.github.com/mbanck/9976015/71888a24e464e2f772182a7eb54f15a125edf398">this query</a> (we picked it up from <a href="https://github.com/ankane/pghero/blob/f1183eae03a0f6fca408b899c41476c9cebc627b/lib/pghero/methods/indexes.rb#L187">PgHero's codebase</a>). We add a <code>table_name = 'my_sweet_table'</code> to the <code>WHERE</code> clause at the end of the query to only get the indexes for our table, but that is completely optional.</li><li>You can also use a <a href="https://gist.github.com/ketanbhatt/fdbd6246b4b1b7bb32009de5e468ed57">simple query to get the definition of all the indexes for a table</a>. These definitions can be used as is when we want to recreate them.</li></ol>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Recreating Indexes supporting Foreign Key constraints</h2>
<!-- /wp:heading -->


<p><em>Indexes that are not created for a constraint can be reindexed in the same way.</em></p>
<!-- /wp:paragraph -->


<p>We have the definition of the original index, we can just replace the name with a temporary name and use <code>CONCURRENTLY</code>:</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">CREATE INDEX CONCURRENTLY
  new_idx
ON my_sweet_table USING
  btree (my_fk_column);</pre>
<!-- /wp:syntaxhighlighter/code -->


<p>Now you can safely drop the original index. You can optionally use <code>CONCURRENTLY</code> here as well, read more about it in the docs: <a href="https://www.postgresql.org/docs/current/sql-dropindex.html">Drop Index</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">DROP INDEX my_lovely_index;</pre>
<!-- /wp:syntaxhighlighter/code -->


<p>You could also rename the new index to the original name (some frameworks, like Django, autogenerate index names using the table name, the app's name, and a hash of both of these plus the columns of the model. You might want to preserve that name).</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">ALTER INDEX
  new_idx
RENAME TO
  my_lovely_index;</pre>
<!-- /wp:syntaxhighlighter/code -->


<p>Also, if the index you are recreating is a unique index, you can add the keyword <code>UNIQUE</code> to the <code>CREATE INDEX</code> command.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Recreating Indexes supporting Unique constraints</h2>
<!-- /wp:heading -->


<p>Recreate the Index, with the keyword <code>UNIQUE</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">CREATE UNIQUE INDEX CONCURRENTLY
  new_uniq_idx
ON my_sweet_table USING
  btree (col_a, col_b);</pre>
<!-- /wp:syntaxhighlighter/code -->


<p>Now, we want the constraint to use this new index. For that, we drop the original constraint, and add a new unique constraint that uses our new index. This is done in one atomic statement so that there is no time when there is no constraint on the table. <br>We don't have to rename the index this time as Postgres automatically renames it to the name of the constraint.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">ALTER TABLE
  my_sweet_table
DROP CONSTRAINT
  uniq_constraint_777,
ADD CONSTRAINT
  uniq_constraint_777 UNIQUE
USING INDEX
  new_uniq_idx;</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:heading -->
<h2>Recreating Indexes supporting Primary Key constraints</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is achieved in the same manner as we did for recreating the index for a unique constraint. The only difference is that this time the constraint that we add is a <code>PRIMARY KEY</code> constraint, of course :D</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"sql"} -->
<pre class="wp-block-syntaxhighlighter-code">CREATE UNIQUE INDEX CONCURRENTLY
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
  new_pkey_idx;</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:separator -->
<hr class="wp-block-separator"/>
<!-- /wp:separator -->

<!-- wp:paragraph -->
<p>That's it! Tadaaaa.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><em>(Feature Image: Photo by&nbsp;<a href="https://unsplash.com/@ninjason?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Jason Leung</a>&nbsp;on&nbsp;<a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></em>)</p>
<!-- /wp:paragraph -->

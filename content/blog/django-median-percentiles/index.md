---
title: "Hack Django ORM to calculate Median and Percentiles (Or make annotations great again!)"
date: "2017-07-08"
redirect_from:
  - /2017/07/08/hack-django-orm-to-calculate-median-and-percentiles-or-make-annotations-great-again/
category: programming
---

Hacks should be quick. And so should be the articles about them.

![Cover Image](./images/cover.png)
*Photo by [Caspar Rubin](https://unsplash.com/photos/fPkvU7RDmCo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/)*

## Problem

We needed to calculate medians, percentiles for some quantities for our own ETL system _(note to self: write a post on this)_ grouped by certain fields.

Some options we had:

1. [Extra](https://docs.djangoproject.com/en/1.11/ref/models/querysets/#extra): But Django says this will be deprecated, and use it as a last resort. We still had resorts to explore.
2. [Raw SQL](https://docs.djangoproject.com/en/1.11/topics/db/sql/): _Besides_ all usual bad things with writing RAW SQL (look at the number of warnings on the linked page!), the code starts to look ugly.

So what was the best way to do it?

Come on! Django also gives us something called a **[RawSQL](https://docs.djangoproject.com/en/1.11/ref/models/expressions/#raw-sql-expressions)**. Great. So we can just use it to get the percentiles we wanted. _Right?_

**Wrong**. As we realised later, RawSQL is better suited for aggregates and not annotations. Exhibit:

`gist:ketanbhatt/5522896c4e0fe2d9a5a9554743caf4be`

Notice how our Raw expression `percentile_disc(0.9) WITHIN GROUP (ORDER BY duration)` also gets added to the `GROUP BY` clause?

This would not happen if we remove the `Avg("duration")` from annotation. So basically, if the query already has a `GROUP BY` clause, `RawSQL` will add the `sql` to the `GROUP BY` clause as well.

This is not what we want. It also didn’t make sense to us, **why is that needed?** Maybe when we want to use `RawSQL` in an `order_by` and want the expression to get added to `GROUP BY` automatically? _Maybe._

## Solution

We dug deep as to why is the sql added to `GROUP BY`. Looked at the [source code](https://docs.djangoproject.com/en/1.11/_modules/django/db/models/expressions/#RawSQL), found this method `get_group_by_cols` which returns `self`. Super sensible naming by Django devs. I knew we could do something here. Ergo, the Hack:

`gist:ketanbhatt/609b9fb71e82bcd10b7c436c7dc3b09b`

**We created a class** **`RawAnnotation`** **and overrode** **`get_group_by_cols`** **to return an empty array.** And now it works as expected.

Yay.

(Originally [posted on my Medium account](https://medium.com/squad-engineering/hack-django-orm-to-calculate-median-and-percentiles-or-make-annotations-great-again-23d24c62a7d0))

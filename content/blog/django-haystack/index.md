---
title: "ElasticSearch, Django and Haystack"
date: "2016-04-19"
redirect_from:
  - /2016/04/19/elasticsearch-django-with-haystack/
---

**TLDR;** Use [`squadrun/django-haystack`](https://github.com/squadrun/django-haystack) and live your life happily. Also always index in batches. Also, read the whole of it.

A problem our Operations Team at [Squad](https://www.squadplatform.com/) was facing was how slow the searches on the Admin panel used to work. It wasn't surprising though. We had around _30 Million to 8 Hundred Thousand rows_ in different models. Now that is not a lot of data, but it is certainly a lot if you want to search on a lot of text and non-text fields simultaneously. We also didn't want our database to spend resources on the search queries. At a time when the database is already under load, these searches would:

1. Return late
2. Use even more resources of the database already under load

We decided this needs to stop as it kills the team's effectiveness. So we planned to index those models which are frequently searched in an ElasticSearch (ES) server. We also needed a way to integrate ES with the django admin (because we do searches only from the admin). We had two options:

1. Custom implementation for the search, and using ES APIs directly
2. Something like [Haystack](https://github.com/django-haystack/django-haystack) which handles all of this for you.

It is advisable for you to directly deal with ES's API if you have something complex in your mind, or if you are an expert with ES (but then you wouldn't have been reading this). If your goal is just to do away with admin searches hitting your database, and want to plug in ES into the flow, I suggest haystack will serve you well.

## Is that it?

No, haystack hasn't been updated in a while ([121](https://github.com/django-haystack/django-haystack/pulls) and [320](https://github.com/django-haystack/django-haystack/issues) open PRs and issues as of 22-04-2016) and thus lacks a lot of features. Here are the problems we faced and solved:

1. Updating index every time a row is added/updated is time taking, and sometimes updates happen in bulk (`MyModel.objects.filter(old_stuff=True).update(old_stuff=False)`), and this won't get updated in the index automatically.
2. Defining what fields to index using templates takes me away from code, and every time I want to find what fields I am indexing, I will have to dig out the template file for the model. Cumbersome.
3. Indexing was slow if you were indexing fields across tables.
4. **No filter and ordering support** :(
5. [Django haystack EdgeNgramField gives different results than elasticsearch](http://stackoverflow.com/questions/20430449/django-haystack-edgengramfield-given-different-results-than-elasticsearch).
6. The `edgengram` tokenizer and filter's `min_gram` and `max_gram` were in the range 3-15, that meant words like `a, an, of` won't get indexed and a search for `King of Nepal` will not return anything because `of` is not in the index and so there is no match. We could ask our team to eliminate such words from their searches, but that is not just it is supposed to be done, we wanted to make their life easy, and not make them remember new rules.

## All I see is complaints

Me too, here is what we did to solve them:

### Updating Index asynchronously And indexing everything else that was left

This one is a no-brainer and is even suggested in haystack's docs. Use [celery-haystack](http://celery-haystack.readthedocs.org/en/latest/) to update index asynchronously. (Gotcha! --> add `CELERY_HAYSTACK_COUNTDOWN = 2` to your settings, otherwise you are going to get a lot of `DoesNotExist` errors)

So celery-haystack works by catching save/delete signals that django throws. Cool? Not yet.

What about updates/creates that happen in bulk? No signals are emitted for those and that would mean those things will never be indexed. This is not ideal. You can not stop updating/creating in bulk because of this. So, we decided to run a cron every 10 minutes that reindexes everything that was created/updated in the last 10 minutes.

How did we know what happened in the last 10 minutes? We have an `updated_at` field in the models we are indexing so that combined with haystack's [`update_index`](http://django-haystack.readthedocs.org/en/v2.4.1/management_commands.html#update-index) management command and its `age` parameter, we were able to achieve it. Another problem. When we do a `queryset.update()` in django, `auto_now` fields are not updated. Now what? Now a little hack :grin:

`gist:ketanbhatt/0475bb5ea6e1696f063e222baaec421f`

We use this function wherever we are doing a `queryset.update()`. So this is solved.

### Make haystack templates obsolete and faster indexing

1. Need to index faster --> Use `select_related` while fetching objects to index
2. Track indexed fields in code --> Get inspired by django admin's implementation of `readonly_fields`

So we coded a mixin:

`gist:ketanbhatt/8fcc274102a78c393996326454a05e21`

`gist:ketanbhatt/0475bb5ea6e1696f063e222baaec421f`

Self explanatory. Add this mixin to your search indexes classes. Also implements `get_updated_field` because I didn't want to copy this code everywhere.

### Solve problem I can't seem to find a name for and modify token's length

For that, we overrode the `ElasticsearchSearchEngine` class and came up with:

`gist:ketanbhatt/ddb3c0706e9950e4ce7162bf10be93d7`

Now plug this Backend for your `ENGINE` key in `HAYSTACK_CONNECTIONS` settings, and you are golden.

### Fix filtering and ordering

Yo, Done! Read on to know more.

## So do I copy all of this into my code?

No, you can just use [`squadrun/django-haystack`](https://github.com/squadrun/django-haystack) and get all these things done for you (even fixed the filtering!). Go on, check the [Diff between the original and this fork](https://github.com/django-haystack/django-haystack/compare/master...squadrun:master) if you don't trust me.

This is how my indexes look:

`gist:ketanbhatt/206ee53228a534ef0be625390fa16e4c`


See any mistakes in the fork, send a PR. Want to do similar things and solve problems, send an Email!

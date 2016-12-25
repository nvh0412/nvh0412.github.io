---
layout: post
title:  "Does N+1 is actually a bug?"
date:   2016-10-25
background_header: nplus1.jpg
subtitle: ""
---

# N+1 is a feature

Solving this issue with eager loading may not alway be best

To be clear, N+1 queries in your applications are bad. That they are a default
behaviour through due to lazy loading in Rails enables developers to take
advantage of Russian Doll caching to tune performance - a necessary step to
scale Ruby Apps.

One of many mantras one leanrs on the path to "Rails Enlightenment" is:

BEWARE OF THE N+1 QUERY!

You might be supprised to hear the conventional advice around fixing the N+1
problem may not always be the best option.

## Everyone's favorite issue

To refresh, a N+1 query occurs when an association for requested resource leads
to N additional separate queries. Here's what an N+1 query looks like in the Rails
log

{% highlight ruby %}
Started GET "/posts" for ::1 at 2016-09-18 07:26:15 -0400
Processing by PostsController#index as HTML
  Rendering posts/index.html.erb within layouts/application
  Post Load (2.2ms)  SELECT "posts".* FROM "posts" ORDER BY
"posts"."published_at" DESC
  Author Load (0.2ms)  SELECT  "authors".* FROM "authors" WHERE "authors"."id" =
$1 LIMIT $2  [["id", 90], ["LIMIT", 1]]
  Author Load (0.1ms)  SELECT  "authors".* FROM "authors" WHERE "authors"."id" =
$1 LIMIT $2  [["id", 82], ["LIMIT", 1]]
  Author Load (0.1ms)  SELECT  "authors".* FROM "authors" WHERE "authors"."id" =
$1 LIMIT $2  [["id", 83], ["LIMIT", 1]]
{% endhighlight %}

A quick search N+1 rails reveals many posts describing "eager loading" as state
that the `silver bullet` to this problem.

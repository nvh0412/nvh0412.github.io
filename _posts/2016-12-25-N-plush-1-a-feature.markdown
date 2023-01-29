---
layout: post
title:  "Does N+1 is actually a bug?"
date:   2016-10-25
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

There is actually a gem called `bullet` that will help resolve `N+1` issues with
warnings and suggestions right in your logs to use eager loading where
appropriate.

Typically, this means changing a statement like `Post.all` to
`Post.all.includes(:author)` to ensure the authors records are loaded in a
seperate query or through a complex join. This a really useful technique to
reduce the numberof queries you're making in your Rails apps to improve response
times. We may have even wondered why Rails doesn't just eager load for us.

## When gurus chat

Now consider this. Back in April, DHH says this:

> N+1 is a feature

WTF? But all those queries!

Here's the rest of what he said about it:

> N+1 is a feature, which is usually seen as a bug, right?

> If you have N+1 query it means you're executing one SQL query per element so
> if you have 50 emails in an inbox, that'd be 50 SQL calls, right? That sound
> like a bug. Well in a Russian doll cacing setup, it's not a bug, it's a
> feature. **The beauty of those individual calls are that they're individually
> cached**, on their own timeline, and that they're super simple.
> Because the whole way you get around doing N+1 queries is you do joins; you do
> more complicated queries that take longer to compute, and tax the database
> harder. If you can simplify those queries so that they're super simple, but
> there's just more of them, well, you win if and only if you have a caching
> strategy to support that.

Now I don't agree with everything DHH says, but it's an interesting take on the
issue. When he say N+1 is a feature, I believe what he really means is that
"lazy loading", which the ActiveRecord query interface uses by default, along
with a proper caching strategy can be a bing advantage. It's this aspect of
Rails that has enabled his team to squeeze out sub-100ms response times at
Basecamp.

## Hmm, example please

Let's illustrate DHH's point with a simple example where we have a Rails app
that renders an index of **Post** models at **/posts**. Each **Post** belongs to
an **Author** whose details are rendered inline on the index page

{% highlight ruby %}
# app/models/post.rb
class Post < ApplicationRecord
  belongs_to :author
end

# app/models/author.rb
class Author < ApplicationRecord
  has_many :posts
end

# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  def index
    @posts = Post.all.order(published_at: :desc)
  end
end

# posts/index.html.erb
<% @posts.each do |post| %>
  <div>
    <h2><%= link_to post.title, post %><h2>
    <%= render post.author %>
  </div>
<% end %>
{% endhighlight %}

Rendering this page will reveal the N+1 query in our Rails log, where each
author is queried individually for each post.

{% highlight ruby %}
# log/development.log

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
  #...
{% endhighlight %}

The common suggestion to fix this N+1 query is to use `includes` to eager load
the author records. Now our N+1 query is reduced to two queries: one for all the
posts and one for all the authors.

{% highlight ruby %}
class PostsController < ApplicationController
  def index
    @posts = Post.all.order(published_at: :desc).includes(:author) # eager loads
authors
  end
end
{% endhighlight %}

{% highlight ruby %}
Started GET "/posts" for ::1 at 2016-09-18 07:29:09 -0400
Processing by PostsController#index as HTML
  Rendering posts/index.html.erb within layouts/application
  Post Load (2.2ms)  SELECT "posts".* FROM "posts" ORDER BY
"posts"."published_at" DESC
  Author Load (0.4ms)  SELECT "authors".* FROM "authors" WHERE "authors"."id" IN
(90, 82, 83, 89, 81, 84, 85, 86, 87, 88)
  # rendering
{% endhighlight %}

Let's say we later add fragment caching to the vew by wrapping each post in a
cache block:

{% highlight ruby %}
<% @posts.each do |post| %>
  <% cache post do %>
    <div>
      <h2><%= link_to post.title, post %><h2>
      <%= render post.author %>
    </div>
  <% end %>
<% end %>
{% endhighlight %}

With caching enabled and while eager loading authors in our controller, we can
see the fragment caching at work in the Rails log. Since the cache is cold on
the first page render, you'll see alternating Reads that miss and subsequence
Writes for posts and authors.

{% highlight ruby %}
Started GET "/posts" for ::1 at 2016-09-18 08:25:17 -0400
Processing by PostsController#index as HTML
  Rendering posts/index.html.erb within layouts/application
  Post Load (1.3ms)  SELECT  "posts".* FROM "posts" ORDER BY
"posts"."published_at" DESC LIMIT $1  [["LIMIT", 20]]
  Author Load (0.3ms)  SELECT "authors".* FROM "authors" WHERE "authors"."id" IN
(90, 82, 83, 89, 81, 84, 85, 86, 87, 88)
  Read fragment
views/posts/679-20160918112202701660/e554fd834425697f04b28a155f7cfd0d (0.1ms)
  Read fragment
views/authors/90-20160918113201462920/5c4a91f59546eb97daa8693b93d7c376 (0.0ms)
  Write fragment
views/authors/90-20160918113201462920/5c4a91f59546eb97daa8693b93d7c376 (0.1ms)
  Rendered authors/_author.html.erb (4.0ms)
  Write fragment
views/posts/679-20160918112202701660/e554fd834425697f04b28a155f7cfd0d (0.3ms)
  Read fragment
views/posts/725-20160918120741840748/e554fd834425697f04b28a155f7cfd0d (0.0ms)
{% endhighlight %}

With the cache now warm, still using `includes` in the controller, we see the
two queries and reads for each post:

{% highlight ruby %}
Started GET "/posts" for ::1 at 2016-09-18 08:27:36 -0400
Processing by PostsController#index as HTML
  Rendering posts/index.html.erb within layouts/application
  Post Load (1.5ms)  SELECT  "posts".* FROM "posts" ORDER BY
"posts"."published_at" DESC LIMIT $1  [["LIMIT", 20]]
  Author Load (0.8ms)  SELECT "authors".* FROM "authors" WHERE "authors"."id" IN
(90, 82, 83, 89, 81, 84, 85, 86, 87, 88)
  Read fragment
views/posts/679-20160918112202701660/e554fd834425697f04b28a155f7cfd0d (0.1ms)
  Read fragment
views/posts/725-20160918120741840748/e554fd834425697f04b28a155f7cfd0d (0.0ms)
{% endhighlight %}

Notice that the authors are still queried because we're still eager loading even
though this data won't be use in a warm cache.What a waste! In truth, it doesn't
matter much for this simplistic example, but we can imagine an eager-loaded
complex query creating a problem for us in a real world use case.

We can eliminate the wasted authors query by removing the `includes` method call
from our controller. Now our fully-cached page request requires only one query
for the posts:

{% highlight ruby %}
Started GET "/posts" for ::1 at 2016-09-18 07:41:09 -0400
Processing by PostsController#index as HTML
  Rendering posts/index.html.erb within layouts/application
  Post Load (2.3ms)  SELECT "posts".* FROM "posts" ORDER BY
"posts"."published_at" DESC
  Read fragment
views/posts/679-20160918112202701660/8c2dcb06ead7afb44586a0d022005ef0 (0.0ms)
  Read fragment
views/posts/725-20160918112202826113/8c2dcb06ead7afb44586a0d022005ef0 (0.0ms)
{% endhighlight %}

In either case, we want to be sure the post cache is expired if the author
details change. We just need to create an action for updating data of author.

Now that we're no longer eager loading authors, only the posts and authors
who've been updated need to be rewritten to cache.

Assuming authors and posts aren't updated frequently, leaving N+1 query in place
along with a proper Russian Doll caching scheme might better for overall app
performance than triggering complex eager loading queries on every request.

## Go forth and measure

Eager Loading may not always be the best the cure for our N+1 ailments.

The intention of this article isn't to throw shit to eager loading - it's a
important tool to have in your toolbox. This article encourages Rails Developers
to understand how lazy loading and N+1 queries allow for Russian Doll caching to
be a usefull alternative to addressing performance bottlenecks in your Rails
applications.

Keep in mind, Russian Doll caching may not the best approach for your app,
especially if that cache is frequently updated or cleared, so it's up to you to
determine the best approach.

Just beware of silver bullets.


---
layout: post
title:  "ActiveSupport Thread specific class or Module level variables"
date:   2021-03-20
background_header: say-hi-2019.jpg
subtitle: ""
---

# ActiveSupport Thread variables

This blog is part of my Rails Series.

Rails, particularly Active Support, provides us with methods for creating Thread level variables.

Instead of polluting the thread locals namespace:

{% highlight ruby %}
Thread.current[:current_user] = user
{% endhighlight %}

We can use ActiveSupport Utilities, and these ways are accomplished by instantiating the class and storing the instances as a thread local keyed by the class name

### [ActiveSupport::PerThreadRegistry](https://api.rubyonrails.org/classes/ActiveSupport/PerThreadRegistry.html)

Here is an example how to demonstrates how to use it:

{% highlight ruby %}
module VagabondBlog
  class Authentication
    extend ActiveSupport::PerThreadRegistry

    attr_accessor :current_user
  end
end
{% endhighlight %}

And now, we can set current_user to current thread by invoking the declared instance accessor as class method

{% highlight ruby %}
VagabondBlog::Authentication.current_user = 123132
{% endhighlight %}

From now on, we can get its value from curren thread via that declared instance accessor as class method like we use it to set value into

{% highlight ruby %}
VagabondBlog::Authentication.current_user
{% endhighlight %}

returns the current user local to the current thread.

As I mentioned above, this way is accomplished by instantiating the class and `storing the instances as a thread local keyed by the class name`

So we can verify this thing by accessing to `Thread.current`

{% highlight ruby %}
Thread.current['VagabondBlog::Authentication']
=> #<VagabondBlog::Authentication:0x00007fa9c6140088 @current_user=123132>
{% endhighlight %}

### [thread_mattr_accessor](https://api.rubyonrails.org/classes/Module.html#method-i-thread_mattr_accessor)

In Rails 5, we have another way to archive the same outcome with ActiveSupport::PerThreadRegistry in an atrribute syntax oriented

Here is an example which demonstrates an example on how to use it.

{% highlight ruby %}
module VagabondBlog
  class Authentication
    thread_mattr_accessor :current_user
  end
end
{% endhighlight %}

And we can access its value inside current thread as the same way with ActiveSupport::PerThreadRegistry

{% highlight ruby %}
VagabondBlog::Authentication.current_user
{% endhighlight %}

returns the current user local to the current thread.

So if you have used PerThreadRegistry before for managing global variables, `thread_mattr_accessor` & `thread_cattr_accessor` methods can be used in place of it starting from Rails 5.

Note: `thread_cattr_accessor` alias for `thread_mattr_accessor`

These both APIs are nicer way to deal with Global variables, we all know that Global Variables are generally bad and we should avoid to use them, but in some situation, we have to deal with them, then this change provides nicers a API if we want to fiddle with Thread level variables anyway!

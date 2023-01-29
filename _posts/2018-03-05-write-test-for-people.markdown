---
layout: post
title:  "Write test for People"
date:   2018-03-05
subtitle: ""
---

# Write test for People

**YOU ARE WRITING AUTOMATED TESTS** for some or all of your production code, GREAT! You are writing your tests before you write your code? Even better!
Just doing this one makes you one of the early adopters on the leading edge of software engineering practice.

**But are you writing the good tests?**, How can you tell?

One way to ask, **Who am i writing the tests for?** If the answer is **For me, to save me the effort of fixing bug** or **Just for compiler can be executed**
then the odds are you aren't writing the best possible tests. So who should you be writing tests for? The answer is for the people who are trying to understand you code.

Good tests act as documentation for the code they are testing. They describe how the code works. For each usage scenario, the tests:

* Describe the context, starting point, or preconditions that must be satisfied.
* Illustrate how the software is invoked.
* Describe the expected results or postconditions to be verified.

Different usage scenarios will have slightly different version of each of these. The person who're trying to understand your code should be able to look at a few tests, and by
comparing these three parts of the tests in question, be able to see what causes the software to behave differently. Each test should clearly illustrate the cause and effect relationship among these three parts.

This implies that what isn't visible in the test is just as important as what is visible. Too much code in the test distracts the reader with unimportant trivia. Whenever possible, hide such trivia behind meaningful method calls - the Extract Method refactoring is your best friend. And make sure you give each test a meaningful name that describe the particular usage scenario so the test reader doesn't have to reverse-engineer each test to understand what the various scenarios are. Between them, the test class and the class method should include at least the starting point and how the software is being invoked. It can be useful to include the expected results in the test method names as long as it doesn't cause the names to be too
long  to see or read.

It is also a good idea to test your tests. You can verify that they detect the errors you think they detect by inserting those errors into the production code (your own private cope that you'll throw away, of course). Make sure they report the errors by a meaningful and helpful way. You should also verify your tests speak clearly to a person trying to understand your code. The only way to do this is to have someone who isn't familiar with your code read your tests and tell you what they learned. Listen carefully what they say. If they didn't understand something clearly, it probably isn't because they aren't very bright. It is more likely that you weren't very clear. (Go ahead and reverse the roles by reading their tests!)

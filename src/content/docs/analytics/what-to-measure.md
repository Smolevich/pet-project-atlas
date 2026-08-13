---
title: The numbers worth reading weekly
description: A dashboard with forty numbers hides growth in noise. The short list — impressions, clicks, index share, signups, activation, repeat use — and what each one answers.
updated: 2026-08-12
sources:
  - https://support.google.com/webmasters/answer/7576553
  - https://support.google.com/webmasters/answer/7440203
  - https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
  - https://developers.google.com/search/docs/monitor-debug/search-console-start
  - Search Console API, property telegram-voice-bot, measured 2026-08-12
---

## What we are solving

My dashboard had forty numbers on it and every one of them moved last week, which sounds like a lot of information and turns out to be none of it. At these volumes most of that movement is the volume being small, not the project being alive.

What actually works is a short list read on a fixed day, and the test for getting onto that list is narrow. A number has to answer something none of the others answer. If two of them answer the same question, one is decoration and can go.

## Steps

### Does search consider me an answer to anything at all

Impressions, in the Performance report, which opens from the property's left-hand navigation in Search Console. They move before clicks do, so a page you published on Monday shows up here first and nowhere else for a while.

Read the count of distinct queries next to them, because the pair says something neither number says alone. A rising query count means new demand found you. A flat one with impressions climbing means the same page was simply shown more often, which is a different event entirely.

### Is this a ranking problem or a packaging problem

Clicks and average position, always read as a pair. Impressions with no clicks at a decent position is a title and snippet problem. Rewriting the body is then the wrong afternoon of work — the reader never got as far as the body to be disappointed by it.

Read the position here and not in a panel. On one of my queries an outside estimate said 20 while this report said 43.3, and the gap between those two numbers is written out in [what a paid rank tracker measures](/tools/paid-tools/).

### How much of what I wrote can even rank

The share of your pages actually in the index. The denominator is the URLs you submitted, the numerator is the URLs the report says are indexed. A count of indexed pages on its own is fiction, because it never says out of how many.

The Page indexing report gives you the shape of the problem. The URL Inspection API gives per-URL truth when you need to know about one page rather than about the site.

### Is there anyone in this traffic who wants the thing

Signups, with your own accounts taken out. Keep an explicit list of internal ids and subtract before you aggregate rather than after, because after is where the founder's own account quietly becomes a user.

Count people, not events. Three purchases by one person are one customer with a habit, and a table that does not know the difference will tell you the opposite.

### Did anyone actually get the thing

Activation, meaning the first action after which a person has the value you built rather than an account. Creating the account is not it, and pressing start is not it either.

Name that one action out loud, in a sentence, before you measure anything. Then the metric is the share of arrivals who reach it, and if you cannot name the action, there is no metric yet — there is a chart.

### Do I have a product or a demo

Repeat use on a later day, without a reminder from you. This is the number that separates something people use from something people tried.

Cohort it by the week of first contact. Pooling everyone hides falling retention behind new arrivals, and the pooled line stays flat while every individual week gets worse.

### What do I compare today's number against

One snapshot a week, same weekday, same window, appended to a file you keep. A rolling 28-day window takes the weekday effect out, which matters when a Tuesday and a Saturday differ by more than a month of growth does.

Keep the series. A number with nothing to compare itself against a month ago is decoration.

### Why the total never tells me what to fix

Two readings changed what I actually worked on, and neither of them is visible in any total.

The first was breaking activation down by first action. On one project the two possible first actions came back at different rates, which told me which of the two paths to put in front of new users. The aggregate had been saying nothing for months.

The second was counting the people who produced no event at all. They left after the first screen, so no event table contains them, and that is exactly why they never surface as a problem. Their absence is a verdict on the first screen.

Then fix the earliest large drop, not the most interesting one. Tuning payment while activation is broken is work on a step almost nobody reaches.

## What did not work

- **Reading the graphs every day.** At these volumes the swing between two days is bigger than any real weekly change. I shipped a fix on a Tuesday dip and reverted it on Friday, more than once, and neither the fix nor the revert had anything to do with the numbers that moved.
- **Counting pageviews as traffic.** The views in the report were mine: a founder-only panel I open several times a day, sitting in the same property as the public pages. Once I excluded the internal URLs and my own sessions, my growth story turned into a flat line.
- **Treating signups as activation.** The signup number looked healthy for months while people registered and never sent one real request. I had instrumented the door and left the room dark.
- **Counting transactions instead of unique payers.** Three purchases by one person read as three customers on my chart, and my own test account read the same way.
- **Trusting an external traffic estimate.** It did not cover one of the two search engines my audience actually uses. The conclusion I drew from it was the reverse of the truth, and one query typed by hand into that engine would have caught it. I did not type it for weeks.
- **Building the dashboard before writing the questions.** I read panels that answered nothing every week for a long time before noticing they answered nothing. In the end I deleted most of my event tables and rebuilt the panel around cost and exhaustion.
- **Averaging over all users instead of cohorts.** The average sat flat while signups grew, which I read as stability. That panel could not have told me whether any single cohort was moving.

## Verify

Run `/atlas:report` from [Tools](/tools/). It pulls the Search Console side, the index share and your own product numbers into one weekly block, which you then paste into a log so the series exists at all.

The rest of it a report cannot check for you.

- The signup number excludes your own accounts. Sign up as a test user and confirm the number does not move.
- The activation metric names exactly one action. If you cannot say which one, the metric does not exist yet.
- The index share uses submitted URLs as its denominator, not the pages you remember writing.
- The series has more than one point in it. One reading is not a trend and two are barely a line.

Knowing a number moved is useless until you know who moved it: [where the user actually came from](/analytics/attribution/).

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

The dashboard has forty numbers and every one of them moved this week. Which movements are growth and which are noise.

At small volumes almost everything is noise. A short list, read on a fixed schedule, is the only version of this that works.

Each number below answers a question the others cannot. If two of your metrics answer the same question, delete one.

## Steps

1. **Impressions in Search Console** — answers whether search considers you an answer to anything at all.
   The number is in the Performance report, opened from the property's left-hand navigation.
   Impressions move before clicks, so this is the first metric to react to new pages. Watch the count of distinct queries next to it. A rising query count means new demand found you; a flat one means the same page was shown more often.
2. **Clicks and average position, read together** — separates a ranking problem from a packaging problem.
   Impressions with no clicks at a decent position is a title and snippet problem. Rewriting the body is the wrong fix: the reader never got that far.
   Read the position here, not in a panel. On one query an outside estimate said 20 and this report said 43.3: [what a paid rank tracker measures](/tools/paid-tools/).
3. **Share of your pages actually in the index** — how much of your writing is eligible to rank.
   The denominator is the URLs you submitted, the numerator is the URLs reported as indexed. A page count on its own is fiction. The Page indexing report gives the shape; the URL Inspection API gives per-URL truth.
4. **Signups, with your own accounts subtracted** — answers whether the traffic contains anyone who wants the thing.
   Keep an explicit list of internal ids and subtract before aggregating, not after. Count people, not events.
5. **Activation: the first action that delivers the core value** — answers whether they got the thing at all.
   Account created is not activation, and neither is pressing start. Name the one action after which a person understands the product, then measure the share who reach it.
6. **Repeat use on a later day, unprompted** — answers whether you have a product or a demo.
   Cohort it by week of first contact. Pooling everyone lets new arrivals hide retention that is falling.
7. **One snapshot a week, same weekday, same window** — a rolling 28-day window removes the weekday effect.
   Append it to a file and keep the series. A number you cannot compare with itself last month is decoration.

Two readings changed what I fixed, and neither is visible in a total.

- **Break activation down by first action.** On one project the two possible first actions returned at different rates. That told me which path to put in front of new users. The aggregate said nothing.
- **Count the people who produced no event at all.** They left after the first screen. No event table contains them at all, which is why they never surface as a problem. That is a verdict on the first screen, not forgetfulness.

Fix the earliest large drop first. Tuning payment while activation is broken is work on a step almost nobody reaches.

## What did not work

- **Reading the graphs daily.** At these volumes the day-to-day swing is larger than any real weekly change. I shipped changes on a Tuesday dip and reverted them on Friday, more than once.
- **Counting pageviews as traffic.** The views in the report came from my own founder-only panel. Excluding internal URLs and my own sessions turned a growth story into a flat line.
- **Treating signups as activation.** The signup number looked healthy for months. People signed up and never sent one real request. I was measuring the door, not the room.
- **Counting transactions instead of unique payers.** Three purchases by one person read as three customers. The same mistake makes a single test account look like traction.
- **Trusting an external traffic estimate.** It did not cover one of the two search engines my audience used. The conclusion I drew was the opposite of the truth. One manual query in that engine would have caught it.
- **Building the dashboard before writing the questions.** Panels that answer nothing still get read every week. I deleted most of my event tables and rebuilt the panel around cost and exhaustion.
- **Averaging over all users instead of cohorts.** The average stayed flat while signups grew steadily. Whether any cohort was moving, that panel could not say.

## Verify

Run `/atlas:report` from [Tools](/tools/). It collects the Search Console side, the index share and your own product numbers into one weekly block. Paste that block into a log and keep the series.

Then check the things a report cannot check for you.

- The signup number excludes your own accounts. Sign up as a test user and confirm the number does not move.
- The activation metric names exactly one action. If you cannot say which, the metric does not exist yet.
- The index share uses submitted URLs as its denominator, not the pages you remember writing.
- The series has more than one point. One reading is not a trend, and two are barely a line.

Knowing a number moved is useless without knowing who moved it: [where the user actually came from](/analytics/attribution/).

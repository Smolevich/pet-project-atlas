---
title: A one-week search experiment that can answer
sidebar:
  order: 4
description: Groups that do not overlap, a control, rules written before the edits, and a daily collector. And the traps in my own data that would have produced a verdict out of nothing.
updated: 2026-10-10
sources:
  - Search Console API, property telegram-voice-bot, measured 2026-10-10
  - nginx access log, dataset 2026-09-19..2026-10-09, measured 2026-10-10
  - Voice AI bot database, measured 2026-10-10
---

## What we are solving

You changed something on the site and want to know if it helped. Impressions went up that week, so it worked — except they went up on the pages you did not touch as well.

I ran three strategies at once on my voice bot's site. The results are in [the case](/cases/voice-seo-week/). This page is the setup that let a week give an answer, and the places where my own data almost lied to me.

## Steps

1. **One page belongs to one group.** If a page gets two changes, nobody can say which one moved it. My sitemap and the blog index were shared by all groups, so I wrote that down as a known limit.
2. **Keep a control group.** Pages you leave alone show what the whole site did that week anyway. My rule: if the control moved the same way within 30%, the effect is zero.
3. **Write the verdict rules before the first edit.** Each group gets three outcomes — keep going, drop it, not tested — with numbers. "Not tested" needs its own condition. Mine was "the crawler has not opened the edited page at least three days before the cut-off".
4. **Measure the baseline the same way you will measure the test.** My first baseline for ChatGPT referrals said 2.1 a day. Recounted from the same log by the same method, it came to 1.4. I moved the thresholds that same day, before shipping.
5. **Ship one deploy at a time and log the minute.** Daily data cannot split a day, so the deploy day goes into neither window.
6. **Collect on a schedule, not by hand.** A scheduled job pulled Search Console, URL Inspection, the access log and new signups at 09:30 every morning. Keep its raw output somewhere permanent.
7. **Tag the button with the page it sits on.** My site adds the page to the bot's start link, so each signup carries the page where the person clicked. Before this, every blog article sent the same tag, and 8 signups in 60 days could not be placed in any group.

## What did not work

- **Search Console lags.** On 10 October the last day with data was 6 October. My "week" for search metrics was three days.
- **Counting ChatGPT-User visits as people.** 205 of 216 requests from that agent hit the home page at a steady 9 to 19 a day. It looks like an automated fetch, so I kept it out of every verdict.
- **Counting referrals as visitors.** A tagged request in the log is a page load, not a person. I filtered out bot agents, and the method still differed slightly from the baseline count.
- **Keeping raw data in a temporary folder.** The day-0 search results lived in `/tmp`. The machine cleaned it before day 7, and that part of the comparison was lost.
- **Expecting the crawler to show up daily.** Googlebot fetched nothing at all from the whole site on 6 of 21 days in the log.

## Verify

Before you look at any result, answer four questions in writing.

| Question | My answer on 3 October |
|---|---|
| Which pages are in each group, and which in the control? | 3 groups of 4, 3 and 8 URLs, plus 7 control URLs |
| What number means "keep going" for each group? | written per group, with thresholds |
| What is the "not tested" condition? | the crawler has not opened the edited page |
| Where does the raw data live after the week? | a folder outside `/tmp`, kept until 31 October |

If any row is empty, the week will give you a feeling instead of an answer.

---
title: One week, three search strategies and a control group
description: On my voice bot's site I ran three strategies at once on separate pages, with the verdict rules written before the edits. New pages with my own measurements were crawled the same day. Edited pages mostly were not, so the week could not judge them.
updated: 2026-10-14
sources:
  - Search Console API, property telegram-voice-bot, measured 2026-10-10
  - Search Console API, property telegram-voice-bot, measured 2026-10-14
  - nginx access log, dataset 2026-09-19..2026-10-09, measured 2026-10-10
  - Voice AI bot database, measured 2026-10-10
---

## What we are solving

The blog on my voice bot's site had gone 56 days without a new article, and impressions were sliding. I had three ideas for getting them back and no way to tell which one worked.

So on 3 October 2026 I shipped all three at once, each on its own set of pages, and left a fourth set untouched as a control. The rules for "keep going", "drop it" and "not tested" were written that afternoon, before any page changed.

This is what a week showed, including the two strategies it could not judge.

## Steps

1. **Split the pages into groups that do not overlap.** Group A got changes for AI answers: a direct answer under the heading, a table of facts, an FAQ and a new how-to article. Group B got new titles and descriptions only. Group C was 8 new URLs, 4 articles in two languages, each built on my own measurement.
2. **Leave a control group alone.** Five existing articles and the about page in both languages, 7 URLs in all, stayed as they were. If the control moved the same way within 30%, I would count the effect as zero.
3. **Fix the verdict rules before shipping.** For C: Googlebot on 4 of the 8 URLs and any AI crawler on one. For B: CTR — clicks divided by impressions — of 4% on 300 impressions after a re-crawl. For A: ChatGPT referrals up from 1.4 to 2.1 a day.
4. **Ship one change at a time and log the minute.** Five deploys went out between 19:10 and 20:38 Belgrade time, each one in the log with its time. The test window for a group starts from its own deploy.
5. **Collect every morning, automatically.** A scheduled job pulled Search Console, URL Inspection, the nginx log and new signups at 09:30 each day. The method behind it is on [a one-week experiment that can answer](/analytics/one-week-experiment/).
6. **Ask the assistants by hand on day 0 and day 7.** Ten questions, the same wording both times, logged out. That procedure is on [checking whether assistants name you](/geo/asking-the-assistants/).

## What did not work

- **Group B, the titles.** Googlebot re-fetched 2 of the 3 pages, on 4 and 6 October, and they collected 64 impressions after that. The rule needed 300. The third page was never re-fetched, see [edited pages wait for their next crawl](/indexing/edited-pages-wait/).
- **Group A, the answers for AI.** OAI-SearchBot — the crawler behind ChatGPT search — never opened the edited landing page during the test. Referrals from ChatGPT went from 1.43 a day to 1.17. Both new how-to articles got zero of them.
- **Repeating the day-0 search results.** I had saved the raw results in a temporary folder. By day 7 they were gone, so the comparison of live positions never happened.
- **Treating the control as stable.** One control article was re-crawled on 4 October and dropped from "indexed" to "Crawled — currently not indexed". Nobody had touched it.

## Verify

Here is where each group stood on 10 October, against the rules written on 3 October.

| Group | What changed | Result by the rules | Verdict |
|---|---|---|---|
| C | 8 new URLs with own measurements | Googlebot on 7 of 8, an AI crawler on 8 of 8, 7 indexed, impressions on 6 of 8 | keep going |
| A | answers and facts for AI | edited landing not opened by OAI-SearchBot, ChatGPT referrals 1.17 a day | not tested, extended to 17 October |
| B | titles and descriptions | 64 impressions after re-crawl, 300 needed | not tested, extended to 17 October |

On 14 October, eleven days in, the 8 new URLs still had impressions on 6 and 0 clicks between them. Their average positions sat between 5 and 9.

The bigger number did not move at all. Across the baseline, 36 of 377 new users came through a button on the site, which is 9.5%. In the test window it was 19 of 205, 9.3%. Almost all the rest came straight from inside Telegram, with no tag from the site.

In general, a week judges new pages and cannot judge edits. If you run your own version, give the edited pages three weeks.

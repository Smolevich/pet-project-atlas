---
title: Edited pages wait for their next crawl
sidebar:
  order: 3
description: A new page on my site was fetched the day it shipped. A page I edited could go a week without a visit, so the edit had not reached search yet. How to tell which case you are in before you judge the change.
updated: 2026-10-14
sources:
  - Search Console API, property telegram-voice-bot, measured 2026-10-10
  - nginx access log, dataset 2026-09-19..2026-10-09, measured 2026-10-10
  - URL Inspection API — https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
---

## What we are solving

You rewrote a title or the first screen of a page. A week later Search Console shows no change, and you are about to call the edit useless.

On my site the edit usually had not reached search at all. Google and the AI crawlers kept the old copy, because they had not come back for the page.

## Steps

1. **Read the last crawl date before reading any metric.** URL Inspection — the search bar at the top of every Search Console screen — shows "Last crawl" for a URL. The same field comes back from the API as `lastCrawlTime`. If it is older than your deploy, every number on that page still describes the old version.

   ```bash
   curl -s -X POST \
     -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
     -H "Content-Type: application/json" \
     https://searchconsole.googleapis.com/v1/urlInspection/index:inspect \
     -d '{"inspectionUrl":"https://example.com/page","siteUrl":"https://example.com/"}' \
     | jq '.inspectionResult.indexStatusResult | {coverageState, lastCrawlTime}'
   ```

2. **Check your own access log for the crawler, by path.** The inspection date covers Google only. Assistants send their own agents, and the log is the only place they show up.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | grep 'GET /edited-page' | grep -c 'OAI-SearchBot'
   ```

3. **Count impressions only after the crawl date.** Everything before it is the old title. On my three edited pages that cut 169 impressions down to 64 — including the day of the crawl itself — and 19 strictly after it.
4. **Expect new pages to move first.** On the same day I shipped 8 new URLs. Googlebot fetched 3 of them that night and 7 of 8 within two days, and 6 had impressions by the third day. The edited pages sat beside them in the same sitemap.

## What did not work

- **Judging a title change on a one-week window.** Of 3 pages with new titles, Googlebot re-fetched 2, on day 1 and day 3. The third had been crawled that morning, a few hours before my deploy, and not again all week.
- **Expecting an assistant to notice a rewrite.** I rebuilt a landing page for AI answers. OAI-SearchBot, the crawler that feeds ChatGPT search, did not request it once in seven days.
- **Trusting one inspection reading.** The status for a new URL flipped between "URL is unknown to Google", "Discovered" and "indexed" from one day to the next. Only the most recent reading means anything.
- **Reading crawler visits from Yandex and Bing as interest.** My deploy pings IndexNow — a shared endpoint that tells Bing and Yandex which URLs changed — with the whole sitemap. Their visits that week were an answer to my ping, so I left them out of the count.

## Verify

For each page you changed, write down three dates: the deploy, the last crawl from inspection, and the first crawler hit in your log after the deploy. If the crawl is not later than the deploy, the page is still in the old state.

Mine on day 7 looked like this.

| Page | Edit | Re-crawled by Googlebot | Impressions after |
|---|---|---|---|
| home page | title and description | day 1 | counted from day 1 |
| landing page, Russian | title and description | day 3 | one day of data |
| comparison article | description | not re-crawled | none |

In general, give an edited page three weeks before you judge it. A new page answers within days, so a week-long test only works on new pages.

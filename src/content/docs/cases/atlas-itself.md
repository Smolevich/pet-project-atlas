---
title: This atlas, two days in
description: The first measurement of the site you are reading — zero impressions, one content page crawled, and a home page Google says it has never heard of.
updated: 2026-08-12
sources:
  - Search Console, property atlas.smolevich.com, measured 2026-08-12
  - nginx access log, dataset /var/log/nginx/atlas.access.log, measured 2026-08-12
  - sitemap.xml, site atlas.smolevich.com, measured 2026-08-12
---

## What we are solving

Every guide promises results in a few weeks. Almost none show what the first days look like. So you have nothing to compare your own silence against.

This site went live on 10 August 2026. Here is everything it has, two days later. I will keep adding to this page monthly, including the months where nothing moved.

## Steps

Everything below is what the route tells you to do, done on this site, in order.

1. **The site was deployed and the pages exist** — 58 pages, English and Russian, 56 URLs in the sitemap.
2. **`robots.txt` and `llms.txt` are generated at build time**, so they cannot drift from the pages.
3. **A domain property was verified in Search Console** — Google confirmed ownership through the DNS provider, no TXT record needed.
4. **The sitemap was submitted once**, on 12 August at 10:20 UTC. Search Console read it two seconds later and reported 56 URLs.
5. **All 46 canonical URLs were pushed through IndexNow** — accepted by the shared endpoint, by Bing and by Yandex. That was the whole site at the time. Three pages shipped later the same day, in both languages, and those have not been pushed.

Then I stopped and read what came back.

## What did not work

- **Expecting the sitemap to do more than it does.** It was accepted in two seconds. That felt like progress and was not. Two days later the URL inspection says the home page is **unknown to Google**. Never crawled. Submitted, discovered, crawled and indexed are four different states. This site is not past the first one.
- **Reading the access log as if every line were a visitor.** The log holds 417 requests. Almost all of them are me and the two people I sent the link to.
- **Counting bots with `grep -o`.** My first count said six Googlebot requests and one from Perplexity. `Googlebot` appears twice in its own user agent string: once as the token, once inside the URL it advertises. The honest count takes one match per line. I had already published the doubled numbers on another page before I noticed.
- **Publishing `llms.txt` because the checklist said so.** Zero AI agents fetched it here. On the older project it was zero too. Of the 45 requests that file ever got, 44 were my own `curl`.

## Verify

The numbers, read on 12 August 2026, two days after launch.

| What | Value |
|---|---|
| Impressions in Search Console | 0 |
| Clicks | 0 |
| Queries the site appears for | 0 |
| Home page status | URL is unknown to Google |
| Last crawl of the home page | never |

The size of the site moved between the two readings, so it gets both. Three pages shipped later the same day, in English and in Russian.

| What | First reading | Read again after those pages |
|---|---|---|
| Pages published | 58 | 66 |
| URLs in the sitemap | 56 | 66 |

The second column is the live `sitemap.xml` and the page count of the same build. Everything else above is the first reading and has not been taken again.

Requests by search and AI agents, counted one match per line:

| Agent | Requests |
|---|---|
| Googlebot | 6 |
| PerplexityBot | 1 |
| GPTBot | 1 |
| ClaudeBot | 1 |
| ChatGPT-User | 1 |

What Googlebot actually took: `robots.txt` three times, both sitemap files once each, and exactly one content page — `/geo/citable-pages/`.

That last line is the useful one. Google has read the map of the site three times and fetched one page off it. Nothing here is broken, and nothing here has happened yet either. If your own project is two days old and quiet, this is what quiet looks like from the inside.

Next measurement in a month, on this page, whatever it says.

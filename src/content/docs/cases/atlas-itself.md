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

Every guide promises results in a few weeks, and almost none of them show what the first days look like. So when your own project is silent, there is nothing to hold that silence up against.

This site went live on 10 August 2026. Here is everything it has, two days later. I will keep adding to this page monthly, including the months where nothing moved.

## Steps

I did what the route tells you to do, on this site, in the order the route gives.

1. Deployed the site — 58 pages in English and Russian, 56 URLs in the sitemap.
2. Generated `robots.txt` and `llms.txt` at build time, so neither of them can drift away from the pages it describes.
3. Verified a domain property in Search Console. Google confirmed ownership through the DNS provider and never asked me for a TXT record.
4. Submitted the sitemap once, on 12 August at 10:20 UTC. Search Console read it two seconds later and reported 56 URLs.
5. Pushed all 46 canonical URLs through IndexNow, and the shared endpoint, Bing and Yandex all accepted them. That was the whole site at the time. Three more pages shipped later the same day, in both languages, and those I have not pushed.

Then I stopped and read what came back.

## What did not work

- **Expecting the sitemap to do more than it does.** It was accepted in two seconds, which felt like progress and was not. Two days later the URL inspection tells me the home page is **unknown to Google**, never crawled. Submitted, discovered, crawled and indexed are four different states, and this site has not got past the first one.
- **Reading the access log as if every line were a visitor.** The log holds 417 requests. Almost all of them are me and the two people I sent the link to.
- **Counting bots with `grep -o`.** My first count said six Googlebot requests and one from Perplexity. `Googlebot` appears twice inside its own user agent string — once as the token, once inside the URL it advertises — so counting occurrences and counting lines are two different questions.

  ```bash
  grep -o 'Googlebot' /var/log/nginx/atlas.access.log | wc -l
  grep -c 'Googlebot' /var/log/nginx/atlas.access.log
  ```

  The second one is the honest count. I had already published the doubled numbers on another page before I noticed.
- **Publishing `llms.txt` because the checklist said so.** Zero AI agents fetched it here, and on the older project it was zero too. Of the 45 requests that file ever got, 44 were my own `curl`.

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

The second column is the live `sitemap.xml` and the page count of the same build. Everything else above is the first reading and I have not taken it again.

Requests by search and AI agents, counted one match per line:

| Agent | Requests |
|---|---|
| Googlebot | 6 |
| PerplexityBot | 1 |
| GPTBot | 1 |
| ClaudeBot | 1 |
| ChatGPT-User | 1 |

What Googlebot actually took: `robots.txt` three times, both sitemap files once each, and exactly one content page — `/geo/citable-pages/`.

That last line is the one I keep coming back to. Google has read the map of this site three times and fetched a single page off it, so nothing here is broken and nothing here has happened yet either. If your own project is two days old and quiet, this is what quiet looks like from the inside.

Next measurement in a month, on this page, whatever it says.

---
title: Submit the site and verify it was taken
sidebar:
  order: 2
description: Search Console, Bing Webmaster Tools, IndexNow and Yandex Webmaster in the order that works, and how to read the reports a week later.
updated: 2026-08-10
sources:
  - Verifying site ownership — https://support.google.com/webmasters/answer/9008080
  - Sitemaps report — https://support.google.com/webmasters/answer/7451001
  - Page indexing report — https://support.google.com/webmasters/answer/7440203
  - URL Inspection tool — https://support.google.com/webmasters/answer/9012289
  - Building and submitting a sitemap — https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - Bing Webmaster Tools guidelines — https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a
  - IndexNow, the key and the API — https://www.indexnow.org/documentation
  - IndexNow FAQ, which engines take it — https://www.indexnow.org/faq
  - Yandex Webmaster help — https://yandex.com/support/webmaster/
---

## What we are solving

You want to hand the site to search engines and find out whether it was actually taken. Submitting notifies an engine. It promises you nothing in the index.

Each engine has its own console. The order inside every one of them is the same. Prove you own the host. Then give the engine your map. Then nudge single URLs.

Only start this once the site is crawlable. Submission does not repair a block — see [why Google does not see your site](/indexing/why-google-does-not-see-you/).

## Steps

### Which property to create in Search Console

Create a domain property on the bare domain and put the TXT record in DNS. A domain property covers every subdomain and both protocols at once. A URL-prefix property covers exactly the form of the address you typed in. That is how someone ends up staring at an empty report for weeks. The site was living on the neighbouring form the whole time.

### Submit the sitemap once and leave it alone

Put the sitemap URL into the Sitemaps report, and that is the end of it. The file is re-read on its own schedule. Re-submitting adds nothing.

Keep URL Inspection for a handful of new or repaired pages. It is not an indexing queue, and it does not work as one.

### Bing: ten minutes and an import from Search Console

Bing Webmaster Tools has an import. It carries verification and the sitemap over in one step. Bing's share of search is small, and ten minutes is still worth spending. The Bing index also feeds Copilot answers. That is a separate audience you would otherwise never see.

### IndexNow: a key in the root, then the changed URLs

First make a key of 8 to 128 hex characters and place it in the site root as `{key}.txt`. That file is how an engine checks you own the host. The only thing inside it is the key itself. UTF-8 text, reachable without a login:

```
curl -s https://example.com/{key}.txt
```

Put the file anywhere else and every request has to carry `keyLocation` pointing at it.

Then post the changed URLs as JSON to a participating engine's `/indexnow`, up to 10,000 per request:

```
curl -sS -X POST https://www.bing.com/indexnow \
  -H 'Content-Type: application/json' \
  -d '{"host":"example.com","key":"YOUR_KEY","urlList":["https://example.com/page/"]}'
```

One post notifies every participating engine, Bing and Yandex among them. Google does not participate.

A success is `200`. The first call often answers `202` while the key is still being verified. Both `200` and `202` mean received, and nothing more. `422` is a malformed batch. `429` is the rate limit.

Wire it into the deploy so that only the URLs the build actually changed go out. A hook that posts the whole sitemap on every deploy gets throttled. It also tells the engines nothing they can act on.

### Do you need Yandex Webmaster

Set it up if you have Russian-language pages. Verify, add the sitemap and stop there. Its reindex request is quota-limited per site. Spend that quota on pages you repaired, not on the whole catalog.

## What did not work

- **Submitting before ownership was verified**. An unverified property collects nothing and will not accept a sitemap. The console looks set up and is inert.
- **Verifying the wrong host form**. The property is `www`, the site canonicalises to the bare domain, and the report stays empty. A domain property removes this whole class of mistake.
- **Treating submission as a fix for crawlability**. A sitemap of URLs blocked in `robots.txt` only changes the error label. The report moves from "not discovered" to "blocked", and nothing gets indexed.
- **Re-submitting the sitemap daily**. It moves no queue. Meanwhile you are not looking at the errors row, which was telling you the answer.
- **Using URL Inspection as a queue**. The daily submission limit is small. A re-request on an unchanged page returns the same verdict.
- **Expecting IndexNow to reach Google**. It does not. The ping shortens the path into the participating indexes only. Google keeps its own schedule.

## Verify

Come back after a week and read four things, in this order. Sitemaps, Page indexing and Performance are reports inside the property, opened from the left-hand navigation. URL Inspection lives in the search bar at the top of every Search Console screen.

- **Sitemaps report**: status Success, and a discovered-URL count that matches the file. That count means the file was read, not that pages were indexed.
- **Page indexing report**: the indexed bucket, and the list of reasons for the rest. Read the reasons. A total gives you nothing you can act on.
- **URL Inspection** on two or three pages: "URL is on Google" is the only wording that means taken.
- **Performance report**: impressions mean you were seen. A page with impressions is already indexed and losing on the snippet. That is a title and intent problem, not an indexing one.

Submitted, discovered, crawled and indexed are four different counts. Only indexed means the site is findable. In the first weeks after launch the gap between those counts will stay wide. That is normal.

For Bing, the equivalent checks live in Site Explorer and its own URL inspection. For IndexNow, a 200 from the API means received — nothing more.

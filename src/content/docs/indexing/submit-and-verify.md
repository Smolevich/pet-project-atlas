---
title: Submit the site and verify it was taken
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

You want to hand the site to search engines and find out whether it was actually taken. Submitting is a notification, not a promise.

Each engine has its own console, and the order inside every one of them is the same: prove you own the host, then give it the map, then nudge single URLs.

It is only worth doing after the site is crawlable. Submission does not repair a block — see [why Google does not see your site](/indexing/why-google-does-not-see-you/).

## Steps

### Which property to create in Search Console

Create a domain property on the bare domain and put the TXT record in DNS. It covers every subdomain and both protocols at once, while a URL-prefix property covers exactly the form of the address you typed in. That is how people end up staring at an empty report for weeks while the site lives on the neighbouring form.

### Submit the sitemap once and leave it alone

The sitemap URL goes into the Sitemaps report, and that is the end of it. The file is re-read on its own schedule, so re-submitting adds nothing.

Keep URL Inspection for a handful of new or repaired pages. It is not an indexing queue, and it does not work as one.

### Bing: ten minutes and an import from Search Console

Bing Webmaster Tools has an import that carries verification and the sitemap over in one step. It is worth ten minutes even with Bing's small share of search: its index also feeds Copilot answers, which is a separate audience you would otherwise never see.

### IndexNow: a key in the root, then the changed URLs

First a key of 8 to 128 hex characters, placed in the site root as `{key}.txt`. That file is how an engine checks you own the host, and its only content is the key itself. UTF-8 text, reachable without a login:

```
curl -s https://example.com/{key}.txt
```

Put the file anywhere else and every request has to carry `keyLocation` pointing at it.

Then the changed URLs go as a JSON POST to a participating engine's `/indexnow`, up to 10,000 per request:

```
curl -sS -X POST https://www.bing.com/indexnow \
  -H 'Content-Type: application/json' \
  -d '{"host":"example.com","key":"YOUR_KEY","urlList":["https://example.com/page/"]}'
```

One post notifies every participating engine, Bing and Yandex among them. Google does not participate.

A success is `200`, and the first call often answers `202` while the key is still being verified. Both mean received and nothing more; `422` is a malformed batch and `429` is the rate limit.

Wire it into the deploy so that only the URLs the build actually changed go out. A hook that posts the whole sitemap on every deploy gets throttled, and it tells the engines nothing they can act on either.

### Do you need Yandex Webmaster

Worth it if you have Russian-language pages. Verify, add the sitemap and stop: its reindex request is quota-limited per site, so spend it on pages you repaired rather than on the whole catalog.

## What did not work

- **Submitting before ownership was verified**. An unverified property collects nothing and will not accept a sitemap. The console looks set up and is inert.
- **Verifying the wrong host form**. The property is `www`, the site canonicalises to the bare domain, and the report stays empty. A domain property removes this whole class of mistake.
- **Treating submission as a fix for crawlability**. A sitemap of URLs blocked in `robots.txt` only changes the error label. The report moves from "not discovered" to "blocked", and nothing gets indexed.
- **Re-submitting the sitemap daily**. It moves no queue. What it does move is your attention, away from the errors row that was telling you the answer.
- **Using URL Inspection as a queue**. The daily submission limit is small, and a re-request on an unchanged page returns the same verdict.
- **Expecting IndexNow to reach Google**. It does not. The ping shortens the path into the participating indexes only, and Google keeps its own schedule.

## Verify

Come back after a week and read four things, in this order. Three of them are reports inside the property, opened from the left-hand navigation, while URL Inspection lives in the search bar at the top of every Search Console screen.

- **Sitemaps report**: status Success, and a discovered-URL count that matches the file. That count means the file was read, not that pages were indexed.
- **Page indexing report**: the indexed bucket, and the list of reasons for the rest. Read the reasons: a total gives you nothing you can act on.
- **URL Inspection** on two or three pages: "URL is on Google" is the only wording that means taken.
- **Performance report**: impressions mean you were seen. A page with impressions is already indexed and losing on the snippet, which is a title and intent problem rather than an indexing one.

Submitted, discovered, crawled and indexed are four different counts, and only the last one means the site is findable. In the first weeks after launch the gap between them will stay wide, and that is normal.

For Bing, the equivalent checks live in Site Explorer and its own URL inspection. For IndexNow, a 200 from the API means received — nothing more.

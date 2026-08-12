---
title: Submit the site and verify it was taken
description: Search Console, Bing Webmaster Tools, IndexNow and Yandex Webmaster in the order that works, and how to read the reports a week later.
updated: 2026-08-10
sources:
  - https://support.google.com/webmasters/answer/9008080
  - https://support.google.com/webmasters/answer/7451001
  - https://support.google.com/webmasters/answer/7440203
  - https://support.google.com/webmasters/answer/9012289
  - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a
  - https://www.indexnow.org/documentation
  - https://www.indexnow.org/faq
  - https://yandex.com/support/webmaster/
---

## What we are solving

You want to hand the site to search engines and know whether it was actually taken. Submitting is a notification, not a promise.

The engines each have their own console, and the order inside every one of them is the same. Prove you own the host, then give it the map, then nudge single URLs.

Do this only after the site is crawlable. Submission does not repair a block — see [why Google does not see your site](/indexing/why-google-does-not-see-you/).

## Steps

1. **Search Console: verify a domain property first** — add the bare domain and put the TXT record in DNS.
   A domain property covers every subdomain and both protocols at once. A URL-prefix property covers only the exact form you typed, which is how people end up watching an empty report.
2. **Search Console: submit the sitemap once** — paste the sitemap URL in the Sitemaps report and leave it alone.
   The file is re-read on its own schedule, so re-submitting adds nothing. Keep URL Inspection for a handful of new or repaired pages.
3. **Bing Webmaster Tools: import from Search Console** — the import copies verification and the sitemap in one step.
   Bing is worth the ten minutes even if its search share looks small. Its index also feeds Copilot answers, which is a separate audience.
4. **IndexNow: publish a key, then post changed URLs** — generate a key of 8 to 128 hex characters. Host it as `{key}.txt` in the site root.
   Send changed URLs as a JSON POST, up to 10,000 per request. One post notifies every participating engine, Bing and Yandex among them. Google does not participate.

   The key file is how an engine checks you own the host, and its only content is the key. UTF-8 text at `https://example.com/{key}.txt`, reachable without a login. Put it anywhere else and every request has to carry `keyLocation` pointing at it.

   The POST goes to a participating engine's `/indexnow` with `host`, `key` and `urlList` in the body. A success is `200`, and the first call often answers `202` while the key is still being verified. Both mean received and nothing more; `422` is a malformed batch and `429` is the rate limit.
5. **IndexNow: wire it into the deploy** — send only the URLs the build actually changed.
   A hook that posts the whole sitemap on every deploy gets throttled. It also tells the engines nothing they can act on.
6. **Yandex Webmaster: verify, add the sitemap, then stop** — worth doing if you have Russian-language pages.
   Its reindex request is quota-limited per site, so spend it on pages you repaired, not on the whole catalog.

## What did not work

- **Submitting before ownership was verified**. An unverified property collects nothing and will not accept a sitemap. The console looks set up and is inert.
- **Verifying the wrong host form**. The property is `www`, the site canonicalises to the bare domain, and the report stays empty. A domain property removes this whole class of mistake.
- **Treating submission as a fix for crawlability**. A sitemap of URLs blocked in `robots.txt` only changes the error label. The report moves from "not discovered" to "blocked", and nothing gets indexed.
- **Re-submitting the sitemap daily**. It moves no queue. What it does move is your attention, away from the errors row that was telling you the answer.
- **Using URL Inspection as a queue**. The daily submission limit is small, and a re-request on an unchanged page returns the same verdict.
- **Expecting IndexNow to reach Google**. It does not. The ping shortens the path into the participating indexes only, and Google keeps its own schedule.

## Verify

Come back after a week and read four things, in this order.

Three of them are reports inside the property, opened from the left-hand navigation. URL Inspection is the exception. It is the search bar at the top of every Search Console screen.

- **Sitemaps report**: status Success, and a discovered-URL count that matches the file. That count means the file was read, not that pages were indexed.
- **Page indexing report**: the indexed bucket, and the list of reasons for the rest. Read the reasons. A total tells you nothing you can act on.
- **URL Inspection** on two or three pages: "URL is on Google" is the only wording that means taken.
- **Performance report**: impressions mean seen. A page with impressions is indexed and losing on the snippet. That is a title and intent problem, not an indexing one.

Submitted, discovered, crawled and indexed are four different counts. Only the last one means the site is findable. Expect the gap between them to stay wide in the first weeks after launch.

For Bing, the equivalent checks live in Site Explorer and its own URL inspection. For IndexNow, a 200 from the API means received — nothing more.

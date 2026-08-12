---
title: Google does not see your site
description: The site is live and search returns nothing for it. The checks that find the real blocker, in the order they have to run.
updated: 2026-08-12
sources:
  - https://developers.google.com/search/docs/crawling-indexing/robots/intro
  - https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  - https://developers.google.com/search/docs/crawling-indexing/block-indexing
  - https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
  - https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - https://www.sitemaps.org/protocol.html
  - https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
  - https://developers.cloudflare.com/ruleset-engine/rules-language/actions/
  - https://developers.cloudflare.com/waf/analytics/security-events/
---

## What we are solving

The site has been live for weeks and search returns nothing for it. Not a weak position — no result at all.

Indexing fails from the top down. A page has to be fetchable, then crawlable, then indexable, and only then rankable.

A rewritten `title` on a `noindex` page changes nothing. Run the checks below in order and stop at the first one that fails.

## Steps

1. **Rendering** — request the page with `curl -sL https://example.com/page` and find a sentence of your body text in the response.
   A client-side app answers with a near-empty `<body>`, so the crawler receives nothing to index. The fix is server rendering or a prerender step.
2. **`robots.txt`** — fetch it from the live domain and read every line, not only the ones you wrote.
   The classic blocker is a `Disallow: /` inherited from a staging config. Google stops reading the file past 500 kibibytes, so a generated file can truncate silently.
3. **`noindex` in both places** — the meta tag in the HTML, and the `X-Robots-Tag` response header.
   Only `curl -sI` shows the header. A page with `noindex` is fetched, understood, and then dropped on purpose.

   `X-Robots-Tag` is a response header, not markup, so View Source never shows it. Read it with `curl -sI https://example.com/page`, which sends a HEAD request and prints the headers alone. In a browser it is under Network, the document request, Response Headers.

   The header can come from the framework, the web server or the CDN. Each of those is a different file to check. It also takes a per-agent form, as in `X-Robots-Tag: googlebot: noindex`.
4. **Canonical** — every page points at itself or at the real original.
   A template that hardcodes the home page as canonical everywhere asks search to discard the rest of the site.
5. **One URL per page** — trailing slash, `www`, `http`, `index.html` and tracking parameters all redirect to a single form.
   Otherwise the signal splits between duplicates, and the sitemap disagrees with the canonical tag.
6. **Sitemap validity, not sitemap presence** — every URL answers 200, is absolute, and is in the canonical form.
   The protocol caps one file at 50,000 URLs and 50MB uncompressed. Past that, split the file and add a sitemap index. A map full of redirects and 404s devalues itself.
7. **Reachability from outside your network** — resolve the domain elsewhere and request the page without cookies.
   Access control, basic auth and edge bot rules answer the crawler with a login page or a 403. None of that shows up in `robots.txt`.

   The edge rule has a name and a screen. On Cloudflare it is **Configure AI bot policies**, on the zone's **Security Settings** page, on every plan. It refuses matching agents with a 403 from Cloudflare's own network, before the request reaches your server.

   That last part is why this check has to run from outside. The refusal is not in your server log either, only in Cloudflare's **Analytics** → **Events**. The whole mechanism is on [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).

The order is the point. On a page that is blocked or marked `noindex`, everything below it is unmeasurable.

## What did not work

- **Waiting for the index to catch up**. The crawler does come back, reads the same rule, and leaves again. Patience does not edit a header.
- **Re-submitting one URL in the inspection tool**. The re-fetch uses the same `robots.txt`, the same header, the same empty body. The verdict returns identical and the daily quota is gone.
- **Trusting a third-party crawler as proof of access**. It reports what a bot could fetch from its own address. Whether search decided to keep the page is a different question.
- **Checking only from my own laptop**. A logged-in session, a warm service worker and a home network the edge already trusts will hide the failure. The edge is the CDN sitting in front of your origin: Cloudflare, Fastly, a cloud load balancer. It answers some requests itself, and those never reach your server or its log.
- **Editing `robots.txt` when the block lived at the edge**. Bot-protection and WAF rules are invisible in that file, and the file was clean the whole time. Look for Cloudflare's **Configure AI bot policies** under **Security Settings**, and any WAF custom rule beside it. This is the most common hidden blocker I run into.
- **Rewriting titles and descriptions first**. On a page that is not in the index, on-page work produces nothing you can measure.

## Verify

Run the `seo-audit` skill from [Tools](/tools/). It walks this order and collects the answers into one report, which is faster than checking seven things by hand.

Then confirm the three facts the report cannot fake:

- `curl -sI` on the page returns 200 and carries no `X-Robots-Tag`.
- `curl -sL` on the same URL contains a sentence you can read on the page.
- URL Inspection in Search Console says the URL is on Google.
- Cloudflare's **Analytics** → **Events**, filtered to the Block action, holds nothing for your own URLs. A blocked crawler shows there and nowhere on your server.

Read the wording in Search Console literally. "Discovered — currently not indexed" means the URL is known and was not fetched. "Crawled — currently not indexed" means it was fetched and judged not worth keeping. Those are two different bugs with two different fixes.

Once one page is in, hand over the rest: [submit and verify](/indexing/submit-and-verify/).

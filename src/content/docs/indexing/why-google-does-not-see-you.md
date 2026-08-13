---
title: Google does not see your site
description: The site is live and search returns nothing for it. The checks that find the real blocker, in the order they have to run.
updated: 2026-08-12
sources:
  - What robots.txt can and cannot do — https://developers.google.com/search/docs/crawling-indexing/robots/intro
  - How Google reads robots.txt — https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
  - noindex in a tag and in a header — https://developers.google.com/search/docs/crawling-indexing/block-indexing
  - How to set a canonical URL — https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
  - What the crawler sees in a JavaScript app — https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - Sitemap protocol and its limits — https://www.sitemaps.org/protocol.html
  - Cloudflare's Block AI bots switch — https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
  - What a Cloudflare rule action does — https://developers.cloudflare.com/ruleset-engine/rules-language/actions/
  - Security Events, where a block shows up — https://developers.cloudflare.com/waf/analytics/security-events/
---

## What we are solving

The site has been live for weeks and search returns nothing for it. Not a weak position — no result at all.

Indexing fails from the top down. A page has to be fetchable, then crawlable, then indexable, and only then rankable.

A rewritten `title` on a `noindex` page changes nothing. So the checks below run in order, and you stop at the first one that fails: on a blocked page, everything underneath it is unmeasurable.

## Steps

### Does the crawler get any text at all

The first thing I check is what the server hands over before any JavaScript runs. Fetch the page and look for a sentence you can read on it with your own eyes:

```
curl -sL https://example.com/page | grep -i "a sentence you can see on the page"
```

If grep says nothing and the browser shows the text, the client is drawing it. A client-side app answers with a near-empty `<body>`, so the crawler gets a page with nothing in it to index. The fix is server rendering or a prerender step at build time, not a tag.

### What is actually in your robots.txt

Pull the file from the live domain and read all of it, not the lines you wrote yourself:

```
curl -s https://example.com/robots.txt
```

The classic one is a `Disallow: /` that rode in from a staging config with the deploy. The second case is quieter. Google stops reading the file past 500 kibibytes, so a generated robots can truncate silently somewhere in the middle, and everything below that point does not exist for it.

### Are you asking search to drop the page yourself

`noindex` lives in two places, and one of them is invisible to the eye. The meta tag sits in the HTML; the other one is the `X-Robots-Tag` response header, which never shows up in View Source:

```
curl -sI https://example.com/page | grep -i x-robots-tag
```

`curl -sI` sends a HEAD request and prints the headers alone. In a browser the same thing is under Network, the document request, Response Headers.

That header can come from the framework, the web server or the CDN — each of them a different file to open. There is also a per-agent form, `X-Robots-Tag: googlebot: noindex`, and it looks like an ordinary line of config.

A page with `noindex` is fetched and understood honestly enough, and then dropped on purpose.

### How many addresses the page has, and where it points

Every page should carry a canonical pointing at itself or at the real original:

```
curl -sL https://example.com/page | grep -i 'rel="canonical"'
```

A template that hardcodes the home page as the canonical across every page is literally asking search to discard the rest of the site.

Then the number of address forms that answer with the same page. Trailing slash, `www`, `http`, `index.html` and tracking parameters all have to redirect to a single form:

```
for u in http://example.com/page https://www.example.com/page https://example.com/page/ https://example.com/page/index.html; do
  curl -o /dev/null -sw "%{http_code} %{redirect_url}\n" "$u"
done
```

Otherwise the signal splits between duplicates, the sitemap starts disagreeing with the canonical tag, and search settles that argument on its own, without you.

### Is the sitemap alive, or merely present

What matters is not that the file exists but that every URL in it answers 200, is absolute, and is in the canonical form:

```
curl -s https://example.com/sitemap.xml | grep -o '<loc>[^<]*' | cut -c6- |
  while read -r url; do curl -o /dev/null -sw "%{http_code} $url\n" "$url"; done
```

The protocol caps one file at 50,000 URLs and 50MB uncompressed — past that, split the file and add a sitemap index. A map stuffed with redirects and 404s devalues itself: it stops being read as the truth about the site.

### Is the site visible from outside your network

The last check does not run from your machine. Resolve the domain from another address and request the page without cookies:

```
ssh other-box 'curl -sI https://example.com/page'
```

Access control, basic auth and edge bot rules answer with a login page or a 403, and none of that is visible in `robots.txt`.

The edge rule has a name and a screen. On Cloudflare it is **Configure AI bot policies**, on the zone's **Security Settings** page, on every plan. It refuses matching agents with a 403 from Cloudflare's own network, before the request reaches your server.

Which is also why the refusal is not in your server log — it shows only in Cloudflare's **Analytics** → **Events**. The whole mechanism is on [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).

## What did not work

- **Waiting for the index to catch up**. The crawler does come back, reads the same rule and leaves again. Patience does not edit a header.
- **Re-submitting one URL in the inspection tool**. The re-fetch uses the same `robots.txt`, the same header, the same empty body. The verdict comes back identical and the daily quota is gone.
- **Trusting a third-party crawler as proof of access**. It reports what a bot could fetch from its own address. Whether search decided to keep the page is a different question.
- **Checking only from my own laptop**. A logged-in session, a warm service worker and a home network the edge already trusts hide the failure completely. The edge is the CDN sitting in front of your origin: Cloudflare, Fastly, a cloud load balancer. It answers some requests itself, and those never reach your server or its log.
- **Editing `robots.txt` when the block lived at the edge**. Bot-protection and WAF rules are invisible in that file, and the file was clean the whole time. Look for Cloudflare's **Configure AI bot policies** under **Security Settings**, and any WAF custom rule beside it. This is the most common hidden blocker I run into.
- **Rewriting titles and descriptions first**. On a page that is not in the index, on-page work produces nothing you can measure.

## Verify

Run the `seo-audit` skill from [Tools](/tools/). It walks this same order and collects the answers into one report, which is faster than checking all of it by hand.

Then confirm what the report cannot fake:

- `curl -sI` on the page returns 200 and carries no `X-Robots-Tag`.
- `curl -sL` on the same URL contains a sentence you can read on the page.
- URL Inspection in Search Console says the URL is on Google.
- Cloudflare's **Analytics** → **Events**, filtered to the Block action, holds nothing for your own URLs. A blocked crawler shows there and nowhere on your server.

A rough count of how many pages reached the index at all is done straight from the search box:

```
site:example.com
```

Read the wording in Search Console literally. "Discovered — currently not indexed" means the URL is known and was not fetched. "Crawled — currently not indexed" means it was fetched and judged not worth keeping. Those are two different bugs with two different fixes.

Once one page is in, hand over the rest: [submit and verify](/indexing/submit-and-verify/).

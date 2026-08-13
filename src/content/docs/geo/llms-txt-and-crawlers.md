---
title: AI crawlers and llms.txt
description: Which AI agents visit a site, who owns them, where access is really decided, and what belongs in llms.txt.
updated: 2026-08-13
sources:
  - Cloudflare GraphQL Analytics, site atlas.smolevich.com, measured 2026-08-13
  - nginx access log, dataset /var/log/nginx/access.log, measured 2026-08-12
  - nginx access log, dataset /var/log/nginx/access.log.*.gz, measured 2026-08-12
  - https://www.rfc-editor.org/rfc/rfc9309.html
  - https://developers.openai.com/api/docs/bots
  - https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
  - https://docs.perplexity.ai/guides/bots
  - https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
  - https://developers.google.com/search/docs/appearance/ai-features
  - https://support.google.com/webmasters/answer/16908024
  - https://blog.google/products-and-platforms/products/search/new-controls-website-owners/
  - https://llmstxt.org/
  - https://darkvisitors.com/
  - https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
  - https://developers.cloudflare.com/bots/concepts/bot/
  - https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
  - https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/
  - https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/what-is-pay-per-crawl/
  - https://developers.cloudflare.com/ruleset-engine/rules-language/actions/
  - https://developers.cloudflare.com/waf/analytics/security-events/
---

## What we are solving

You have to decide who is allowed to read the site, and on most projects that decision gets made by accident, in a panel nobody opened. A crawler that never reaches you leaves you out of AI answers, and after that the quality of the page stops mattering.

The trap sits in the phrase "AI bot". Three different jobs hide behind those two words, and saying no to each of them costs you a different amount.

## Steps

Sort the agents by job before you decide anything. A search crawler, a training crawler and a fetcher acting for a user are three separate calls.

| User agent | Owner | Job | What a block costs |
|---|---|---|---|
| `OAI-SearchBot` | OpenAI | Search index | You are gone from ChatGPT search results |
| `ChatGPT-User` | OpenAI | Fetch on user request | Little — OpenAI documents that robots.txt may not apply to it |
| `GPTBot` | OpenAI | Training corpus | Nothing in today's answers |
| `Claude-SearchBot` | Anthropic | Search index | You are gone from Claude's web results |
| `Claude-User` | Anthropic | Fetch on user request | A URL your reader pastes will not open in the chat |
| `ClaudeBot` | Anthropic | Training corpus | Nothing in today's answers |
| `PerplexityBot` | Perplexity | Search index | You are gone from the engine with the clearest attribution |
| `Perplexity-User` | Perplexity | Fetch on user request | Little — Perplexity documents that it generally ignores robots.txt |
| `Google-Extended` | Google | Control token | Out of Gemini training and Vertex AI grounding |
| `GoogleOther` | Google | Assorted internal fetches | Little in AI answers |
| `CCBot` | Common Crawl | Open corpus for training | Nothing in today's answers |

### What goes in robots.txt when you want nothing unusual

Four lines, and on most projects the file ends there.

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

That is what this site serves. I name an agent only when I want to block it, because a list of agents allowed by name is a list somebody then has to maintain. Vendors ship new names faster than anyone goes back to re-read the file.

Read what the live domain serves rather than what sits in your repository — a CDN can rewrite this file on the way out.

```bash
curl -sS https://example.com/robots.txt
```

Cloudflare's managed version sits on the zone's **Security Settings** page, under the **Bot traffic** filter. It is on every plan, and turned on it prepends its own `Disallow` lines above yours. A Free-plan domain with no file of its own is served Cloudflare's Content Signals Policy instead.

Search and user-triggered agents decide whether you exist in an answer today. The training group is a values call, and it is the only case where I would type a name at all.

### Which of your rules actually bind anybody

The crawlers honour `robots.txt`. The fetchers do not always, and the gap between the two is wide enough to ruin a diagnosis.

OpenAI writes that because the action is initiated by a user, robots.txt rules may not apply. Perplexity says its user agent generally ignores the file, for the same reason. Anthropic is the exception and says its bots honour it.

So the same `Disallow` line behaves three different ways at three vendors, and nothing in your file will tell you that — only their documentation does.

### Google-Extended switches off something else

It is a control token with no user agent of its own, so you will never see it arrive, and it carries no ranking signal. What it covers is training of the Gemini models and Grounding with Google Search on Vertex AI.

Blocking it changes nothing in Google Search. AI Overviews is part of Search, and plain `Googlebot` does the crawling for it.

### Getting out of AI Overviews for real

There is a dedicated control, in Search Console under Settings → Search generative AI. It covers AI Overviews, AI Mode and the generative features in Discover, and Google states it is not used as a ranking signal elsewhere in Search.

`nosnippet`, `data-nosnippet` and `max-snippet` keep you out too, except they take your ordinary Search snippet with them. The dedicated control does not charge that. It is rolling out to a subset of owners, so it may not be in your property yet.

### If you do name agents, the order of the groups decides

RFC 9309 says a crawler obeys one group — the one whose name matches it best. A generous `User-agent: *` further down does not rescue an agent you blocked above it.

The rule cuts both ways, and that is the half that bites: one stale group silently overrides the wildcard under it. Which is why I keep no per-agent allow list at all.

### Where the block actually lives

Three layers sit under `robots.txt` and none of them shows up in the file: the `X-Robots-Tag` header, the meta tag, and the edge. A CDN toggle, a WAF rule — a firewall that matches HTTP requests — or a rate limit answers 403 while you go on editing a file that nobody is reading.

On Cloudflare the control is called **Configure AI bot policies**, on the zone's **Security Settings** page. It is on every plan, Free included, and it sorts agents into Search, Agent and Training. Each of those three takes Allow, Block on all pages, or Block only on pages with ads.

Which agents those three words cover is Cloudflare's own list, and it changes without you. Block is terminating: Cloudflare answers 403 from its own network and your server never sees the request.

From 15 September 2026 a domain new to Cloudflare arrives with Training and Agent blocked on ad-bearing pages. The older single switch beside it, **Block AI bots**, retires the same day. Existing zones keep their settings, and anyone can opt out of the new defaults before then.

The same panel can charge instead of refusing. Pay per crawl answers 402, and it is in closed beta.

### A name in the log is a claim, not an identity

Anyone can send a user agent string, and I sent myself a pile of them. A `curl` loop of mine put vendor names into my own access log, and I read them back for two weeks as visits. Vendors publish IP ranges and reverse DNS for their crawlers, so check a client against those before you treat its line as evidence of a visit or of an attack. What that cost me is written out in [who actually crawls you](/geo/who-actually-crawls-you/).

### Is llms.txt worth writing

If you ship developer docs, yes. Otherwise probably not, and the reason is not an opinion about the format.

The file costs ten minutes and no vendor commits to reading it. Here is what mine got in 16 days:

| Who fetched `llms.txt` | Requests |
|---|---|
| my own `curl` | 44 |
| `SiteAuditBot` (Semrush) | 1 |
| AI agents | 0 |
| **total** | **45** |

For comparison, `robots.txt` was fetched 56 times in the same window, and those were real crawlers.

Two caveats, without which that zero cannot be read. The window has a hole: logrotate keeps 14 daily archives, so 20 to 28 July did not survive. And a request the edge refuses never reaches nginx, so it never appears in this table at all. You cannot see that from the server side, so I went and read both sides for one day:

| | Cloudflare | nginx |
|---|---|---|
| Requests | 668 | 672 |
| 200 | 651 | 648 |
| 404 | 13 | 13 |
| **403** | **0** | **0** |

The counts agree and there is not one 403 on either side, so my edge refuses nobody. The four-request gap is my nginx window running an hour wider; Cloudflare's free plan hands out this dataset a day at a time and would not let me match it exactly.

That is the check to run. If the edge were refusing anyone, Cloudflare's counter would sit well above the server's, and the gap would be your answer. The full read is in [who actually crawls you](/geo/who-actually-crawls-you/).

So on a small marketing site this is a cheap bet with a measured payoff of 0, and on forty pages of docs it is a reasonable one. Anywhere else I would rather spend the ten minutes on `robots.txt` and the sitemap, which every agent does read.

The format itself is short: an H1 on the first line, a one-sentence blockquote under it, absolute links, and a description after every colon. Where `robots.txt` says which paths to stay out of, this one says what is worth reading, in your own words.

```markdown
# Project name

> One sentence about what this is and who it is for.

## Docs

- [Page title](https://example.com/page): what it covers and when it helps.

## Optional

- [Secondary page](https://example.com/extra): safe to skip under a tight context budget.
```

### Who actually came, which only the log will tell you

Support for `llms.txt` is a convention, not a standard anyone enforces, so the only honest answer about your own visitors lives in the access log.

```bash
zcat -f /var/log/nginx/example.access.log* \
  | grep -icE 'chatgpt-user|oai-searchbot|gptbot|perplexity|claude-user|claudebot|meta-externalagent'
```

Mine is counted out in [who actually crawls you](/geo/who-actually-crawls-you/), and the same page holds the limit of this method. A request the edge blocked never reaches your server, so it never becomes a line here. Grep for an agent Cloudflare is refusing and you get nothing back, and the log then reads like a web where nobody came.

Those requests are counted on the other side of the block. Cloudflare counts them under **AI Crawl Control**, in the **Crawlers** and **Metrics** tabs. The block itself lands under **Analytics** → **Events**, and Free plans keep 24 hours of it.

## What did not work

- **Blocking everything to save bandwidth**. The block sat at the edge, in the CDN's own AI-bot setting, and not in `robots.txt` where I kept looking for it. Agent is one of the three behaviours those settings cover, so it stopped the fetchers as well. A reader who pasted the URL into a chat was told the page could not be opened.
- **Losing the citation along with the bill**. The busiest AI agent in my log took 341 requests in 16 days — [who actually crawls you](/geo/who-actually-crawls-you/). It is `ChatGPT-User`, a human has to trigger it, and I cannot prove the human was not me. Turning that traffic off is quick; getting back into the answer is not.
- **Making `llms.txt` a required item**. This page told you to publish it and the route repeated the instruction, and then my own log recorded 0 fetches by any AI agent in 16 days. I stopped calling it a step. It is conditional now, and the condition is developer docs.
- **Allowing agents by name in `robots.txt`**. The route asked readers to list every search and user-triggered agent explicitly, which this site has never done — it serves `User-agent: *` and `Allow: /`. The named list is work that expires, and RFC 9309 lets a stale group override the wildcard under it.
- **Disallowing `Google-Extended` to get out of AI Overviews**. It is a line in `robots.txt` and it governs something else entirely: training the Gemini models, and whether Gemini pulls your pages into an answer of its own. Plain `Googlebot` crawls for AI Overviews, so my rule changed nothing. The switch I wanted was in Search Console, under Settings → Search generative AI.
- **Steering AI Overviews with `nosnippet`**. That was the advice on this page until 3 June 2026, when Google shipped the dedicated Search Console control. The snippet directives also cost you the ordinary Search snippet, which the dedicated control does not.
- **Trusting a vendor page that had stopped moving**. Google's own `ai-features` documentation still lists only the snippet directives, and it was last updated 2025-12-10. So this page was faithfully reproducing a source that had gone stale under it.
- **Writing `Disallow` for `ChatGPT-User` and calling it a block**. OpenAI documents that a user-initiated fetch may ignore robots.txt, and Perplexity says the same about its own. I was politely asking a client that had already been told it need not listen.
- **Editing `robots.txt` while the edge did the blocking**. The file allowed every agent by name, the bot-protection rule in front of it returned 403, and the log showed no successful fetches at all. That rule is invisible in `robots.txt`, in the page source and in the server log, and it shows up only in the CDN's own security events.
- **Listing outlines in `llms.txt`**. A line in that file is a promise that the page behind it is written. Half-finished links teach a reader — human or model — to ignore the whole file.
- **Treating `robots.txt` as enforcement**. It is a request, and well-behaved crawlers honour it. A scraper that ignores it gets stopped at the edge or it does not get stopped.

## Verify

Run `geo-crawlers` from [Tools](/tools/). It reads `robots.txt`, the meta tags and the response headers, and gives back an access map per agent, which is how you catch a rule you forgot you wrote.

Run `geo-llmstxt` from the same place. It validates an existing file or drafts one from the site structure, and it flags links that lead nowhere.

Then confirm from outside:

- Find out what sits in front of your origin at all.

  ```bash
  curl -sI https://example.com | grep -iE '^(server|via|cf-ray):'
  ```

  A `cf-ray` header means Cloudflare; Vercel, Netlify and Fastly announce themselves the same way. If nothing is in front, only your firewall and your web server can refuse a crawler, and the checks below move there.
- On Cloudflare, open **Security Settings** and read what **Configure AI bot policies** is set to. A default you never chose is still your setting.
- On Cloudflare, open **Analytics** → **Events** and filter the action to Block. Agents refused there appear in no log on your own box. Other platforms keep their own edge or firewall log, and if yours has none, the request either reached your server or vanished where you cannot see it.
- Request a page as a crawler, from a network that is not yours, and check for 200.

  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' -A 'OAI-SearchBot' https://example.com/
  ```
- If you published `llms.txt`, fetch it the same way and confirm every link in it returns 200.
- Ask an assistant to open one of your URLs. If it cannot, the block is real, and the diagnosis above tells you which layer holds it.
- Write down the minute you did that. It lands in your log as `ChatGPT-User` or `Claude-User`, from the vendor's address, indistinguishable from a stranger's visit.

Access is only the gate. What gets quoted once you are through it is a separate problem: [why AI answers cite someone else](/geo/citable-pages/).

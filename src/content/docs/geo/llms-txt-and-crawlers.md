---
title: AI crawlers and llms.txt
description: Which AI agents visit a site, who owns them, where access is really decided, and what belongs in llms.txt.
updated: 2026-08-12
sources:
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
---

## What we are solving

You have to decide who is allowed to read the site, and the decision is usually made by accident. A blocked crawler means absence from AI answers at any quality of content.

The trap is that "AI bot" is not one thing. Three different jobs hide behind that phrase, and they cost you different amounts when you say no.

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

1. **Allow everything by default** — the whole file for most projects is four lines.

   ```text
   User-agent: *
   Allow: /

   Sitemap: https://example.com/sitemap-index.xml
   ```

   That is what this site serves. Name an agent only when you want to block it.
   A list of agents allowed by name is a list you have to maintain. Vendors ship new names faster than anyone re-reads the file.
   Search and user-triggered agents decide whether you exist in an answer today. The training group is a values call, and the only case worth typing a name for.
2. **Know which of your rules actually bind** — `robots.txt` is honoured by the crawlers, not always by the fetchers.
   OpenAI writes that because the action is initiated by a user, robots.txt rules may not apply. Perplexity says its user agent generally ignores the file, for the same reason.
   Anthropic is the exception and says its bots honour it. One `Disallow`, three vendors, three different outcomes.
3. **Know what `Google-Extended` is not** — a control token with no user agent of its own, and no ranking signal.
   It covers training of Gemini models and Grounding with Google Search on Vertex AI. Blocking it changes nothing in Google Search.
   AI Overviews is part of Search, and `Googlebot` crawls for it.
4. **Use the dedicated control for AI Overviews** — Search Console, Settings, Search generative AI.
   It covers AI Overviews, AI Mode and the generative features in Discover. Google states it is not used as a ranking signal elsewhere in Search.
   `nosnippet`, `data-nosnippet` and `max-snippet` keep you out too, and take your ordinary Search snippet with them. The dedicated control does not charge that.
   It is rolling out to a subset of owners, so it may not be in your property yet.
5. **If you do name agents, put the most specific group first** — that is the rule in RFC 9309.
   A crawler obeys the single group whose name matches it best. A generous `User-agent: *` does not rescue an agent you blocked above it.
   The rule cuts both ways. One stale group silently overrides the wildcard under it, which is why a per-agent allow list is worth avoiding.
6. **Check the layers under `robots.txt`** — the `X-Robots-Tag` header, the meta tag, and the edge.
   A CDN toggle named "block AI scrapers", a WAF rule, a rate limit: any of them answers 403. None of them appears in the file you keep editing.
7. **Verify identity by network, not by name** — the user agent string is a claim, and anyone can send it.
   Vendors publish IP ranges and reverse DNS for their crawlers. Check those before you treat a log line as evidence of either a visit or an attack.
8. **Publish `llms.txt` only if you ship developer docs** — it costs ten minutes, and no vendor commits to reading it.
   My own log settles the general case. In 16 days no AI agent fetched the file once: [who actually crawls you](/geo/who-actually-crawls-you/).
   So on a small marketing site it is a cheap bet with a measured payoff of zero. On forty pages of docs it is a reasonable one.
   Skip it otherwise, and spend the ten minutes on `robots.txt` and the sitemap, which every agent does read.

   The format, if you write one — a markdown file that names the pages worth reading.
   `robots.txt` says where not to go. `llms.txt` says what matters, in your own words.

   ```markdown
   # Project name

   > One sentence about what this is and who it is for.

   ## Docs

   - [Page title](https://example.com/page): what it covers and when it helps.

   ## Optional

   - [Secondary page](https://example.com/extra): safe to skip under a tight context budget.
   ```

   The rules are short. An H1 on the first line, a one-sentence blockquote under it, absolute links, a description after every colon.
9. **Grep the access log for who actually came** — the agent names above, plus requests for `/llms.txt`.
   Support for the file is a convention, not a standard anyone enforces. Your log is the only honest answer about who reads it.
   Mine is counted out here: [who actually crawls you](/geo/who-actually-crawls-you/).

## What did not work

- **Blocking everything to save bandwidth**. That block sat at the edge, not in `robots.txt`, so it stopped the fetchers too. A reader who pasted the URL into a chat got told the page could not be opened.
- **Losing the citation along with the bill**. The busiest AI agent in my own log took 341 requests in 16 days — [who actually crawls you](/geo/who-actually-crawls-you/). It is `ChatGPT-User`, a human has to trigger it, and I cannot prove the human was not me. Presence in the answer still does not come back cheaply.
- **Making `llms.txt` a required item**. This page told you to publish it and the route repeated the instruction. My own log recorded 0 fetches by any AI agent in 16 days. A file nothing reads is not a step in a checklist. It is now conditional, and the condition is developer docs.
- **Allowing agents by name in `robots.txt`**. The route asked readers to list every search and user-triggered agent explicitly. This site has never done that: it serves `User-agent: *` and `Allow: /`. The named list is work that expires, and RFC 9309 makes a stale group override the wildcard under it.
- **Reaching for `Google-Extended` to steer AI Overviews**. Wrong lever: AI Overviews runs on `Googlebot`, and the token covers Gemini training and Vertex AI grounding. The rule moved nothing, and the control that does cover AI Overviews now sits in Search Console.
- **Steering AI Overviews with `nosnippet`**. That was this page's advice until 3 June 2026, when Google shipped a dedicated Search Console control. The snippet directives also cost you the ordinary Search snippet, which the dedicated control does not.
- **Trusting a vendor page that had stopped moving**. Google's own `ai-features` documentation still lists only the snippet directives. It was last updated 2025-12-10, so this page was faithfully reproducing a stale source.
- **Writing `Disallow` for `ChatGPT-User` and calling it a block**. OpenAI documents that a user-initiated fetch may ignore robots.txt, and Perplexity says the same of its own. The rule was a request to a client already told it need not listen.
- **Editing `robots.txt` while the edge did the blocking**. The file allowed every agent by name. The bot-protection rule in front of it returned 403, and the log showed no successful fetches at all.
- **Listing outlines in `llms.txt`**. A line in that file is a promise that the page behind it is written. Half-finished links teach a reader — human or model — to ignore the file.
- **Treating `robots.txt` as enforcement**. It is a request that well-behaved crawlers honour. A scraper that ignores it is stopped at the edge or not at all.

## Verify

Run `geo-crawlers` from [Tools](/tools/). It reads `robots.txt`, the meta tags and the response headers. What comes back is an access map per agent, which is how you catch a rule you forgot.

Run `geo-llmstxt` from the same place. It validates an existing file or drafts one from the site structure, and it flags links that lead nowhere.

Then confirm from outside:

- Request a page with a crawler's user agent from a network that is not yours, and check for 200.
- If you published `llms.txt`, fetch it the same way and confirm every link in it returns 200.
- Ask an assistant to open one of your URLs. If it cannot, the block is real and the diagnosis above tells you which layer holds it.
- Write down the minute you did that. It lands in your log as `ChatGPT-User` or `Claude-User`, from the vendor's address, indistinguishable from a stranger's visit.

Access is only the gate. What gets quoted once you are through it is a separate problem: [why AI answers cite someone else](/geo/citable-pages/).

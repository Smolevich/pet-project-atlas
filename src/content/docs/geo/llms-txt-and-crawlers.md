---
title: AI crawlers and llms.txt
description: Which AI agents visit a site, who owns them, where access is really decided, and what belongs in llms.txt.
updated: 2026-08-10
sources:
  - https://www.rfc-editor.org/rfc/rfc9309.html
  - https://developers.openai.com/api/docs/bots
  - https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
  - https://docs.perplexity.ai/guides/bots
  - https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
  - https://developers.google.com/search/docs/appearance/ai-features
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
| `ChatGPT-User` | OpenAI | Fetch on user request | A pasted URL of yours will not open in the chat |
| `GPTBot` | OpenAI | Training corpus | Nothing in today's answers |
| `Claude-SearchBot` | Anthropic | Search index | You are gone from Claude's web results |
| `Claude-User` | Anthropic | Fetch on user request | The same broken paste, in a different chat |
| `ClaudeBot` | Anthropic | Training corpus | Nothing in today's answers |
| `PerplexityBot` | Perplexity | Search index | You are gone from the engine with the clearest attribution |
| `Perplexity-User` | Perplexity | Fetch on user request | Links your reader sends do not open |
| `Google-Extended` | Google | Control token | Out of Gemini training and Vertex AI grounding |
| `GoogleOther` | Google | Assorted internal fetches | Little in AI answers |
| `CCBot` | Common Crawl | Open corpus for training | Nothing in today's answers |

1. **Allow search and user-triggered agents, always** — these two decide whether you exist in an answer today.
   The training group is a values call, not a traffic call. Saying no there costs nothing you can measure this quarter.
2. **Know what `Google-Extended` is not** — a control token with no user agent of its own, and no ranking signal.
   It covers training of Gemini models and Grounding with Google Search on Vertex AI. Blocking it changes nothing in Google Search.
   AI Overviews is part of Search, and `Googlebot` crawls for it. The levers there are `nosnippet`, `data-nosnippet`, `max-snippet` and `noindex`.
3. **Write `robots.txt` per agent, most specific first** — a crawler obeys the single group that matches its name best.
   That is the rule in RFC 9309. A generous `User-agent: *` does not rescue an agent you named and blocked above it.
4. **Check the layers under `robots.txt`** — the `X-Robots-Tag` header, the meta tag, and the edge.
   A CDN toggle named "block AI scrapers", a WAF rule, a rate limit: any of them answers 403. None of them appears in the file you keep editing.
5. **Verify identity by network, not by name** — the user agent string is a claim, and anyone can send it.
   Vendors publish IP ranges and reverse DNS for their crawlers. Check those before you treat a log line as evidence of either a visit or an attack.
6. **Publish `llms.txt` at the site root** — a markdown file that names the pages worth reading.
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
7. **Grep the access log for who actually came** — the agent names above, plus requests for `/llms.txt`.
   Support for the file is a convention, not a standard anyone enforces. Your log is the only honest answer about who reads it.

## What did not work

- **Blocking everything to save bandwidth**. The training crawlers went, and the user-triggered fetchers went with them. A reader who pasted the URL into a chat got told the page could not be opened.
- **Losing the citation along with the bill**. Bandwidth from these agents is a rounding error on a static site. Presence in the answer is not.
- **Reaching for `Google-Extended` to steer AI Overviews**. Wrong lever: AI Overviews runs on `Googlebot`, and the token covers Gemini training and Vertex AI grounding. The rule moved nothing, and the snippet directives are what actually touch Search.
- **Editing `robots.txt` while the edge did the blocking**. The file allowed every agent by name. The bot-protection rule in front of it returned 403, and the log showed no successful fetches at all.
- **Listing outlines in `llms.txt`**. A line in that file is a promise that the page behind it is written. Half-finished links teach a reader — human or model — to ignore the file.
- **Treating `robots.txt` as enforcement**. It is a request that well-behaved crawlers honour. A scraper that ignores it is stopped at the edge or not at all.

## Verify

Run `geo-crawlers` from [Tools](/tools/). It reads `robots.txt`, the meta tags and the response headers. What comes back is an access map per agent, which is how you catch a rule you forgot.

Run `geo-llmstxt` from the same place. It validates an existing file or drafts one from the site structure, and it flags links that lead nowhere.

Then confirm from outside:

- Request a page with a crawler's user agent from a network that is not yours, and check for 200.
- Fetch `/llms.txt` the same way, and confirm every link in it returns 200.
- Ask an assistant to open one of your URLs. If it cannot, the block is real and the diagnosis above tells you which layer holds it.

Access is only the gate. What gets quoted once you are through it is a separate problem: [why AI answers cite someone else](/geo/citable-pages/).

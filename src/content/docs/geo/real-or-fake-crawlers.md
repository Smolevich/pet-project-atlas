---
title: Real crawler or fake one
sidebar:
  order: 4
description: A bot name in the User-Agent proves nothing. How Cloudflare confirms a crawler, what the free plan shows, a GraphQL query that splits real from fake, and one WAF rule — with thirty days of numbers from my own zone.
updated: 2026-10-18
sources:
  - Cloudflare GraphQL Analytics, site voice.smolevich.com, measured 2026-10-18
  - Cloudflare GraphQL Analytics, site smolevich.com, measured 2026-10-17
  - How Cloudflare verifies a bot — https://developers.cloudflare.com/bots/concepts/bot/verified-bots/
  - Reverse DNS and published IP lists — https://developers.cloudflare.com/bots/reference/bot-verification/ip-validation/
  - The category names a verified bot gets — https://developers.cloudflare.com/bots/concepts/bot/verified-bots/categories/
  - The rule field cf.client.bot — https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.client.bot/
  - The rule field cf.verified_bot_category — https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.verified_bot_category/
  - Rule operators, and which plans get regex — https://developers.cloudflare.com/ruleset-engine/rules-language/operators/
  - The lower() function in rules — https://developers.cloudflare.com/ruleset-engine/rules-language/functions/
  - Custom rules and the free-plan limits — https://developers.cloudflare.com/waf/custom-rules/
  - A rule with not cf.client.bot in it — https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-verified-bots/
  - Bot score and bot groups by plan — https://developers.cloudflare.com/bots/concepts/bot-score/
  - What the free plan gets against bots — https://developers.cloudflare.com/bots/plans/free/
  - Security Analytics retention by plan — https://developers.cloudflare.com/waf/analytics/security-analytics/
  - The GraphQL Analytics endpoint — https://developers.cloudflare.com/analytics/graphql-api/
  - How far back adaptive datasets go — https://developers.cloudflare.com/analytics/graphql-api/limits/
  - Why Perplexity is no longer a verified bot — https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/
---

## What we are solving

A request says `GPTBot` in its User-Agent — the free-text header where a client names itself. Anyone can type that string. My [nginx log](/geo/who-actually-crawls-you/) could not tell the real crawler from a scanner wearing its name, and I had been counting both.

So I pulled thirty days from Cloudflare, which sits in front of every site on my domain. Across the whole zone, crawler names without Cloudflare's confirmation outnumbered confirmed ones almost five to one. On one site, voice.smolevich.com, the picture was the opposite.

## Steps

### 1. Why the name in the header is worth nothing

The User-Agent is whatever the client chooses to send, so `curl -A "GPTBot/1.1" https://example.com/` puts exactly the same string in your log as the real crawler does, and nothing in that line tells the two apart.

Over 30 days, 17 September to 16 October 2026, my zone took 245,883 requests. 8,249 carried the names GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot or ChatGPT-User without Cloudflare's confirmation. Only 1,689 under those five names were confirmed.

Where the fakes went says what they were. Requests with `.env` in the path — the file where apps keep passwords and keys — came to 19,398 across the zone. Of 1,996 unconfirmed PerplexityBot requests, 60 landed on pages that exist.

### 2. How Cloudflare decides a bot is real

Cloudflare keeps a list of verified bots. A bot owner registers a User-Agent pattern plus a way to prove where requests come from.

There are three ways to prove it: a published list of IP ranges that Cloudflare fetches, reverse DNS — the IP resolves back to a domain the owner named, like `googlebot.com` — or a cryptographic signature on each request, called Web Bot Auth.

A request that passes gets a category: `Search Engine Crawler`, `AI Crawler`, `AI Assistant`, `AI Search` and a dozen more. A request that fails the check, or comes from a bot that never registered, gets an empty category, and that empty field is the whole test I use.

One bot fails it on purpose. In August 2025 Cloudflare de-listed Perplexity as a verified bot, after catching it crawling under undeclared names. So every PerplexityBot request is unconfirmed, the real ones included.

### 3. What the free plan shows you, and what it does not

On the free plan you get the verified-bot category and nothing finer.

| Thing | Free | Paid |
|---|---|---|
| Verified bot category, in rules, GraphQL and the dashboard | yes | yes |
| `cf.client.bot`, true for a verified bot | yes | yes |
| Bot groups like "likely automated" | no | Pro and up |
| Bot score, a 1–99 guess per request | no | Enterprise Bot Management |
| Regex in rules | no | Business and up |
| ASN as a GraphQL field | no | not checked |

ASN — the number of the network an IP belongs to, like a cloud provider — is the one that cost me an evening. My zone's GraphQL answered `does not have access to the field 'clientasn'`. The dashboard still prints ASN on each sampled request, one row at a time.

Bot Fight Mode is on the free plan too. It challenges simple bots from cloud hosts and headless browsers, and it does not tell you what it caught.

### 4. Split them in the dashboard

1. Open the zone, then **Security** → **Analytics**, the **Traffic** tab.
2. Click **Filter** and type `bot`. On my free zone the only bot field offered was **Verified Bot Category**.
3. Pick a category, say `AI Crawler`, and read the chart: that is confirmed traffic.
4. Scroll to **Sampled logs** and expand a row. A confirmed request shows **Verified Bot Category: AI Crawler** next to its IP, country, ASN and User-Agent. A fake shows the bot's name in User-Agent and no category line.

The free dashboard has no User-Agent filter, so you cannot ask it for "everything that says GPTBot but is not verified" — that question needs GraphQL.

### 5. Split them through GraphQL

GraphQL Analytics is Cloudflare's query API at `https://api.cloudflare.com/client/v4/graphql`. You need an API token with **Zone → Analytics → Read**.

One day per query keeps you under the row limit. Adaptive data — the sampled per-request dataset this query reads — goes back at least 31 days on every plan, which is why thirty days is the longest window I could take.

```bash
curl -s https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data @- <<'EOF'
{"query": "{ viewer { zones(filter:{zoneTag:\"YOUR_ZONE_ID\"}) { rows: httpRequestsAdaptiveGroups(limit:10000, filter:{datetime_geq:\"2026-10-17T00:00:00Z\", datetime_lt:\"2026-10-18T00:00:00Z\", clientRequestHTTPHost:\"example.com\"}, orderBy:[count_DESC]) { count dimensions { userAgent verifiedBotCategory clientRequestPath clientCountryName edgeResponseStatus } } } } }"}
EOF
```

Then sort each row by two questions. Does `userAgent` carry a bot name? Is `verifiedBotCategory` an empty string? Name plus empty category is a request I call unconfirmed.

```bash
jq -r '.data.viewer.zones[0].rows[]
  | select(.dimensions.userAgent | test("gptbot|claudebot|perplexitybot|oai-searchbot|chatgpt-user|googlebot|bingbot"; "i"))
  | [(if .dimensions.verifiedBotCategory == "" then "unconfirmed" else "verified" end), .count, .dimensions.clientRequestPath]
  | @tsv' day.json | sort | head -40
```

The `count` is an estimate. Adaptive groups are sampled, and my zone total ran 1.6% above Cloudflare's own daily counter.

### 6. One rule that drops the fakes

A WAF custom rule — a filter Cloudflare runs on each request before it reaches your server — takes an expression and an action. The free plan allows five of them.

Open **Security** → **Security rules**, create a custom rule, switch to **Edit expression**, and paste:

```txt
(lower(http.user_agent) contains "gptbot"
 or lower(http.user_agent) contains "claudebot"
 or lower(http.user_agent) contains "oai-searchbot"
 or lower(http.user_agent) contains "chatgpt-user"
 or lower(http.user_agent) contains "googlebot"
 or lower(http.user_agent) contains "bingbot")
and not cf.client.bot
```

Set the action to **Block**. `lower()` and `contains` stand in for regex, which the free plan does not have, and `not cf.client.bot` means "Cloudflare did not verify this request". The same test written through the category field is `cf.verified_bot_category eq ""`.

PerplexityBot is left out on purpose. Since nothing under that name is verified, the rule would block the real crawler along with the fakes. On my voice site that was 141 requests that looked genuine.

### 7. The numbers on voice.smolevich.com

Fresh pull, 18 September to 17 October 2026, host `voice.smolevich.com` only: 45,219 requests.

| Bot name in User-Agent | Verified | Unconfirmed |
|---|---|---|
| Googlebot | 673 | 7 |
| Bingbot | 568 | 0 |
| ChatGPT-User | 498 | 0 |
| OAI-SearchBot | 283 | 0 |
| ClaudeBot | 121 | 1 |
| GPTBot | 106 | 0 |
| PerplexityBot | 0 | 141 |
| Total | 2,249 | 149 |

Where the 149 went:

| Destination | Requests |
|---|---|
| Real pages from the sitemap | 83 |
| `/robots.txt` | 45 |
| Images and audio samples from those pages | 13 |
| Cloudflare's own email-protection script | 8 |
| `/.env`, `wp-*` and other probes | 0 |

148 of the 149 came from the US and one from Serbia. That one asked for the home page as Googlebot, and Serbia is where I work from, so I count it as probably mine.

The scanners on this site do not bother with a bot name. 39 requests went to `.env` paths and 3 to `wp-*`, and none of them named a bot. The `.env` ones all carried an ordinary browser string.

So on this site the rule above would block 8 requests in a month. Six of them were a Googlebot-named fetch of Cloudflare's script, which may well be Google's own renderer. On the whole zone the same rule targets thousands.

## What did not work

- **The Cloudflare API token I already had**. It is scoped to analytics, and it answered `Authentication error`: it was issued with a start date in 2027. I ran the same GraphQL from a logged-in dashboard tab instead, through its own `/api/v4/graphql`.
- **A top-ASN table for the fakes**. On my free zone GraphQL refused `clientAsn`, so I give countries. ASN is only in the dashboard, row by row.
- **Checking the rule through the API before publishing**. The old `filters/validate-expr` endpoint answered 404. I took the syntax from the documentation examples and have not deployed the rule, so on a free zone it is still untested.
- **Treating the zone numbers as true for each site**. My zone story — fakes everywhere, hunting `.env` — did not hold on voice.smolevich.com. There nearly every unconfirmed request was PerplexityBot reading real pages.
- **Counting `.png` and `.mp3` as probes**. My first path filter flagged anything with a file extension. Thirteen of the "probes" were images and audio from my own pages.

## Verify

- Run the GraphQL query above for yesterday on your own host and count the unconfirmed rows. Then look at their paths.
- Send yourself a fake: `curl -A "GPTBot/1.1" https://your-site/`. It should show up in the next pull with an empty `verifiedBotCategory`.
- After you deploy the rule, repeat that `curl`. It should return 403 from Cloudflare, and the block appears under **Security** → **Analytics** → **Events**.
- Check that confirmed bots still get through. Their categories keep showing up in the **Traffic** tab filter.
- Read the PerplexityBot rows separately, before you decide to block it. Mine looked like the real crawler.

Access settings and who owns which agent: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). The same question asked of an nginx log: [who actually crawls you](/geo/who-actually-crawls-you/).

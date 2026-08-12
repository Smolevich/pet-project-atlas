---
title: Who actually crawls you
description: Twenty-four days of nginx access logs from one small box — which agents came, what they asked for, and how rarely anybody fetched llms.txt.
updated: 2026-08-12
sources:
  - nginx access log, dataset /var/log/nginx/access.log, measured 2026-08-12
  - nginx access log, dataset /var/log/nginx/access.log.*.gz, measured 2026-08-12
---

## What we are solving

Every guide tells you to publish `llms.txt`. None of them shows a log line where an agent asked for it.

So I read my own. One box, several small sites, nginx access logs from 19 July to 12 August 2026 — about 24 days.

This is one operator's traffic, not a sample of the web. It is a measurement, which is more than the advice around it has.

## Steps

Read the whole period before reading any single agent.

| Agent | Requests |
|---|---|
| ChatGPT-User | 335 |
| Bingbot | 334 |
| YandexBot | 234 |
| GPTBot | 98 |
| OAI-SearchBot | 82 |
| Googlebot | 75 |
| PerplexityBot | 46 |
| Claude-User | 42 |
| Amazonbot | 42 |
| meta-externalagent | 41 |
| Applebot | 12 |
| ClaudeBot | 8 |

What the AI agents asked for, taking ChatGPT-User, OAI-SearchBot, GPTBot, PerplexityBot, Perplexity-User, Claude-User, ClaudeBot and meta-externalagent together:

| Path | Requests |
|---|---|
| `/` | 409 |
| A blog post comparing speech-to-text models | 108 |
| `/robots.txt` | 90 |
| `/ru` | 36 |
| `/sitemap.xml` | 26 |
| A blog post on transcribing a Telegram voice message | 19 |
| `/llms.txt` | 8 |
| The comparison post in Russian | 7 |
| The transcription post in Russian | 4 |

`llms.txt` took 38 requests in the period, from all clients together. 22 of them came from `curl` — that is me, checking my own file.

The rest is about one fetch per agent in 24 days: GPTBot, OAI-SearchBot, PerplexityBot, Perplexity-User, YandexBot, Google-Extended and meta-externalagent. Semrush's SiteAuditBot took it twice, and a couple of browsers opened it. Every response was 200, so nothing here is a block.

1. **Log per site, not per box** — one `access_log` line inside each `server` block.

   ```nginx
   server {
       server_name example.com;
       access_log /var/log/nginx/example.access.log;
   }
   ```

   A single global log without `$host` in its `log_format` cannot say which site a request hit.
2. **Open the rotated archives, not only today's file** — `zcat -f` reads plain and gzipped alike.

   ```bash
   zcat -f /var/log/nginx/example.access.log* | wc -l
   ```

   Read the `logrotate` config for how far back the box keeps them. That is your real window.
3. **Count the agents over the whole window** — one grep, then sort.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | grep -oE 'ChatGPT-User|OAI-SearchBot|GPTBot|PerplexityBot|Perplexity-User|Claude-User|ClaudeBot|meta-externalagent|Googlebot|Bingbot|YandexBot|Applebot|Amazonbot' \
     | sort | uniq -c | sort -rn
   ```
4. **Count the paths, AI agents only** — field seven is the request path in the combined format.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | grep -E 'ChatGPT-User|OAI-SearchBot|GPTBot|Perplexity|Claude-User|ClaudeBot|meta-externalagent' \
     | awk '{print $7}' | sort | uniq -c | sort -rn | head -20
   ```
5. **Subtract your own checks** — every `curl` you ever ran at the file sits in the same log.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | awk '$7 == "/llms.txt"' | grep -vc curl
   ```

   Mine went from 38 requests to 16 the moment `curl` came out.
6. **Compare `llms.txt` against `robots.txt`** — 8 fetches against 90, eleven times fewer.
   Each agent took the file about once a month. It is a listing they glance at, not a route they travel.
   That is a smaller claim than "the file is useless", and it is the one the log supports.
7. **Expect the homepage to carry the visit** — 409 requests to `/`, more than every other path combined.
   The root is where an agent lands and decides what to take. Whatever you want quoted has to be reachable from there.
8. **Find the one page that outran the rest** — the speech-to-text comparison, 108 requests, plus 7 in Russian.
   That is more than the rest of the blog together. A comparison table hands an agent a row it can quote.
9. **Spend the afternoon on `robots.txt` and `sitemap.xml`** — 90 and 26 requests, the real entry points.
   Nobody writes a post about a correct sitemap. Agents ask for it before they ask for any of your prose.
10. **Verify identity by network before trusting any of this** — I did not, and that is a hole here.
    The `User-Agent` string is a claim, and anyone can send it. Doing it properly means reverse DNS on each client IP, or matching it against the ranges the vendor publishes.

## What did not work

- **Reading the live log and stopping there**. My first pass used a file that started that same morning, and it showed 0 requests to `llms.txt`. That reading supported a much stronger conclusion, and a wrong one. The rotated archives held 38 requests, and the answer changed with them.
- **Attributing the totals to a single site**. The 24 days come from the box's global nginx log, which does not record `$host`. Per-site logs went in later. The paths are distinctive enough to be confident which site they belong to — that is inference, not measurement.
- **Taking a name in the log as an identity**. Every agent in the tables above is an unverified `User-Agent` string. The atlas's own page says to check published IP ranges or reverse DNS. I did not run that check.
- **Counting nginx as the total**. A request that Cloudflare served from cache never reaches the box. These figures are a floor, not a total.
- **Pulling the Cloudflare-side numbers for comparison**. The API call failed on token permissions, so the comparison is not in this page. Whatever the edge absorbed is missing from every table above.

## Verify

- Re-run the count next month and compare the shape, not the totals. One window is a snapshot.
- Check `logrotate` retention before you believe your window. Mine reached further back than the file I first opened.
- Request `/llms.txt` yourself, then find that line in the log. If it is missing, you are reading the wrong file.
- Count status codes per agent. A wall of 403 is a block, not an absence of interest.
- Resolve the IPs of your top agents by reverse DNS, and match them against the vendor's published ranges.
- Compare the log against your CDN's own analytics. Everything the edge cached is invisible to nginx.

Who owns which agent, and where a block actually lives: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). Why the comparison post won: [why AI answers cite someone else](/geo/citable-pages/).

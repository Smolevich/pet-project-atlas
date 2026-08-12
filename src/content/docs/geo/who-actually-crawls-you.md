---
title: Who actually crawls you
description: Sixteen days of nginx access logs from one small box — which agents came, what they asked for, and how rarely anybody fetched llms.txt.
updated: 2026-08-12
sources:
  - nginx access log, dataset /var/log/nginx/*.access.log, measured 2026-08-12
  - nginx access log, dataset /var/log/nginx/*.access.log.*.gz, measured 2026-08-12
  - https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
---

## What we are solving

Every guide tells you to publish `llms.txt`. None of them shows a log line where an agent asked for it.

So I read my own. One box, several small sites, per-site nginx access logs dated 19 July to 12 August 2026.

The window has a hole in it. Nothing between 20 and 28 July survived rotation, so what follows is 16 days of records.

This is one operator's traffic, not a sample of the web. It is a measurement, which is more than the advice around it has.

## Steps

Read the whole period before reading any single agent.

| Agent | Requests |
|---|---|
| ChatGPT-User | 341 |
| YandexBot | 244 |
| bingbot | 155 |
| OAI-SearchBot | 82 |
| Googlebot | 79 |
| GPTBot | 55 |
| meta-externalagent | 41 |
| Claude-User | 34 |
| PerplexityBot | 25 |
| Amazonbot | 22 |
| Applebot | 7 |
| ClaudeBot | 6 |
| Perplexity-User | 3 |

Some of the small rows are not what they say. One client sent 56 different crawler names from a single IP in this window.

It accounts for all 6 ClaudeBot requests and all 3 from Perplexity-User. It is also 14 of the 55 from GPTBot and 12 of the 34 from Claude-User.

What the AI agents asked for, taking ChatGPT-User, OAI-SearchBot, GPTBot, PerplexityBot, Perplexity-User, Claude-User, ClaudeBot and meta-externalagent together:

| Path | Requests |
|---|---|
| `/` | 293 |
| A blog post comparing speech-to-text models | 65 |
| `/robots.txt` | 56 |
| `/ru` | 35 |
| A blog post on transcribing a Telegram voice message | 19 |
| `/sitemap.xml` | 15 |
| `/llms.txt` | 8 |
| The comparison post in Russian | 7 |
| The transcription post in Russian | 3 |

`llms.txt` took 45 requests in the period, from all clients together. 26 of them came from `curl` — that is me, checking my own file.

The rest is about one fetch per client. GPTBot, OAI-SearchBot, PerplexityBot, Perplexity-User, Claude-User, ClaudeBot, ChatGPT-User, YandexBot, Googlebot, bingbot, CCBot, Amazonbot and meta-externalagent took it once each. Semrush's SiteAuditBot took it twice, and every response was 200.

`Google-Extended` is not in that list, and it cannot be. It has no user agent of its own. It is a control token you write in `robots.txt`, and Google's ordinary agents do the crawling.

An earlier version of this page listed it anyway, because a log line said so. One client sent that string, along with `Bytespider`, `Applebot-Extended` and `cohere-ai`, within two seconds from one IP.

So the string was real and the crawler was not. You will never grep `Google-Extended` out of your own log unless somebody types it at you.

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
3. **Count the agents over the whole window** — one match per request, case-insensitive.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | awk 'match(tolower($0), /chatgpt-user|oai-searchbot|gptbot|perplexitybot|perplexity-user|claude-user|claudebot|meta-externalagent|googlebot|bingbot|yandexbot|applebot|amazonbot/) {
         print substr(tolower($0), RSTART, RLENGTH)
       }' \
     | sort | uniq -c | sort -rn
   ```

   The obvious `grep -oE` version is wrong twice, and this page shipped it. Bing calls itself lowercase `bingbot`, so a case-sensitive pattern returns nothing for it at all.
   Fix the case and the second bug appears: `grep -o` prints occurrences, not lines. A bingbot request names itself twice, in the token and in the `+http://…/bingbot.htm` URL.
   In this window that is 336 occurrences against 155 requests. `awk` takes the first match per line, which is one line, which is one request.
4. **Count the paths, AI agents only** — field seven is the request path in the combined format.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | grep -iE 'ChatGPT-User|OAI-SearchBot|GPTBot|Perplexity|Claude-User|ClaudeBot|meta-externalagent' \
     | awk '{print $7}' | sort | uniq -c | sort -rn | head -20
   ```

   Here `grep` without `-o` matches whole lines, so this one counts requests already.
5. **Subtract your own checks** — every `curl` you ever ran at the file sits in the same log.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | awk '$7 == "/llms.txt"' | grep -vic curl
   ```

   Mine went from 45 requests to 19 the moment `curl` came out.
6. **Compare `llms.txt` against `robots.txt`** — 8 fetches against 56, seven times fewer.
   Each agent took the file about once in the window. It is a listing they glance at, not a route they travel.
   That is a smaller claim than "the file is useless", and it is the one the log supports.
7. **Expect the homepage to carry the visit** — 293 requests to `/`, more than every other path combined.
   The root is where an agent lands and decides what to take. Whatever you want quoted has to be reachable from there.
8. **Find the one page that outran the rest** — the speech-to-text comparison, 65 requests, plus 7 in Russian.
   That is more than the rest of the blog together. A comparison table hands an agent a row it can quote.
9. **Spend the afternoon on `robots.txt` and `sitemap.xml`** — 56 and 15 requests, the real entry points.
   Nobody writes a post about a correct sitemap. Agents ask for it before they ask for any of your prose.
10. **Verify identity by network before trusting any of this** — I did not, and this window shows the cost.
    One IP sent 56 different crawler names, `Google-Extended` among them, and that one has no user agent to send.
    Doing it properly means reverse DNS on each client IP, or matching it against the ranges the vendor publishes.

## What did not work

- **Reading the live log and stopping there**. My first pass used a file that started that same morning, and it showed 0 requests to `llms.txt`. That reading supported a much stronger conclusion, and a wrong one. The rotated archives held 45 requests, and the answer changed with them.
- **Publishing a command that did not produce the table**. The `grep -oE` version printed here was case-sensitive, so it never matched `bingbot`. Made case-insensitive it counted occurrences instead of requests, which doubled that row. A reader running the published command got neither the table nor an error.
- **Counting calendar days instead of days on disk**. This page first said 24 days between the same two dates. `logrotate` keeps 14 dailies here, and nine of those days had already gone when I counted them.
- **Attributing the totals to a single site**. These counts come from every per-site log on the box, not from one site. The paths are distinctive enough to be confident which site they belong to — that is inference, not measurement.
- **Taking a name in the log as an identity**. Every agent in the tables above is an unverified `User-Agent` string. One client here sent 56 of them from one IP, including a token that has no user agent at all. Some of these rows are somebody's scanner, and I cannot tell you which.
- **Counting nginx as the total**. A request that Cloudflare served from cache never reaches the box. These figures are a floor, not a total.
- **Pulling the Cloudflare-side numbers for comparison**. The API call failed on token permissions, so the comparison is not in this page. Whatever the edge absorbed is missing from every table above.

## Verify

- Re-run the count next month and compare the shape, not the totals. One window is a snapshot.
- Check `logrotate` retention before you believe your window. Mine reached further back than the file I first opened.
- Request `/llms.txt` yourself, then find that line in the log. If it is missing, you are reading the wrong file.
- Count status codes per agent. A wall of 403 is a block, not an absence of interest.
- Count lines, not occurrences. Pipe the same data through `wc -l` and through `grep -o`, and compare the two totals.
- Resolve the IPs of your top agents by reverse DNS, and match them against the vendor's published ranges.
- Compare the log against your CDN's own analytics. Everything the edge cached is invisible to nginx.

Who owns which agent, and where a block actually lives: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). Why the comparison post won: [why AI answers cite someone else](/geo/citable-pages/).

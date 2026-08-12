---
title: Who actually crawls you
description: Sixteen days of nginx access logs from one small box — which agents came, how much of that traffic turned out to be mine, and why nobody fetched llms.txt.
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

The first thing the measurement found was me. My own address made 4,221 requests to this box in the window, 81 of them under a crawler's name.

## Steps

Read the whole period before reading any single agent. My own address is the second column.

| Agent | Logged | Mine | Rest |
|---|---|---|---|
| ChatGPT-User | 341 | 4 | 337 |
| YandexBot | 244 | 3 | 241 |
| bingbot | 155 | 3 | 152 |
| OAI-SearchBot | 82 | 4 | 78 |
| Googlebot | 79 | 4 | 75 |
| GPTBot | 55 | 14 | 41 |
| meta-externalagent | 41 | 3 | 38 |
| Claude-User | 34 | 12 | 22 |
| PerplexityBot | 25 | 7 | 18 |
| Amazonbot | 22 | 2 | 20 |
| Applebot | 7 | 3 | 4 |
| ClaudeBot | 6 | 6 | 0 |
| Perplexity-User | 3 | 3 | 0 |

Two rows are entirely mine. ClaudeBot and Perplexity-User go to 0 once my own address comes out.

An earlier version of this page blamed those rows on an unknown scanner. It said one client had sent 56 different crawler names from a single address.

The count was close and the client was me. That address sent 56 distinct `User-Agent` strings in the window, 18 of them crawler names. They came from `curl` runs testing my own access rules.

`Google-Extended` was in that set, and it has no user agent of its own. It is a control token you write in `robots.txt`, and Google's ordinary agents do the crawling.

So the string was real and the crawler was not. You will never grep `Google-Extended` out of your own log unless you type it at yourself.

### The largest row is the one I cannot attribute

`ChatGPT-User` is top of the table, and it is the row the log explains worst. That agent fires when a person pastes a URL into a chat.

Four of the 341 came from my own address, from `curl` with the string set by hand. The other 337 came from 272 addresses inside OpenAI's ranges.

That is where the fetch originates whether I pasted the link or a stranger did. OpenAI's servers make the request either way, so the address cannot tell us apart.

What the log can say is thin. Those 337 requests are spread over every hour of the day and all 15 dated days. 38 of them fall within five minutes of a request from my own address.

Eleven per cent is weak evidence against "it was all me", and no evidence at all of who it was. Separating the two needs a window in which I do not touch the site, and I have not run one.

Read the whole `ChatGPT-User` row that way. It is a count of fetches by an agent a human has to trigger, and the human is unnamed.

### What they asked for

The AI agents, taking ChatGPT-User, OAI-SearchBot, GPTBot, PerplexityBot, Perplexity-User, Claude-User, ClaudeBot and meta-externalagent together, with my own address removed:

| Path | Requests |
|---|---|
| `/` | 280 |
| A blog post comparing speech-to-text models | 64 |
| `/robots.txt` | 56 |
| A blog post on transcribing a Telegram voice message | 18 |
| `/ru` | 17 |
| `/sitemap.xml` | 14 |
| The comparison post in Russian | 6 |
| The transcription post in Russian | 2 |
| `/llms.txt` | 0 |

### Forty-five fetches of llms.txt, forty-four of them mine

`llms.txt` took 45 requests in the period from all clients together. 44 came from my own address.

The one that did not was Semrush's `SiteAuditBot`, on 11 August, and it got a 200. No AI agent asked for the file at all.

An earlier version of this page reported one fetch per agent and called the file a listing they glance at. That reading was a single loop of mine.

Seventeen of those lines land between 18:21:12 and 18:21:15 on 7 August, one per crawler name, all from my address. That is `curl` walking a list of user agents, not thirteen vendors arriving in four seconds.

So `llms.txt` is not a route agents travel. On this box in this window it was not a glance either. The conclusion held its direction and lost its number.

### The procedure

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
3. **Find your own address before you count anything** — one command, and it changes every table below.

   ```bash
   curl -s https://api.ipify.org
   ```

   Mine was in the log 4,221 times, under 56 different user agents. I read that as traffic for two weeks.
4. **Subtract your address, not only your `curl`** — a browser and a spoofed agent land in the same file.

   ```bash
   zcat -f /var/log/nginx/example.access.log* | awk '$1 != "203.0.113.9"'
   ```

   Filtering `curl` caught 26 of the 44 `llms.txt` lines that were mine. The other 18 were my own crawler names and my own browser.
5. **Count the agents over the whole window** — one match per request, case-insensitive.

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
6. **Count the paths, AI agents only, your address excluded** — field seven is the request path in the combined format.

   ```bash
   zcat -f /var/log/nginx/example.access.log* \
     | grep -iE 'ChatGPT-User|OAI-SearchBot|GPTBot|Perplexity|Claude-User|ClaudeBot|meta-externalagent' \
     | awk '$1 != "203.0.113.9" {print $7}' | sort | uniq -c | sort -rn | head -20
   ```

   Here `grep` without `-o` matches whole lines, so this one counts requests already.
7. **Compare `llms.txt` against `robots.txt` after that** — 0 fetches against 56.
   Every AI agent in the table took `robots.txt`. Not one of them took `llms.txt`.
   That is a narrower claim than "the file is useless". It is the claim this log supports, on one box, over 16 days.
8. **Do not read `/` as a preference** — 280 requests, more than every other path combined.
   A bare domain pasted into a chat and an agent choosing to start at the root produce the same line.
   The log records the path and never the reason. Making good pages reachable from the root is still sound advice. This table is not the evidence for it.
9. **Read a busy page as a fetch, not a citation** — the comparison post, 64 requests, plus 6 in Russian.
   That is more than the rest of the blog together, and it is the whole of what nginx knows. A 200 means bytes went out.
   Nothing in the file says a word of it reached an answer. Citation shows up in referrals from assistant hosts and in the answers themselves, neither of which is a log line.
10. **Read `robots.txt` and `sitemap.xml` as protocol** — 56 and 14 requests, the entry points.
    Nobody writes a post about a correct sitemap, and agents ask for it before they ask for any prose.
    A crawler takes `robots.txt` at the start of every session, so a high count there is the protocol working, not interest in you.
11. **Verify identity by network before trusting any of this** — I did not, and this window shows the cost twice.
    Once when I read my own spoofed strings as thirteen vendors. Once when I read `Google-Extended` off a line that cannot exist.
    Doing it properly means reverse DNS on each client address, or matching it against the ranges the vendor publishes.

## What did not work

- **Counting my own traffic as an agent's**. My address is in this log 4,221 times, 81 of those under a crawler name. I published the totals with all of it inside, then blamed the strange rows on an unknown scanner. The scanner was my own `curl` loop, and finding that took one call to `api.ipify.org`.
- **The `llms.txt` finding, first time round**. This page reported about one fetch per agent and built a conclusion on the shape of it. Seventeen of those lines are four seconds of a loop I ran on 7 August. The real count of AI-agent fetches in 16 days is 0.
- **Reading the live log and stopping there**. My first pass used a file that started that same morning, and it showed 0 requests to `llms.txt`. The number was right by accident and the reasoning was wrong. The archives held 45, and 44 of those were mine.
- **Publishing a command that did not produce the table**. The `grep -oE` version printed here was case-sensitive, so it never matched `bingbot`. Made case-insensitive it counted occurrences instead of requests, which doubled that row. A reader running the published command got neither the table nor an error.
- **Counting calendar days instead of days on disk**. This page first said 24 days between the same two dates. `logrotate` keeps 14 dailies here, and nine of those days had already gone when I counted them.
- **Attributing the totals to a single site**. These counts come from every per-site log on the box. 340 of the 341 `ChatGPT-User` requests belong to one of those sites. The split is inference from the paths, not a field in the log.
- **Taking a name in the log as an identity**. Every agent in the tables above is an unverified `User-Agent` string. Mine were plainly fake and I could still not tell you which of the rest are somebody else's scanner.
- **Counting nginx as the total**. A request that Cloudflare served from cache never reaches the box. These figures are a floor, not a total.
- **Pulling the Cloudflare-side numbers for comparison**. The API call failed on token permissions, so the comparison is not in this page. Whatever the edge absorbed is missing from every table above.

## Verify

- Print your own public address and grep the log for it before you read a single total. Mine was the largest client on the box.
- Re-run the count next month and compare the shape, not the totals. One window is a snapshot.
- Check `logrotate` retention before you believe your window. Mine reached further back than the file I first opened.
- Request `/llms.txt` yourself, then find that line in the log. If it is missing, you are reading the wrong file.
- Count status codes per agent. A wall of 403 is a block, not an absence of interest.
- Count lines, not occurrences. Pipe the same data through `wc -l` and through `grep -o`, and compare the two totals.
- Resolve the addresses of your top agents by reverse DNS, and match them against the vendor's published ranges.
- Take a window in which you do not touch the site at all. It is the only way to read a user-triggered agent honestly, and I have not taken one yet.
- Compare the log against your CDN's own analytics. Everything the edge cached is invisible to nginx.

Who owns which agent, and where a block actually lives: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). What a fetch is still not: [why AI answers cite someone else](/geo/citable-pages/).

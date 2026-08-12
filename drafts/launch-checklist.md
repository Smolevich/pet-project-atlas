# Launch checklist

Operational. Order, prerequisites, and what to read afterwards.
The atlas's own rule applies to its own launch: attribution is not reconstructable, so nothing goes out untagged.

---

## 0. The one thing that cannot be fixed later

There is **no analytics tool on atlas.smolevich.com**. No Plausible, no GA, no tag manager. The instruments available are:

1. `/var/log/nginx/atlas.access.log` on the server — request line (so the query string) and `Referer`, standard combined format.
2. Search Console, property `atlas.smolevich.com`.
3. GitHub Insights → Traffic, for the repo.

That is enough, and only if the links carry a tag. A bare link posted to five venues produces one indistinguishable pile in the log.

**Also: the log rotates.** `/geo/who-actually-crawls-you/` lost 8 days of a 24-day window to rotation. Before the first post, copy the launch window aside daily:

```bash
ssh <box> 'cp /var/log/nginx/atlas.access.log \
  /root/atlas-launch-logs/atlas.$(date +%F).log'
```

---

## 1. Source vocabulary — fix it before the first link goes out

One value per venue, lowercase, hyphen-separated, no synonyms, no improvising at post time. Parameter is `ref`.

| Venue | `ref` value | Link to post |
|---|---|---|
| Telegram channel | `tg-channel` | `https://atlas.smolevich.com/?ref=tg-channel` |
| LinkedIn post | `linkedin` | `https://atlas.smolevich.com/?ref=linkedin` |
| LinkedIn first comment (repo) | `linkedin-comment` | repo link, no tag possible — count it as `unknown` |
| Hacker News | `hn` | `https://github.com/Smolevich/pet-project-atlas` (untaggable) + site link in the comment as `?ref=hn` |
| Directory / awesome-list | `dir-<host>` e.g. `dir-alternativeto` | `https://atlas.smolevich.com/?ref=dir-alternativeto` |
| Community thread | `<venue>-<topic>-<date>` e.g. `lobsters-seo-2026-08-14` | same shape |

Rules, straight off `/analytics/attribution/`:

- One value per venue. Four spellings of the same directory never merge afterwards.
- Tag your own channels too. Untagged, they land in direct and inflate word of mouth.
- Anything arriving with no `ref` and no useful `Referer` goes in a bucket named `unknown`, not in `direct`.
- Keep this table in this file and add a row **before** submitting, never after.

Write the values down here as they get used:

```
# used values, append only
tg-channel
linkedin
hn
```

---

## 2. Before posting anything — pre-flight

Run in this order. Any failure stops the launch; none of these takes more than a few minutes.

- [ ] `npm test && npm run lint:voice && npm run build` green on `main`.
- [ ] Deployed head matches `main` — the live site serves what the repo says it does.
- [ ] `curl -sL https://atlas.smolevich.com/ | grep -c "I am not an SEO expert"` returns non-zero. The stance has to be visible to a crawler, not only to a browser.
- [ ] `curl -s https://atlas.smolevich.com/robots.txt` is `User-agent: * / Allow: /` with the sitemap line.
- [ ] `curl -s https://atlas.smolevich.com/sitemap-0.xml | grep -c '<loc>'` — record the number here on the day, and use that number in every post. Today it is 66.
- [ ] **Tag test, end to end.** Open `https://atlas.smolevich.com/?ref=tg-channel` from a phone on mobile data, then find that exact line in the access log. If the tag is not in the log, nothing below is measurable and the launch waits.
- [ ] Every RU page reachable from its EN counterpart via the language switcher, and vice versa. Half the audience for post 1 is Russian-speaking.
- [ ] Repo: description, topics, homepage URL set (all three are set as of 2026-08-12), README renders, LICENSE and LICENSE-CONTENT both present.
- [ ] The three issue templates open and submit: "did not help", "suggest a topic", "share a case".
- [ ] `/cases/atlas-itself/` reflects the launch date and carries today's zeros. It is the page that has to be true when a hostile reader checks it, and it is the first page anyone sceptical will open.
- [ ] Baseline snapshot taken (section 5). Without it, the 48-hour reading has nothing to subtract.

---

## 3. Venue order, and why

### First — Telegram channel. Day 0.

Own audience, warmest, lowest downside, and it is the live test of the whole instrument chain: if the tag does not land in the log from a real reader's phone, everything after this is unmeasurable. A dead post here costs nothing; a broken tag discovered on day 3 costs the launch. Also the audience most likely to send a correction, which is what the atlas actually wants first.

### Second — LinkedIn. Day 1, morning.

Deliberately not the same day. Two reasons: the two posts share numbers and reading them an hour apart looks like broadcast, and separating them by a day makes the `ref` values separable in a log with almost no traffic in it. Post in the morning on a weekday; keep the repo link in the first comment.

### Third — Hacker News. Day 2 or later, and only if the pre-conditions hold.

Later, not earlier, for three reasons:

1. It is the only venue that can bring real volume, and it should land on a site whose links are already proven to be tagged and logged.
2. It is the only venue with an account gate: check the HN account has comment history before submitting. An account with none posting a link on day 0 is the exact signature moderation filters on.
3. Read `drafts/show-hn.md` first — the Show HN guidelines put "reading material" off topic, and the decision between a Show HN and a plain submission has to be made deliberately, not at 1am.

Do not solicit upvotes, do not post the HN link in the channel with a nudge, do not ask anyone to comment. Our own `/distribution/communities/` says this. Being caught contradicting it costs more than the submission is worth.

### Fourth — directories and awesome-lists. Rolling, from day 3, in small batches.

Slow-moving and independent of the first three. Use `drafts/listing-card.md` verbatim. Per `/distribution/catalogs/`: fetch each host live before filling the form, check the venue's own listing pages are indexed, open one listing with JavaScript off, and log venue / date / submitted link / moderation promise / status.

### Fifth — one listicle author. Week 2.

One inclusion in a page that already ranks beats several entries in directories nobody reads. Needs a name, an email and a reason the author cares. Not a launch-day activity.

### Not on the list

- Product Hunt. On the previous project it produced 2 upvotes and 3 comments, and the atlas has less of a "try it" surface than a bot did.
- Anything requiring an account registered for the occasion. Community venues filter exactly that.
- Paid placement. `/distribution/catalogs/` says do not pay at zero revenue, and nothing about the atlas contradicts it.

---

## 4. What to expect, so the 48-hour reading is not misread

Search Console will almost certainly show nothing. Two days in, the home page was still unknown to Google. Submitted, discovered, crawled and indexed are four different states, and the site is barely past the first. **Do not read a flat Search Console at 48 hours as a launch failure — it is a lag, and it is the one thing the atlas already documented about itself.**

What can move in 48 hours: referrals in the access log, GitHub traffic, issues, and the crawler mix after a burst of external links.

---

## 5. Baseline snapshot — take it before post 1

Append to a file, one row per measurement, per `/analytics/what-to-measure/`. Same commands used for the 48-hour reading, so the two are comparable.

```bash
# repo
gh repo view Smolevich/pet-project-atlas --json stargazerCount,forkCount

# sitemap size
curl -s https://atlas.smolevich.com/sitemap-0.xml | grep -c '<loc>'

# total requests in the log so far
wc -l /var/log/nginx/atlas.access.log
```

Search Console: impressions, clicks, distinct queries, and URL Inspection on the home page. Record all four even when all four are zero — a zero with a date is a measurement.

---

## 6. The 48 hours after each post

Read at +6h, +24h and +48h from each post. Same three commands each time.

**Arrivals by tag** — the one number that says which venue worked:

```bash
awk '{print $7}' /var/log/nginx/atlas.access.log \
  | grep -oE 'ref=[a-z0-9-]+' | sort | uniq -c | sort -rn
```

**Referrers, for arrivals that lost the tag** (in-app browsers and link previews strip things; HN sends a referrer, Telegram often does not):

```bash
awk -F'"' '{print $4}' /var/log/nginx/atlas.access.log \
  | grep -v '^https\?://atlas\.smolevich\.com' | grep -v '^-$' \
  | sort | uniq -c | sort -rn | head -20
```

Anything that appears in neither list is `unknown`. Write it down as `unknown`. Folding it into direct turns a gap into a false conclusion.

**Crawler mix — one match per line, never `grep -o`:**

```bash
grep -ciE 'googlebot' /var/log/nginx/atlas.access.log
grep -ciE 'gptbot|oai-searchbot|chatgpt-user' /var/log/nginx/atlas.access.log
grep -ciE 'claudebot|claude-user|perplexitybot|bingbot|yandexbot' /var/log/nginx/atlas.access.log
```

`grep -c` counts lines. `grep -o` counts occurrences, and Googlebot names itself twice per line — that mistake is already published on `/cases/atlas-itself/` and does not need a second outing. Case-insensitive matters too: bingbot presents itself lowercase.

**Subtract yourself.** His own address made 4,221 requests to the box in a 16-day window, 81 of them under a crawler's name. Filter own IPs before quoting any figure anywhere:

```bash
grep -v "^<own-ip>" /var/log/nginx/atlas.access.log | wc -l
```

**Also watch:**

- Which pages the arrivals actually open. If everyone lands and leaves on `/`, the route is not being entered and the home page is the problem.
- GitHub: stars, forks, clones, and — worth more than all three — issues and PRs. A correction from a stranger is the first evidence anyone read a page carefully.
- Search Console: impressions and distinct queries. Expect zero. Record it anyway.
- The first brand query. `pet project atlas` appearing in Search Console at all is the first sign the entity exists outside his own head.

---

## 7. After 48 hours

- [ ] One row appended to the snapshot file per venue: value, arrivals, pages opened.
- [ ] Any venue that sent nothing stays recorded as nothing. A zero next to a venue is the finding.
- [ ] Anything learned about the launch itself goes into `/cases/atlas-itself/` at the next monthly measurement — including the case where nothing moved. The page already promises that.
- [ ] Anything that turned out wrong in a post goes into the drafts here, not into memory. The next launch reuses these files.

---

## Where the figures in this file come from

| Figure | Source |
|---|---|
| home page unknown to Google two days in | `/cases/atlas-itself/`, Search Console, measured 2026-08-12 |
| Googlebot doubled by `grep -o`; bingbot lowercase | `/cases/atlas-itself/`; review notes §1 |
| 4,221 own requests, 81 under a crawler's name | `/geo/who-actually-crawls-you/`, 19 July – 12 August 2026 |
| 8 days of log lost to rotation | `/geo/who-actually-crawls-you/` |
| 66 URLs in the sitemap | live count, 2026-08-12 |
| Product Hunt: 2 upvotes, 3 comments | previous project's launch record, `linkedin-post-optimizer/drafts/2026-08-05-voice-ai-first-money.md` |
| repo description, topics, homepage set; 0 stars | GitHub repo metadata, read 2026-08-12 |
| log path `/var/log/nginx/atlas.access.log` | `nginx-atlas.conf` |

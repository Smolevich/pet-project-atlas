# Style

Rules for every page under `src/content/docs/**`. `scripts/lint-voice.mjs` checks the mechanical ones in CI. The rest is on the author and the reviewer.

## 1. Who writes here

A practitioner, not a theorist. A page is about what the author actually did: what he ran, what broke, what came out of it.

Write from your own log. If you have not done the thing, do not write the page. Open an issue instead.

Second-hand advice is not a page. "Google recommends a sitemap" is a link to Google, not an atlas entry.

Before: "It is important to keep your sitemap fresh."

After: "I rebuild `sitemap.xml` on every deploy. Before that, stale URLs sat in the index for two weeks."

## 2. Page shape

Every page carries four H2 headings, in this order, before any other H2.

English pages:

```markdown
## What we are solving
## Steps
## What did not work
## Verify
```

Russian pages (`src/content/docs/ru/**`):

```markdown
## Что решаем
## Шаги
## Что не сработало
## Проверить
```

The linter matches the heading text literally, at level two. No extra words, no rephrasing, no emoji in the heading. It checks the order too, and that nothing else at level two comes first. Extra H2 headings are fine after these four.

A heading inside a fenced code block is an example of markup, not a section. The linter does not count it.

Section landing pages are exempt from this block, and only from this block. The exemption is narrow: an `index.md` or `index.mdx` that declares **none** of the four headings is navigation, and the shape check skips it. The moment it declares one, it is a procedure page and needs all four, in order — `start/index.md` is that kind of page.

The ban list and the length rule apply to landing pages like to everything else. A page being navigation is not a reason to write "game-changer" in it.

What goes under each:

- **What we are solving** — the symptom, in one or two sentences. "The project has been live for a month and Google knows 3 of its 40 pages."
- **Steps** — numbered. One step is one command, one click, or one file.
- **What did not work** — the dead ends you walked before the steps above.
- **Verify** — how the reader knows it worked. A query, a URL, a number to read off a dashboard.

Before:

```markdown
## Introduction
## Why sitemaps matter
## Setting it up
## Conclusion
```

After:

```markdown
## What we are solving
## Steps
## What did not work
## Verify
```

## 3. Ban list

These strings fail the build. The match is case-insensitive.

Four of them are fixed phrases, matched as whole words:

```text
in the age of AI
cannot be ignored
в эпоху AI
нельзя игнорировать
```

The rest are stems. The word has to *start* with them; the ending is free.

```text
game-chang
leverag
unlock
dive in
dives in
diving in
synerg
seamless
синерг
экосистем
революционн
```

So `leverag` covers leverage, leveraging and leveraged; `unlock` covers unlocks, unlocked and unlockable; `экосистем` covers экосистемы and экосистеме; `революционн` covers революционный, революционное and революционная. Only the left edge is checked, which is what keeps `эволюционный` and `deleveraging` clean.

The error message quotes the word you actually wrote, not the stem.

Code is not prose: a fenced block, an inline `` `…` ``, a link target and a bare URL are all skipped. `curl https://api.example.com/unlock` is a command, not a claim.

A banned word is a symptom. It almost always sits in a sentence that carries no claim. So the fix is a concrete claim, not a synonym from the thesaurus.

Before: "Sitemaps unlock better indexing."

After: "A sitemap tells the crawler which URLs exist. It does not make them rank."

Before: «В эпоху AI нельзя игнорировать `llms.txt`.»

After: «`llms.txt` запрашивают не все AI-краулеры. Я посмотрел логи nginx за месяц и записал, кто реально приходил.»

## 4. Numbers

Every number ships with a date and a source. The date goes into `updated:`. The source goes into `sources:` — a URL, or a provenance line for a measurement of your own (below).

```yaml
---
title: Sitemap for a static site
updated: 2026-08-10
sources:
  - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - https://example.com/notes/sitemap-rebuild-log/
---
```

A page with numbers and an empty `sources:` fails the build. So does a page with numbers and no `updated:`. Both checks also apply to guest pages.

### A source that has no URL

Most of the numbers here come off the author's own dashboards, and a figure from your own Search Console has no public link. There has to be a way to state one honestly, or the only way past the check is an invented URL — which is exactly what the check exists to stop.

So a `sources:` entry is one of two things. Either an `http(s)` URL, or a provenance line in exactly this shape:

```yaml
sources:
  - Search Console, property atlas.smolevich.com, measured 2026-08-10
  - Plausible, site atlas.smolevich.com, measured 2026-08-10
  - psql, dataset signup_events, measured 2026-01-31
```

Three parts, separated by commas, all three required:

1. **The instrument** — the named tool or panel you read the number off. "Search Console", "Plausible", "Stripe", "psql". Not "my own data": that is not an instrument, it is a refusal to answer.
2. **The scope** — one of `property`, `account`, `project`, `site`, `repo`, `workspace`, `dataset`, `instance`, `channel`, `bot`, `table`, followed by a single identifier: a domain, a repository, a bot handle, a table name. One token, so the scope cannot be described in words of general meaning.
3. **The date** — `measured` and an ISO date. The day you read the figure, which is often not the day you wrote the page.

The point of the shape is that another person, or you in six months, can open the same panel, filter to the same scope and get the same number back. A line that does not let anyone repeat the measurement is not a source, and the linter and the build both reject it.

A number without a source gets deleted, not softened. "Roughly a couple of thousand visits" is worse than silence: it looks like data and is not.

The check targets claims, not identifiers. These do not need a source:

- a tool with its version — "Node 24", "Astro 7.0.2", "v1.2", "HTTP/2";
- a digit glued to the end of a name — GA4, GPT-4, IPv6, H2, Apache-2.0;
- a standard number — "RFC 9309", "ISO 8601";
- a year or an ISO date — "since 2024", "measured 2026-08-10";
- an ordinal that opens a line, a bullet or a heading — "## 1. Indexing", "**1. Indexing**", "- 1. Check rendering";
- a number inside inline code, a link target, a URL, an email address or an `@handle`.

The rule behind the second one: a digit at the end of a word is part of a name, a digit in front of a word is a measurement. `GA4` is a product, `40%` is a number.

"Traffic grew to 1200 visits" needs a source. So do "9.99 a month", "$4.99 per user" and "3.5%" — a bare decimal is a price or a rate, not a version. Numbers in tables and in headings need a source like any other. Only the length rule exempts tables (§5), never this one.

Numbers are digits, not words. Zero is a result worth publishing: "0 clicks in the first month" tells the reader more than a hedge.

## 5. Length

A paragraph is at most 3 sentences. A sentence is at most 20 words.

The threshold is soft. The linter prints a warning and the build stays green.

A sentence is counted as one sentence whether it sits on one line or is wrapped across four. Hard wrapping is allowed and changes nothing.

Warnings piling up on one page mean the page needs cutting, not an exception. Code blocks and tables are not counted — this is the only rule that exempts tables.

## 6. Failures are mandatory

The "What did not work" block is never empty. A heading with nothing under it counts as missing, and the build fails.

Write what you tried and where it broke: the wrong tool, the wrong order, a quota you hit. The reader is walking your path, and your dead ends save them the day you lost.

If everything genuinely worked, write what you tested and why you are confident. "Checked on two projects, same result both times" is a valid block. "Nothing to report" is not.

## 7. What we do not do

The atlas is a reference page, not a Telegram post. These habits work in a post and break a reference.

- **Dropped final periods.** Every sentence ends with one, including the last one in a paragraph.
- **Kaomoji.** `¯\_(ツ)_/¯` stays in the channel.
- **Emoji walls.** An emoji in front of every bullet is decoration. Headings and bullets carry no emoji.
- **Four-comma sentences.** One thought, one sentence, a period. Split the flow instead of punctuating it.
- **Tech terms translated into Russian.** On Russian pages write `crawl budget`, `canonical`, `fallback`, `sitemap` in English. Do not invent local equivalents.
- **Throat-clearing intros.** "In this article we will look at" and "Сегодня хочу рассказать" get cut. Start with the problem.

Two moves from the house voice do carry over. "В общем" marks the turn to the conclusion. An em dash — like this one — carries a short aside.

## 8. Guest cases

Someone else's case comes in with `voice: guest` in frontmatter.

```yaml
---
title: How I got 200 users from one Reddit thread
voice: guest
updated: 2026-08-10
sources:
  - https://reddit.com/r/SideProject/comments/example/
---
```

Name the author in the first line of the page, with a link to their project or profile. Their voice stays as they wrote it. The linter skips the voice check for these pages: ban list, page shape and length do not apply.

Facts are checked exactly as everywhere else. Every number needs `updated:` and a source in `sources:`, or it comes out of the page.

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

The linter matches the heading text literally, at level two. No extra words, no rephrasing, no emoji in the heading. Extra H2 headings are fine after these four.

Section landing pages (`index.md`, `index.mdx`) are exempt. They are navigation, not procedure.

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

These strings fail the build. The match is case-insensitive and on whole words.

```text
game-changer
leverage
unlock
dive in
synergy
seamless
in the age of AI
cannot be ignored
в эпоху AI
нельзя игнорировать
синергия
экосистема
революционн
```

`революционн` is a stem. It covers революционный, революционное, революционная and the rest of the endings.

A banned word is a symptom. It almost always sits in a sentence that carries no claim. So the fix is a concrete claim, not a synonym from the thesaurus.

Before: "Sitemaps unlock better indexing."

After: "A sitemap tells the crawler which URLs exist. It does not make them rank."

Before: «В эпоху AI нельзя игнорировать `llms.txt`.»

After: «`llms.txt` запрашивают не все AI-краулеры. Я посмотрел логи nginx за месяц и записал, кто реально приходил.»

## 4. Numbers

Every number ships with a date and a source. The date goes into `updated:`. The source goes into `sources:`, a list of URLs.

```yaml
---
title: Sitemap for a static site
updated: 2026-08-10
sources:
  - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - https://example.com/notes/sitemap-rebuild-log/
---
```

A page with numbers and an empty `sources:` fails the build. This check also applies to guest pages.

A number without a source gets deleted, not softened. "Roughly a couple of thousand visits" is worse than silence: it looks like data and is not.

The check targets claims, not identifiers. A version or tool name ("Node 24", "Astro 7", "HTTP/2"), an ordinal in a heading ("## 1. Indexing"), and a number inside inline code or a link do not need a source. "Traffic grew to 1200 visits" does.

Numbers are digits, not words. Zero is a result worth publishing: "0 clicks in the first month" tells the reader more than a hedge.

## 5. Length

A paragraph is at most 3 sentences. A sentence is at most 20 words.

The threshold is soft. The linter prints a warning and the build stays green.

Warnings piling up on one page mean the page needs cutting, not an exception. Code blocks and tables are not counted.

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

# Contributing

Thanks for opening the repo. Here is what gets merged, how fast, and why.

## Editorial policy, up front

The atlas is a reference, and a reference reads best in one voice. So contributions split into two lanes:

**Merged fast, as you wrote it:**

- data and corrections — a wrong number, a dead link, a step that no longer works
- catalog entries and tool rows
- translations into Russian
- code, scripts, CI, styles
- guest cases (see below — those keep your voice on purpose)

**Merged after the maintainer rewrites it:** prose. New pages, new sections, rewritten explanations. Your facts, structure and dead ends stay; the sentences get edited to the house voice in [STYLE.md](STYLE.md).

This is not a judgement on your writing. It is the cost of a reference that reads as one document instead of forty. Expect the edit, and expect it to be visible — if you would rather your text stayed untouched, submit it as a guest case.

Some prose pull requests get closed rather than edited: the author has not done the thing they are describing. Second-hand advice is a link, not a page. That rule is in STYLE.md and it is the one rejection that comes with no negotiation.

## The page template

Every page under `src/content/docs/**` carries four H2 headings, in this order, before any other H2:

```markdown
## What we are solving
## Steps
## What did not work
## Verify
```

Russian pages use `## Что решаем`, `## Шаги`, `## Что не сработало`, `## Проверить`.

The linter matches the text literally and checks the order, and nothing else at level two may come first. Extra H2 headings after these four are fine. A heading inside a fenced code block does not count as a section.

Section landing pages are exempt from the four blocks, and only from those: an `index.md` or `index.mdx` that declares none of the four is navigation. Declare one and you have to declare all four, in order. The ban list and the length rule apply to landing pages like to any other page.

"What did not work" is never empty. A heading with nothing under it fails the build. Everything else about voice — the ban list, sentence length, what we do not do — is in [STYLE.md](STYLE.md). Read it once before your first page.

## Numbers need a source

Every number ships with a source. Put the URLs in `sources:` in frontmatter, and put the date you measured in `updated:`.

```yaml
---
title: Sitemap for a static site
updated: 2026-08-10
sources:
  - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
---
```

A number off your own dashboard has no public URL, and inventing one is worse than having none. For those, `sources:` also takes a provenance line in exactly this shape:

```yaml
sources:
  - Search Console, property atlas.smolevich.com, measured 2026-08-10
```

Instrument, scope with a single identifier, `measured` and an ISO date. The scope keyword is one of `property`, `account`, `project`, `site`, `repo`, `workspace`, `dataset`, `instance`, `channel`, `bot`, `table`. "My own data" is not a source and does not pass: the line has to let somebody open the same panel and get the same number. Full rules in [STYLE.md](STYLE.md) §4.

A page with numbers and an empty `sources:` fails the build, and so does a page with numbers and no `updated:`. Both apply to guest pages too. A number you cannot source gets deleted, not softened — "a couple of thousand visits" looks like data and is not.

## English first, Russian follows

The English page is canonical. Write it first, put it at `src/content/docs/<section>/<page>.md`.

The Russian version goes to `src/content/docs/ru/<section>/<page>.md` with the same file name. Where it is missing, Starlight serves the English page instead, so **a missing translation never blocks a merge**. Translation-only pull requests are welcome and go in the fast lane.

## Guest cases

Your own project, your own numbers, your own voice. Set `voice: guest` in frontmatter:

```yaml
---
title: How I got 200 users from one Reddit thread
voice: guest
updated: 2026-08-10
sources:
  - https://reddit.com/r/SideProject/comments/example/
---
```

Name yourself in the first line, with a link to the project or your profile. The linter skips the voice check for these pages: ban list, page shape and length do not apply, and the maintainer does not rewrite your sentences.

Facts are checked exactly as everywhere else. Every number needs `updated:` and a source, or it comes out of the page.

Guest pages ship under CC BY 4.0 like the rest of the content. Your byline stays with the text wherever it is reused.

## Check your work before opening a pull request

```bash
npm test
npm run lint:voice
npm run build
```

CI runs the same three on every pull request. `lint:voice` prints errors and warnings separately — errors fail the build, warnings about long sentences do not. Piling warnings on one page means the page needs cutting.

## Not writing today?

Open an issue. There are four templates: a page that did not help, a topic that is missing, a case you want to share, and something that has gone out of date. All four take under a minute.

# Listing card — one card, every venue

Directories, awesome-lists, catalogs, bot lists, newsletters. Fill their form from this file; do not rewrite per venue.
Written once because `/distribution/catalogs/` says so: scattered descriptions never merge back into one entity.

**Rule for using it:** copy the fields verbatim. If a venue's field is shorter than what is here, cut from the end — do not paraphrase. If a venue asks for something not on this card, add it here first, then submit.

---

## Name

```
Pet Project Atlas
```

## One-sentence description

```
An open-source atlas of how a side project gets found — demand, indexing, AI search, content, distribution, analytics and money — written from one operator's own logs, zeros included.
```

Short form, for venues capping around 100 characters:

```
Open-source atlas of getting a side project found, written from real logs — including the zeros.
```

Very short form, around 60 characters:

```
Getting a side project found, written from real logs.
```

## Three bullets

```
- Seven sections in the order the problems actually arrive: demand, indexing, AI search, content, distribution, analytics, money.
- Every page carries a runnable step, numbers with a date and a source, and a "What did not work" block that is never empty.
- Ships a Claude Code plugin: four commands that walk a live URL through the route, build a content plan, cut a weekly Search Console slice and lint a draft.
```

## Link

```
https://atlas.smolevich.com
```

Repository, where the venue asks for one:

```
https://github.com/Smolevich/pet-project-atlas
```

**Tag every submitted link.** One value per venue, from the vocabulary in `launch-checklist.md`. Submit `https://atlas.smolevich.com/?ref=<venue>`, never the bare URL. A listing that goes live untagged is a listing you cannot judge later, and going back to edit the form is worse than doing it once.

## Longer paragraph, for venues that allow one

```
Pet Project Atlas is a public, open-source route out of zero traffic for a side project: check
there is demand at all, get indexed, get cited by AI search, write pages worth finding, pick
channels, read the numbers, take money. It is not written by an SEO expert and says so on its
front page — it is a log of what one developer ran on his own projects and what the dashboards,
panels and access logs said back. The unflattering figures stay in: one click in three months
on his main project, an llms.txt that no AI agent ever fetched, a paid panel and Search Console
disagreeing by a factor of eighteen on the same phrase until a re-pull killed the site's own
headline conclusion. The atlas measures itself on the same terms, on a page that currently
reports zero impressions and a home page Google has never crawled. Sixty-six pages, English and
Russian, MIT on the code and CC BY 4.0 on the text, plus a thin Claude Code plugin. Corrections,
translations and guest cases go through GitHub issues and pull requests.
```

Word count: ~150. Trim from the fourth sentence backwards if a venue caps lower.

## Category, when a venue asks

Primary: `Developer tools` → `SEO` / `Marketing`.
Secondary, where available: `Open source`, `Documentation`, `Indie hackers`.
Repository topics already set: `seo`, `technical-seo`, `geo`, `generative-engine-optimization`, `ai-search`, `llms-txt`, `indie-hackers`, `claude-code`, `astro`, `starlight`.

## Author / contact

```
Stanislav Shupilkin
https://smolevich.com
https://github.com/Smolevich
smolevich90@gmail.com
```

## Licence

```
Code: MIT. Content under src/content/docs/**: CC BY 4.0.
```

## Screenshots

Not prepared yet. Two are worth taking before the first submission that asks for them:

1. The home page with the seven-step route diagram visible.
2. `/cases/atlas-itself/` with the table of zeros in frame — it is the single image that explains the position of the whole site.

Store them next to this file and record the paths here once they exist, so every venue gets the same two images.

---

## What this card must never say

- Any promise of rankings, traffic or results. The atlas has none of its own.
- "Trusted by", "used by", user counts, star counts, testimonials. All zero or near it.
- "Expert", "definitive", "complete guide". The site's own first heading is "I am not an SEO expert".
- Invented numbers of any kind. Every figure above is on the live site or in the repo.

## Where each figure comes from

| Figure | Source |
|---|---|
| 66 pages | `https://atlas.smolevich.com/sitemap-0.xml`, live count 2026-08-12 |
| one click in three months | `/tools/paid-tools/` — 74 queries, 278 impressions, 1 click, 2026-05-12 to 2026-08-12 |
| llms.txt never fetched by an AI agent | `/cases/atlas-itself/` — 44 of 45 requests were his own curl |
| eighteen times apart | `/demand/how-people-search/` — Semrush 390 vs Wordstat 7,034 |
| zero impressions, home page never crawled | `/cases/atlas-itself/`, Search Console, measured 2026-08-12 |
| MIT / CC BY 4.0, four plugin commands, topics | `LICENSE`, `LICENSE-CONTENT`, `README.md`, GitHub repo metadata |

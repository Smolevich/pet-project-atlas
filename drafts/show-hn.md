# Show HN submission

Written against https://news.ycombinator.com/showhn.html and the site guidelines, read 2026-08-12.
Draft only. The owner submits, and does not ask anyone to upvote or comment — HN says so plainly and so does our own `/distribution/communities/`.

---

## Title line

```
Show HN: Pet Project Atlas – what I measured trying to get a side project found
```

76 characters, inside HN's 80-character limit.

**Why this title.** It states what the thing is and what it is made of, and it promises nothing. "Measured" is the only claim in it, and every page on the site backs that claim with a date and an instrument. No verb like "get found", no number in the title — a number in a title reads as a hook, and the numbers here are zeros that need one sentence of context each to be honest rather than cute.

**Alternative, if he wants the artefact first rather than the method:**

```
Show HN: An open-source atlas for getting a side project found, zeros included
```

**Rejected:** anything leading with "74 queries, 278 impressions, 1 click". It is the strongest line I have, and as a title it hides what the submission actually is, which is the failure mode HN comments punish first.

---

## URL to submit

```
https://github.com/Smolevich/pet-project-atlas
```

Reasoning under "Before you post" below.

---

## Body text (post as the author's first comment, immediately after submitting)

I run a couple of small side projects and could never tell whether the SEO advice I was following did anything, so for the last three months I wrote down what I actually ran and what came back. This is that, cleaned up: 66 pages, English and Russian, seven sections in the order the problems arrive — demand, indexing, AI search, content, distribution, analytics, money. Astro + Starlight, MIT on the code, CC BY 4.0 on the text.

What you can run: `npm install && npm run dev` gets the site locally. The repo also ships a Claude Code plugin with four commands — walk a live URL through the route, turn a project description plus a query export into content clusters, cut a weekly Search Console slice, and lint a draft against the style rules. The plugin is thin; the content is the work.

The part I think is worth your time is that the numbers are unflattering and they are on the pages anyway:

- Search Console for my Telegram bot's site, 2026-05-12 to 2026-08-12: 74 queries, 278 impressions, 1 click. The click came from position 49.
- llms.txt, which every guide tells you to publish: of the 45 requests that file has ever received, 44 were my own curl. No AI agent has fetched it.
- Semrush's db=ru database gives 390 monthly searches for a Russian phrase; Yandex Wordstat gives 7,034 for the same phrase and window. I had already published a conclusion built on the 390. It did not survive the re-pull, and the retraction is on the page instead of the conclusion.
- I counted bots with `grep -o` and double-counted Googlebot, because Googlebot appears twice in its own user-agent string. I shipped the doubled numbers before I noticed.

The site went live on 10 August. Two days in it has 0 impressions, 0 clicks, and Google's URL Inspection says the home page is unknown to it. That is on a page called "This atlas, two days in", which I will re-measure monthly whatever it says.

What is unfinished, so nobody has to find it the hard way:

- No results. The atlas has no traffic, no case studies except its own, and nothing here proves the route works. It is a procedure plus one operator's log.
- The Cases section is empty by design and states the bar a write-up has to clear.
- The Communities page carries no measurement of mine at all — it is published venue rules plus mechanism, and says so in its own text.
- Every example product is one Russian-language Telegram bot. Four people reviewed the site and all four flagged that.
- The Demand section is the hardest one for an English-speaking reader: two of its steps want a Yandex account, and Google Keyword Planner wants an Ads account with a card. Both are marked skippable, and it is still the roughest entry point on the site.
- I am not an SEO expert and the home page says so before anything else.

Corrections are the most useful thing you can leave. If a number is wrong, the page has an "Edit page" link and the repo has an issue template for exactly that.

---

## Before you post — read this first

**The guideline risk is real.** Show HN says: "Off topic: blog posts, sign-up pages, newsletters, lists, and other reading material. Those can't be tried out, so can't be Show HNs." A documentation site is reading material. The honest position is that this submission stands on the repo — the site source you can run, plus a Claude Code plugin you can install and use — and the body leads with the runnable part for that reason. That is why the URL above is the GitHub repo and not `atlas.smolevich.com`.

Two ways this can go, and both are fine:

1. Submit as **Show HN** with the repo URL, as drafted. If a moderator recategorises it, nothing is lost.
2. Submit as a **plain story** with the site URL and no "Show HN" prefix. Then the title should drop the prefix and read: `Pet Project Atlas: what I measured trying to get a side project found`. Same body as the first comment.

Judgement call, his to make. If in doubt, option 2 costs nothing and cannot be wrong.

**Account state.** Show HN and HN generally treat a link from an account with no history as the thing to filter. Check the account has comment history before submitting; if it does not, that is a reason to delay, not to post anyway.

**Do not solicit.** No asking friends to upvote or comment, no posting the HN link in the Telegram channel with a nudge. HN says it, and `/distribution/communities/` says it on our own site — getting caught contradicting our own page is the one outcome that costs more than a dead submission.

**Timing.** Post when you can sit with the thread for the next few hours. Show HN rewards the author answering questions; an unanswered thread dies regardless of the submission.

---

## Where every number comes from

| Number | Source |
|---|---|
| 66 pages | `https://atlas.smolevich.com/sitemap-0.xml`, live count 2026-08-12 (33 EN + 33 RU) |
| 74 queries, 278 impressions, 1 click, position 49 | `/tools/paid-tools/`, Search Console API, 2026-05-12 to 2026-08-12 |
| 44 of 45 llms.txt requests were his own curl | `/cases/atlas-itself/` |
| Semrush 390 vs Wordstat 7,034 | `/demand/how-people-search/` |
| doubled Googlebot from `grep -o` | `/cases/atlas-itself/`, "What did not work" |
| live 10 August, 0 impressions, 0 clicks, home page unknown to Google | `/cases/atlas-itself/`, Search Console, measured 2026-08-12 |
| MIT / CC BY 4.0, four plugin commands | `LICENSE`, `LICENSE-CONTENT`, `README.md`, `plugin/skills/` |
| four reviewers flagged the single-example problem | `pet-project-atlas-notes/review-findings-2026-08-12.md` §4 |

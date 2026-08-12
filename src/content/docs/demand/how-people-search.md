---
title: The words people actually type
description: Where real phrasings come from, how to read Yandex and Google for them, and what Semrush and its peers are actually measuring when they hand you a volume number.
updated: 2026-08-12
sources:
  - https://wordstat.yandex.ru/
  - https://yandex.ru/support/direct/keywords/symbols-and-operators.html
  - https://support.google.com/google-ads/answer/7337243
  - https://trends.google.com/trends/
  - https://www.semrush.com/kb/997-semrush-data
  - https://ahrefs.com/big-data
  - https://www.similarweb.com/corp/ourdata/
  - https://serpstat.com/features/
  - https://topvisor.com/rank-tracker/
  - https://moz.com/help/keyword-explorer
  - https://support.google.com/webmasters/answer/7042828
---

## What we are solving

You have a product and a word for it. The demand, if it exists, is worded by other people, in their vocabulary and often in another alphabet.

Nothing tells you when the two never meet. The pages get written, the crawler takes them, and the queries land on somebody else.

So the first question is not how to rank. It is whether anybody types this at all.

## Steps

### What the paid panels actually measure

Semrush, Ahrefs, Similarweb, Serpstat, Topvisor and Moz sell the same shape of answer: a number next to a phrase. Read the instrument before the number.

None of these services measures your site. They estimate it from the outside. Their own crawlers, plus purchased clickstream — a panel of anonymised browsing sessions, run through a model.

That is why their traffic figure never matches Search Console. Search Console counts events on your own property. A panel extrapolates from other people's browsers.

| Tool | What its instrument actually is |
|---|---|
| Semrush | Third-party SERP collection and a clickstream panel, modelled into volume and traffic |
| Ahrefs | Own link crawler, plus a keyword database with clickstream-corrected volumes |
| Similarweb | Panel and partner data extrapolated to whole-site traffic, not to keyword positions |
| Serpstat | Keyword and SERP databases, sold per country database |
| Topvisor | Rank checks in the engines you pick, priced per check |
| Moz | Link index, plus a keyword explorer with modelled volume ranges |

Then the question that decides this for a Russian-market project: which of them reads Yandex.

Semrush documents position tracking for Google, Bing and Baidu. Yandex appears in its traffic toolkit as a source label, not as a rank database. Topvisor checks Google, Yandex, Bing and Seznam. Serpstat ships Yandex databases alongside its Google ones.

Database size is the wrong criterion here. A panel that does not read Yandex describes part of a Russian-language market and does not say which part. The atlas has that in measured form, on a live project: [what a paid rank tracker measures](/tools/paid-tools/).

Now the harvest itself, which no panel does for you.

1. **Harvest phrasings, do not invent them** — support messages, reviews, forum threads, the search box inside your own product.
   Write down the exact words, including the clumsy ones. Your own vocabulary is the least reliable source in the room.
2. **Open Yandex Wordstat for Russian demand** — type the problem, not the product name.
   Read the second column as well: it lists what the same people searched next. The vocabulary you do not have is usually in there.
3. **Pin the phrase with operators first** — quotes limit it to that phrase, `!` fixes the word form.
   A bare phrase collects every query that contains it. That is a category total, not demand for your wording.
4. **Read Yandex suggest as a separate source** — start typing and stop.
   The dropdown is completions people picked, not a forecast. It disagrees with Wordstat often enough to be worth reading twice.
5. **Do the same in Google for English demand** — Keyword Planner for the ranges, then the suggest.
   Planner reports ranges rather than counts, and widens them without an active campaign. Treat it as an order of magnitude.
6. **Search inside the platform where the product lives** — the store, the marketplace, Telegram.
   Write down who comes up. Competitor names there are a free list of the exact words the demand uses.
7. **Separate demand for a solution from demand for your product** — problem queries against brand queries.
   Brand queries are demand you already earned. Problem queries are the market, and they are the only ones that can grow before anyone knows your name.
8. **Read a zero as a signal, not as noise** — especially on the phrase that seems most obvious to you.
   It means one of two things. Either nobody has this problem in those words, or you invented the word and the market calls it something else. Both are findings, and both cost less now than after the writing.

## What did not work

- **Naming the product in Latin script while the demand was typed in Cyrillic**. The words were right and the alphabet was wrong. Queries in the audience's script could not reach the product at all, and nothing was logged, because nothing failed.
- **Reading the user base as proof of the market**. The geography of signups matched the Latin spelling of the name rather than the market I was building for. I spent weeks on product theories about an audience that was an artefact of one metadata field.
- **Assuming my vocabulary was the market's**. My word for the core feature was not the word people typed. The pages existed, the demand existed, and they passed each other.
- **Reading one panel as "the search market"**. The tool reported Google. The phrases were Russian, Yandex serves that demand too, and not one row in the panel was about it. The panel does not warn you about the engine it cannot see.
- **Waiting for a tool to say what to write**. Its topics report answered that the domain was too small or too new to have any. A service that reads an existing footprint cannot create the first one.
- **Buying the subscription before doing this by hand**. It returned a keyword list and a competitor's name. Both were reachable in an afternoon with a browser, and neither changed what I had to do next.

## Verify

- Check your obvious phrase and a competitor's phrase in the same panel, on the same day. If yours comes back empty and theirs does not, the word is the finding.
- Run the phrase by hand on the live results page, with country and language pinned. Compare what comes back with what the panel said.
- Search the platform from an account that has never touched the product, in the audience's language. Note whether you appear at all, and who is above you.
- Name the engine behind every figure you write down. A number without an engine next to it is not usable in a Russian-language market.
- Finish with a file: one row per phrasing, its origin, and the engine it was checked in. A row with no origin is your own vocabulary wearing a disguise.

One panel read across three niches and four markets is here: [which market to build for](/demand/pick-a-market/).

The phrasings feed the second question: [whether that audience pays for anything](/demand/will-they-pay/). Turning the list into pages comes much later, in [what to write about when nobody searches your name](/content/keyword-clusters/).

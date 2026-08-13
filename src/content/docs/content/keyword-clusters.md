---
title: What to write about when nobody searches your name
description: Collect the phrasings people actually use, group them into clusters, give each cluster one page, and write them in the order that pays.
updated: 2026-08-10
sources:
  - https://support.google.com/webmasters/answer/7576553
  - https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content
---

## What we are solving

Nobody types your product name yet. The demand that exists is worded as a problem, in someone else's vocabulary, spread across dozens of phrasings that all want the same answer.

So the working unit is not a keyword and not a topic. It is a cluster: the phrasings one page can satisfy without splitting its answer in half. Get the clusters wrong and you pay twice, once for writing the pages and once for merging them.

## Steps

### Where the phrasings come from

From support messages, reviews, forum threads and search autocomplete — anywhere people described the problem in their own words. Write those words down exactly as they came, including the clumsy ones, because the clumsy ones are what gets typed.

The one source I do not use is myself. My own word for a feature is what I hear all day, which is precisely why it is not what anyone else reaches for.

### The queries you already appear for and lose

Search Console's Performance report lists queries by impressions and not only by clicks, which makes it the cheapest place to look. It opens from the property's left-hand navigation, and the list you want is its Queries tab.

A query sitting there with impressions and no clicks is demand you are already touching and losing. You are on the page, people are reading the line, and they go somewhere else — and that is a cluster you do not have to invent.

### The capability nobody is searching for

Compare that list against what people actually do inside the product. On one project the most-used feature had 0 queries in the report, for the simple reason that no page of mine named it.

So the report does not know about that feature, which is a very different thing from nobody wanting it. The hole is in your map, not in the demand.

### One page or two

Split by intent before you split by topic: transactional, comparison, informational. Same topic and different intent means different pages, because "X pricing" and "what is X" cannot share one page without one of them losing.

Then test the grouping against the results page rather than against your own logic. Search two candidate queries and compare the top URLs: mostly the same URLs means one cluster, and different page types — a tool, a listicle, a product page — mean different clusters. That page is search telling you what it thinks the query wants, and an essay will not take a slot that comparisons are holding. Argue with it after you rank.

### Who owns which query

One page per cluster, written down, in a table you can commit next to the pages:

| Cluster | Primary query | URL | Status |
|---|---|---|---|
| transcription pricing | voice bot pricing | `/pricing/` | published |
| free alternatives | free voice-to-text bot | — | to write |

The table is what stops next month's article from quietly claiming a query that already has an owner. I kept this in my head for a while and then published a page that competed with my own.

### What to write first

Transactional, then comparison, then informational — money order, not volume order. A small query that ends in a signup beats a large one that ends in a bounce, and you will run out of energy long before you run out of clusters.

## What did not work

- **A page per keyword**. Each one answered a variant of the same question, none had enough substance to rank, and read together they looked exactly like what a machine produces.
- **Two pages chasing one intent**. The same query returned different URLs on different days, and the average position sat still because search was choosing between them and choosing badly. What fixed it was a merge and a redirect from the loser, not a rewrite of both.
- **Naming things in my own vocabulary**. My word for the core feature was not the word people typed. The pages existed, the demand existed, and the two never met.
- **Writing to the biggest volume number**. The large informational cluster brought readers who had no reason to sign up. The small transactional one moved something.
- **Reading low clicks as a content problem**. Impressions with no clicks is a title and snippet problem, and I rewrote the body twice before I read the report properly.
- **Keeping the plan in my head**. Months later I could not remember which page owned which query, so I published a new one that competed with a page I already had.

## Verify

Run `/atlas:content-plan` from [Tools](/tools/). It takes the project description, the audience language and an optional query export, and returns clusters with one page each, as a markdown table you can commit next to the pages.

Then read the report two ways.

- Filter by page and count distinct queries. A cluster page collects many; a keyword page collects one.
- Filter by query and count your own URLs. More than one means the pages are competing, and the merge is already overdue.
- Compare impressions for the cluster before and after publishing. Impressions move first and clicks follow later, so do not read week one as a verdict.
- Check that every row in the table has exactly one owning URL, and that the URL exists.

The plan says which page to write. What goes inside it is the next problem: [what a page that ranks and gets cited is made of](/content/page-templates/).

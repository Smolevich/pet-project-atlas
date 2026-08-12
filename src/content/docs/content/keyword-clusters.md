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

Nobody types your product name yet. The demand that exists is worded as a problem, in someone else's vocabulary.

A keyword is not a topic, and a topic is not a page. The working unit is a cluster: the phrasings one page can satisfy without splitting its answer.

Get the clusters wrong and you write pages that compete with each other. That costs twice — the writing, then the merge.

## Steps

1. **Harvest phrasings, never invent them** — support messages, reviews, forum threads, search autocomplete.
   Write down the exact words people used, including the clumsy ones. Your own vocabulary is the least reliable source in the room.
2. **Add the queries you already appear for** — the Performance report lists queries by impressions, not only by clicks.
   The report opens from the property's left-hand navigation in Search Console, and the list you want is its Queries tab.
   A query with impressions and no clicks is demand you already touch and lose. That is the cheapest cluster you will ever find.
3. **Look for the capability with no queries at all** — compare the list against what people do inside the product.
   On one project the most-used feature had zero queries in the report, because no page named it. A hole in the report is a hole in your map, not proof that demand is missing.
4. **Split by intent before you split by topic** — transactional, comparison, informational.
   Same topic, different intent, different page. "X pricing" and "what is X" cannot share a page without one of them losing.
5. **Test the grouping against the results page** — search two candidate queries and compare the top URLs.
   Mostly the same URLs means one cluster. Different page types — a tool, a listicle, a product page — mean different clusters.
6. **Assign exactly one page per cluster, in writing** — a table with cluster, primary query, URL, status.
   The table is what stops next month's article from claiming a query that already has an owner.
7. **Match the page type to what already ranks** — an essay will not take a slot held by comparisons.
   The results page is search telling you what it thinks the query wants. Argue with it after you rank.
8. **Order the queue by money, not by volume** — transactional first, then comparison, then informational.
   A small query that ends in a signup beats a large one that ends in a bounce. You will run out of energy long before you run out of clusters.

## What did not work

- **A page per keyword**. Each one answered a variant of the same question. None had enough substance to rank, and together they read like a machine wrote them.
- **Two pages chasing one intent**. The same query returned different URLs on different days. The average position sat still, because search was choosing between them and choosing badly. The fix is a merge and a redirect from the loser, not a rewrite of both.
- **Naming things in my own vocabulary**. My word for the core feature was not the word people typed. The pages existed, the demand existed, and they never met.
- **Writing to the biggest volume number**. The large informational cluster brought readers with no reason to sign up. The small transactional one moved something.
- **Reading low clicks as a content problem**. Impressions with no clicks is a title and snippet problem. I rewrote the body twice before I read the report properly.
- **Keeping the plan in my head**. Months later I could not remember which page owned which query. I published a new one that competed with a page I already had.

## Verify

Run `/atlas:content-plan` from [Tools](/tools/). It takes the project description, the audience language and an optional query export. It returns clusters with one page each, as a markdown table you can commit next to the pages.

Then read the report two ways.

- Filter by page and count distinct queries. A cluster page collects many; a keyword page collects one.
- Filter by query and count your own URLs. More than one means the pages compete, and the merge is overdue.
- Compare impressions for the cluster before and after publishing. Impressions move first, clicks later.
- Check that every row in the table has exactly one owning URL, and that the URL exists.

The plan says which page to write. What goes inside it is the next problem: [what a page that ranks and gets cited is made of](/content/page-templates/).

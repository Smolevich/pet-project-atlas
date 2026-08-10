---
name: content-plan
description: Turn a project description and an optional Search Console export into query clusters, one page per cluster, and a writing queue ordered by money. Use when the user says "what should I write about", "nobody searches my product name", "make me a content plan", "составь контент-план", or hands over a query export and asks what to do with it.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(head *)
  - Bash(wc *)
  - WebFetch
---

# /atlas:content-plan

Implements the method on <https://atlas.smolevich.com/content/keyword-clusters/>. Read that page if you
need the reasoning. This file is the procedure.

The working unit is a **cluster**: the phrasings one page can satisfy without splitting its answer.
Not a keyword, not a topic. A page per keyword produces thin pages that compete with each other.

## 1. Collect the input

Ask for these and wait:

1. **What the project does**, in the author's own words, and what a person can do inside it.
2. **The language the audience searches in.** Not the interface language. It decides which results
   pages you check in step 4 and which heading set the drafts use in step 7.
3. **A Search Console export, if there is one** — the Performance report, queries, CSV or TSV.
   Optional. Say plainly that without it steps 2 and 3 below run on guesses, and the plan is weaker.

If an export is given, read it and confirm the column you are using:

```bash
head -3 <export.csv>
wc -l <export.csv>
```

**Sort by impressions, not by clicks.** A query with impressions and no clicks is demand you already
touch and lose — the cheapest cluster in the file.

## 2. Harvest phrasings, never invent them

Sources, in order of trust: support messages, reviews, forum and community threads, search
autocomplete, the export.

Write down the exact words people used, clumsy ones included. **The author's own vocabulary is the
least reliable source in the room** — the internal name for a feature is usually not what anyone types.

If the author gives you a phrase they made up, keep it out of the plan and say why.

## 3. Find the capability with no queries at all

Compare the harvested list against what people actually do inside the product.

A heavily used feature with zero queries in the export is a hole in the map, not proof that demand is
absent. It usually means no page names it, so no page can be shown for it. Flag every such capability
as a candidate cluster and mark it clearly as unvalidated.

## 4. Split by intent, then by topic — and test against the results page

**Intent first.** Transactional, comparison, informational. Same topic and different intent means
different pages: "X pricing" and "what is X" cannot share a page without one of them losing.

Then test each candidate grouping. Search two queries from the same candidate cluster and compare the
top URLs:

- Mostly the same URLs → one cluster.
- Different page types — a tool, a listicle, a product page → different clusters.

Record what page type already ranks. An essay does not take a slot held by comparisons. The results
page is search telling you what it thinks the query wants.

If you cannot run the searches, say so and mark the grouping as untested. Do not present a guess as a
validated cluster.

## 5. Order the queue by money, not by volume

Transactional first, then comparison, then informational.

A small query that ends in a signup beats a large one that ends in a bounce. The author will run out of
energy long before they run out of clusters, so the order decides what actually gets written.

Two overrides move a row up, and both need to be written into the reason column:

- **Impressions with no clicks on a page that already exists.** That is a title and snippet rewrite,
  not a new page. Cheapest thing in the queue.
- **A cluster with two pages already chasing it.** That is a merge and a redirect from the loser, not a
  new page. It is unpaid debt and it blocks the pages around it.

## 6. Output: two tables

Write markdown, nothing else, so the author can commit it next to the pages.

**Table one — the cluster map.** One row per cluster, exactly one owning URL. This table is what stops
next month's article from claiming a query that already has an owner.

| Cluster | Primary query | Other phrasings | Intent | Page type that ranks | Owning URL | Status |
|---|---|---|---|---|---|---|

`Status` is one of: `to write`, `exists`, `rewrite title`, `merge`. Every row has exactly one URL. If
the page does not exist yet, the URL is the planned path, and `Status` is `to write`.

**Table two — the writing queue.** Ordered, with the reason for the position spelled out.

| # | Cluster | Why here | Evidence |
|---|---|---|---|

`Why here` names the rule: intent, an override from step 5, or a dependency. `Evidence` is the export
row, the results-page observation, or `unvalidated` — never blank.

## 7. Draft each planned page down to its headings

For every row with status `to write`, output a title and the four required H2 blocks, empty, in order.

The title is the reader's question, carrying the primary query. Not the internal product name.

English:

```markdown
# <the reader's question, carrying the primary query>

## What we are solving
## Steps
## What did not work
## Verify
```

Russian:

```markdown
# <вопрос читателя с основным запросом>

## Что решаем
## Шаги
## Что не сработало
## Проверить
```

The headings are matched literally by the linter — no extra words, no rephrasing, no emoji. What goes
under each one: <https://atlas.smolevich.com/content/page-templates/>.

## Rules

- **Do not invent search volumes, impressions or positions.** Every number in the output traces to a
  row of the export. No export means no numbers, and that is an acceptable plan.
- **Do not write the pages.** This skill stops at titles and empty headings.
- One cluster, one URL. A cluster with two owners is the bug this whole procedure exists to prevent.
- A plan kept in the author's head is not a plan. The output is a file.

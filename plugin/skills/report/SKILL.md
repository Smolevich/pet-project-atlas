---
name: report
description: The weekly slice — six numbers from Search Console exports and your own product data, the delta against the previous period, three conclusions and one action. Use when the user says "weekly report", "what moved this week", "недельный отчёт", "сними цифры за неделю", or hands over a Search Console Performance export and asks what changed.
user-invocable: true
allowed-tools:
  - Read
  - Write
---

# /laviolab-atlas:report

Collects the six numbers defined on <https://atlas.smolevich.com/analytics/what-to-measure/>, compares
them with the previous period, and ends with three conclusions and one action.

**This skill works only from files.** The author downloads the exports and hands over the paths; the
skill reads them. It does not connect to Google, does not drive a browser and runs no commands.

## Prerequisites — check all of these first, and stop on the first one missing

**Never ask for a password, an API key or an access token, and do not use one if the author pastes it.**
Tell them to remove it and to hand over the export instead.

Say exactly which input is missing and how to get it. **Do not continue with a partial report** unless
the author says to go ahead with what is there; then label it partial.

1. **The domain and the Search Console property** it belongs to.
2. **A Performance export with a comparison.** In Search Console: Performance → Search results → Date →
   Compare → the current window against the previous one → Export → Download CSV. That gives a ZIP of
   tables; ask for the unpacked CSV files. You need `Queries.csv` and `Dates.csv`; `Filters.csv`
   confirms the property and the date range.
3. **The submitted-URL count and the indexed count.** Indexing → Pages, switch the filter from
   "All known pages" to "All submitted pages", then either export it or read the two totals, indexed
   and not indexed, off the screen.
4. **The product's own export for signups, activation and repeat use** — a CSV from their database or a
   GA4 exploration. Ask which. Search Console cannot answer metrics 4 to 6.
5. **The name of the single action that counts as activation.** If the author cannot name one action,
   the metric does not exist yet. Say that, and report metrics 1 to 4 only.

Missing inputs are the expected outcome the first time. A report that quietly comes back empty is worse
than one that refuses to run.

## The period

Ask for the domain and the period. Default to a rolling 28-day window ending on the same weekday as the
last snapshot — that removes the weekday effect and makes the series comparable.

Compute the previous period as the 28 days immediately before it. Every number gets a delta.

Search Console data lags behind real time and the most recent days are incomplete. If the window ends
today, say that the tail is provisional.

## Read the numbers from the exports

Before any arithmetic, read `Filters` and say which property and which two date ranges the export
covers. If they do not match the period above, stop and say so.

**Metrics 1 and 2** — from `Dates`: sum clicks and impressions over each window. Average position is
the impressions-weighted mean of the daily position; say that it is computed, not read off the screen.
The distinct query count is the number of rows in `Queries` with impressions in the window. The UI
export stops at 1,000 rows: if the table has 1,000, report the count as "1,000 or more".

**Metric 3** — indexed submitted URLs divided by all submitted URLs, from step 3 of the prerequisites.
If the export has the daily chart, take the value at the end of each window for the delta.

**Metrics 4 to 6** — from the product export. Prefer the product's own database to GA4 where both
exist: it knows which accounts are the author's; GA4 does not.

Show the formula next to each number, so the author can redo it by hand.

## The six numbers

Report each one with its delta against the previous period, and never one without the other.

| # | Number | Source | What it answers |
|---|---|---|---|
| 1 | Impressions, plus the count of distinct queries | Performance export | Whether search considers you an answer to anything at all |
| 2 | Clicks and average position, together | Performance export | Ranking problem or packaging problem |
| 3 | Share of submitted URLs actually indexed | Page indexing, submitted pages | How much of the writing is eligible to rank |
| 4 | Signups, the author's own accounts subtracted | Product export or GA4 | Whether the traffic contains anyone who wants the thing |
| 5 | Activation — the share reaching the one named action | Product export | Whether they got the thing at all |
| 6 | Repeat use on a later day, cohorted by week of first contact | Product export | Whether this is a product or a demo |

Rules that change the answer:

- **Metric 3.** Denominator is submitted URLs. A page count on its own is fiction.
- **Metric 4.** Subtract internal ids before aggregating, not after. Count people, not events.
- **Metric 5.** Account created is not activation, and neither is pressing start.
- **Metric 6.** Cohort it. Pooling everyone lets new arrivals hide retention that is falling.

## No data

If the period has no data, **say so in one plain line and stop.**

```
No Search Console data for 2026-07-13..2026-08-09. The export has zero rows.
```

Never interpolate, never carry the previous period forward, never round a zero into "a handful". Zero
is a result worth publishing: "0 clicks in the first month" tells the reader more than a hedge. Every
number in the output traces to a row of a file the author gave you.

If only some inputs arrived, report those and list the missing ones by name. A partial report labelled
partial is fine. A partial report presented as whole is not.

## Close the report

**Three conclusions.** Each one names a number and what it implies. At small volumes most movement is
noise, so say when a delta is too small to mean anything — that is a legitimate conclusion.

Two readings worth making explicitly, because neither shows in a total:

- Break activation down by first action. The paths usually differ, and that says which one to put in
  front of new users.
- Count the people who produced no event at all. That is a verdict on the first screen.

**One action.** Exactly one, and it fixes the earliest large drop in the funnel, not the last one.
Tuning payment while activation is broken is work on a step almost nobody reaches.

Common readings:

- Impressions up, clicks flat, position decent → title and snippet, not the body.
- Impressions flat, queries flat → nothing new was found; that is a content plan problem, so run
  `/laviolab-atlas:content-plan`.
- Index share falling → go to <https://atlas.smolevich.com/indexing/submit-and-verify/>.
- Signups up, activation flat → the first screen, not the traffic.

## Append to the series

One snapshot a week, same weekday, same window. Ask which history file to append the block to, and
write it there; if the author names none, give them the block as markdown to paste.

A number you cannot compare with itself last month is decoration. One reading is not a trend, and two
are barely a line.

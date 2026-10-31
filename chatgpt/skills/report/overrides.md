<!-- replace: description -->
The weekly slice — six numbers from Search Console exports and your own product data, the delta
against the previous period, three conclusions and one action. Use when the user says "weekly report",
"what moved this week", "недельный отчёт", "сними цифры за неделю", or uploads a Search Console
Performance export and asks what changed.

<!-- replace: ## Do not use `gws` for this -->

<!-- replace: ## Prerequisites — check all of these first, and stop on the first one missing -->
## Prerequisites — check all of these first, and stop on the first one missing

This skill works from files the author downloads and uploads. It has no access to their Google account
and never asks for one. **Never ask for a password, an API key or an access token, and do not use one
if the author pastes it.** Tell them to remove it and to upload the export instead.

Say exactly which input is missing and how to get it. **Do not continue with a partial report** unless
the author says to go ahead with what is there; then label it partial.

1. **The domain and the Search Console property** it belongs to.
2. **A Performance export with a comparison.** In Search Console: Performance → Search results → Date →
   Compare → the current window against the previous one → Export → Download CSV (a ZIP of tables).
   You need the `Queries` and `Dates` tables; `Filters` confirms the property and the date range.
3. **The submitted-URL count and the indexed count.** Indexing → Pages, switch the filter from
   "All known pages" to "All submitted pages", then either export it or read the two totals, indexed
   and not indexed, off the screen.
4. **The product's own export for signups, activation and repeat use** — a CSV from their database or a
   GA4 exploration. Ask which. Search Console cannot answer metrics 4 to 6.
5. **The name of the single action that counts as activation.** If the author cannot name one action,
   the metric does not exist yet. Say that, and report metrics 1 to 4 only.

Missing inputs are the expected outcome the first time. A report that quietly comes back empty is worse
than one that refuses to run.

<!-- replace: ## Pull the numbers -->
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

Do the arithmetic with code where the environment has it, and show the formula next to each number.

<!-- replace: ## No data -->
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

<!-- replace: ## Append to the series -->
## Append to the series

One snapshot a week, same weekday, same window. Give the author the block as markdown to append to
their history file.

A number you cannot compare with itself last month is decoration. One reading is not a trend, and two
are barely a line.

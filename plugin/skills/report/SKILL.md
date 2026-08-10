---
name: report
description: The weekly slice — six numbers from Search Console and your own product data, the delta against the previous period, three conclusions and one action. Use when the user says "weekly report", "what moved this week", "pull my Search Console numbers", "недельный отчёт", "сними цифры за неделю", or names a domain and a period.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(curl *)
  - Bash(gcloud auth *)
  - Bash(jq *)
  - Bash(date *)
---

# /atlas:report

Collects the six numbers defined on <https://atlas.smolevich.com/analytics/what-to-measure/>, compares
them with the previous period, and ends with three conclusions and one action.

## Do not use `gws` for this

`gws` is a Google Workspace command line. It does not expose Search Console or Analytics. Both were
tested against the installed build and both are rejected:

```
gws searchconsole:v1   -> Unknown service 'searchconsole'
gws analyticsdata:v1beta -> Unknown service 'analyticsdata'
```

Its known services are Drive, Sheets, Gmail, Calendar and the rest of Workspace. If a guide tells you
to pull Search Console through `gws`, the guide is wrong. Use the REST APIs below.

## Prerequisites — check all of these first, and stop on the first one missing

Say exactly which one failed and what the author has to do. **Do not continue with a partial report.**

1. **A verified Search Console property** for the domain. A domain property is `sc-domain:example.com`;
   a URL-prefix property is the full origin. The value must be URL-encoded in the path
   (`sc-domain%3Aexample.com`).
2. **An OAuth access token** with `https://www.googleapis.com/auth/webmasters.readonly`, and
   `https://www.googleapis.com/auth/analytics.readonly` as well if GA4 is in scope. The author's own
   credentials, not a service account they do not control.

   ```bash
   gcloud auth application-default login \
     --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/analytics.readonly
   gcloud auth application-default print-access-token
   ```

   Any OAuth flow that yields a token with those scopes is fine. This is the one that is installed here.
3. **A quota project the caller is allowed to use.** Application Default Credentials carry no quota
   project, and Search Console rejects the call without one:

   ```
   403  The searchconsole.googleapis.com API requires a quota project, which is not set by default.
   ```

   Set it once, or send it per request as a header:

   ```bash
   gcloud auth application-default set-quota-project PROJECT_ID
   # or:  -H "x-goog-user-project: PROJECT_ID"
   ```

   The caller needs `roles/serviceusage.serviceUsageConsumer` on that project, and the Search Console
   API has to be enabled on it. Without the role the call fails again, differently:

   ```
   403  Caller does not have required permission to use project PROJECT_ID.
   ```

   Both of these are permission problems, not empty data. Report them as such and stop.
4. **A GA4 property id**, if metrics 4 to 6 come from GA4 rather than the product's own database. The
   numeric id, not the measurement id.
4. **The product's own source for signups, activation and repeat use** — a database, a query, an export.
   Ask which one. Search Console cannot answer any of metrics 4 to 6.
5. **The name of the single action that counts as activation.** If the author cannot name one action,
   the metric does not exist yet. Say that, and report metrics 1 to 4 only.

Missing prerequisites are the expected outcome the first time. A report that quietly comes back empty
is worse than one that refuses to run.

## The period

Ask for the domain and the period. Default to a rolling 28-day window ending on the same weekday as the
last snapshot — that removes the weekday effect and makes the series comparable.

Compute the previous period as the 28 days immediately before it. Every number gets a delta.

Search Console data lags behind real time and the most recent days are incomplete. If the window ends
today, say that the tail is provisional.

## Pull the numbers

**Search Console — Search Analytics** (metrics 1 and 2):

```bash
curl -s -X POST \
  "https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3AEXAMPLE.COM/searchAnalytics/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"startDate":"START","endDate":"END","dimensions":["query"],"rowLimit":25000}'
```

Totals come from the same call with `"dimensions": []`. The distinct query count is the number of rows
returned with the `query` dimension.

**Search Console — URL Inspection** (metric 3, per-URL truth):

```bash
curl -s -X POST "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"inspectionUrl":"https://EXAMPLE.COM/page/","siteUrl":"sc-domain:EXAMPLE.COM"}'
```

Read `inspectionResult.indexStatusResult.coverageState`. This endpoint is rate-limited per property —
check the current quota in Google's documentation before inspecting a large site, and sample rather
than sweeping if the site is bigger than the quota allows.

The denominator is the URLs the author submitted, from the sitemap, not the pages they remember writing:

```bash
curl -s "https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3AEXAMPLE.COM/sitemaps" \
  -H "Authorization: Bearer $TOKEN"
```

**GA4 Data API** (metrics 4 to 6, when the product numbers live in GA4):

```bash
curl -s -X POST "https://analyticsdata.googleapis.com/v1beta/properties/PROPERTY_ID:runReport" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dateRanges":[{"startDate":"START","endDate":"END"}],
       "dimensions":[{"name":"date"}],"metrics":[{"name":"activeUsers"}]}'
```

Prefer the product's own database where it exists. It knows which accounts are the author's; GA4 does
not.

Any non-200 response stops the report. Print the status and the error body verbatim. Do not fall back
to an estimate.

## The six numbers

Report each one with its delta against the previous period, and never one without the other.

| # | Number | Source | What it answers |
|---|---|---|---|
| 1 | Impressions, plus the count of distinct queries | Search Analytics | Whether search considers you an answer to anything at all |
| 2 | Clicks and average position, together | Search Analytics | Ranking problem or packaging problem |
| 3 | Share of submitted URLs actually indexed | Sitemaps + URL Inspection | How much of the writing is eligible to rank |
| 4 | Signups, the author's own accounts subtracted | Product database or GA4 | Whether the traffic contains anyone who wants the thing |
| 5 | Activation — the share reaching the one named action | Product database | Whether they got the thing at all |
| 6 | Repeat use on a later day, cohorted by week of first contact | Product database | Whether this is a product or a demo |

Rules that change the answer:

- **Metric 3.** Denominator is submitted URLs. A page count on its own is fiction.
- **Metric 4.** Subtract internal ids before aggregating, not after. Count people, not events.
- **Metric 5.** Account created is not activation, and neither is pressing start.
- **Metric 6.** Cohort it. Pooling everyone lets new arrivals hide retention that is falling.

## No data

If the period has no data, **say so in one plain line and stop.**

```
No Search Console data for 2026-07-13..2026-08-09. The property returned zero rows.
```

Never interpolate, never carry the previous period forward, never round a zero into "a handful". Zero
is a result worth publishing: "0 clicks in the first month" tells the reader more than a hedge. Every
number in the output traces to a response body you actually received.

If only some sources answered, report those and list the missing ones by name. A partial report labelled
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
  `/atlas:content-plan`.
- Index share falling → go to <https://atlas.smolevich.com/indexing/submit-and-verify/>.
- Signups up, activation flat → the first screen, not the traffic.

## Append to the series

One snapshot a week, same weekday, same window. Append the block to a file and keep the history.

A number you cannot compare with itself last month is decoration. One reading is not a trend, and two
are barely a line.

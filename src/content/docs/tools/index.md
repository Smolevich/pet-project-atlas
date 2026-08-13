---
title: Tools
sidebar:
  order: 0
description: Start from the symptom you actually have. Each branch names the check to run and the page that explains it.
---

Start from what you can see, not from the tool you already know.

[What to run and when](/tools/skills/) collects every tool named on this site into one table: third-party skills, the browser MCP, the CLI, and this repository's four plugin commands. Each row carries its source and its licence. [What a paid rank tracker measures](/tools/paid-tools/) walks through one panel on live data: what it told me, what my own Search Console told me, and why the two disagreed.

## The site is not in the index

Search for `site:yourdomain.com` and count what comes back.

- **Nothing at all** — run `seo-audit`, then walk the checks in order: [Google does not see your site](/indexing/why-google-does-not-see-you/).
- **Only the home page** — you never handed the rest over: [submit the site and verify it was taken](/indexing/submit-and-verify/).
- **Pages come back, but they are the old ones** — the map is stale. Same page: [submit and verify](/indexing/submit-and-verify/).

## In the index, and no clicks

Open the Performance report in Search Console and read impressions before you read anything else.

- **Impressions with no clicks** — the problem is in the title and the snippet, not in the body of the page. Start with [the numbers worth reading weekly](/analytics/what-to-measure/), then [what a page is made of](/content/page-templates/).
- **No impressions at all** — you rank for phrases nobody types: [what to write when nobody searches your name](/content/keyword-clusters/).
- **Page two for everything, and the pages are technically clean** — then the gap is off-site: [where the first external links come from](/distribution/catalogs/).
- **The panel says you rank and nothing arrives** — check that row by hand before you act on it: [what a paid tracker measures](/tools/paid-tools/).
- **An assistant recommends competitors** — run `geo-crawlers` first: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). If access turns out clean and you are still not cited, run `geo-citability` and read [why AI answers cite someone else](/geo/citable-pages/).
- **The product lives inside Telegram or a store** — that platform runs its own index: [search inside the platform](/distribution/in-platform-visibility/).

## Clicks, and no signups

Three different things break here and they look identical from the outside.

- **You cannot say which page they land on** — start with the short list: [the numbers worth reading weekly](/analytics/what-to-measure/).
- **The page promises something the product does not do** — fix the shape of the page: [what a page is made of](/content/page-templates/).
- **They sign up and then never do anything** — you need one named action that counts as activation, and most likely nobody has named it yet. See [the numbers worth reading weekly](/analytics/what-to-measure/).

## Signups, and no idea where from

- **Links went out untagged** — this branch is the one that expires. Arrivals with no tag stay unclassified forever, and no later fix recovers them: [where the user actually came from](/analytics/attribution/).
- **Everything reads as direct or as your own channel** — a last-touch write is overwriting the answer. Same page: [attribution](/analytics/attribution/).

## Signups, and no repeat use

- **Nobody comes back on a later day** — cohort by week of first contact before you conclude anything from that. Start from [the numbers worth reading weekly](/analytics/what-to-measure/).
- **The people who do come back cost you money** — the next branch down.

## It works, and costs more than it earns

- **You cannot say what one action costs** — record the cost on the event row: [what one user costs](/money/unit-economics/).
- **You know the cost and there are no payers** — then it is demand, and another round of cost cutting will not touch it. Look at [distribution](/distribution/) and at activation.

## None of the above

The symptom is unclear, or several of these are true at once. Take the route in order instead: [start here](/start/).

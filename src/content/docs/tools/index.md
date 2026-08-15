---
title: Tools
sidebar:
  order: 0
description: Start from the symptom you actually have. Each branch names the check to run and the page that explains it.
---

Start from what you can see, not from the tool you already know.

[What to run and when](/tools/skills/) is one table of tools: third-party skills, the browser MCP, the CLI, and this repository's four plugin commands, each row carrying its source and its licence.

[What a paid rank tracker measures](/tools/paid-tools/) reads one panel on live data: what the panel said, what my own Search Console said, and why the two instruments disagreed.

## The site is not in the index

Search for `site:yourdomain.com` and count what comes back.

- **Nothing at all** — run `seo-audit`. Then walk the checks in order: [Google does not see your site](/indexing/why-google-does-not-see-you/).
- **Only the home page** — you never handed the rest over. Hand it over: [submit the site and verify it was taken](/indexing/submit-and-verify/).
- **The pages that come back are old ones** — your sitemap is stale. Same page: [submit and verify](/indexing/submit-and-verify/).

## In the index, and no clicks

Open the Performance report in Search Console and read impressions first, before anything else.

- **Impressions with no clicks** — the title and the snippet are the problem. The body of the page is not. Start with [the numbers worth reading weekly](/analytics/what-to-measure/), then [what a page is made of](/content/page-templates/).
- **No impressions at all** — you rank for phrases nobody types. [What to write when nobody searches your name](/content/keyword-clusters/).
- **Page two for everything, and nothing technical is broken** — then nobody outside links to you. [Where the first external links come from](/distribution/catalogs/).
- **The panel says you rank and nothing arrives** — check that row by hand first. [What a paid tracker measures](/tools/paid-tools/).
- **An assistant recommends competitors** — run `geo-crawlers` first: [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/). If the crawlers get in and you are still not cited, run `geo-citability`. Read [why AI answers cite someone else](/geo/citable-pages/).
- **The product lives inside Telegram or a store** — the platform runs its own index. [Search inside the platform](/distribution/in-platform-visibility/).

## Clicks, and no signups

Three different things break here, and from the outside they look identical.

- **You cannot say which page they land on** — start with the short list. [The numbers worth reading weekly](/analytics/what-to-measure/).
- **The page promises something the product does not do** — fix the shape of the page. [What a page is made of](/content/page-templates/).
- **They sign up and then never do anything** — you need one action that counts as activation. Most likely nobody has named it yet. See [the numbers worth reading weekly](/analytics/what-to-measure/).

## Signups, and no idea where from

- **Links went out untagged** — fix this branch today, because it expires. A visit that arrived with no tag stays unclassified forever. Nothing you do later brings it back: [where the user actually came from](/analytics/attribution/).
- **Everything reads as direct or as your own channel** — the last touch overwrote the real source. Same page: [attribution](/analytics/attribution/).

## Signups, and no repeat use

- **Nobody comes back on a later day** — group people by the week they first arrived. Read each week on its own before you conclude anything. Start from [the numbers worth reading weekly](/analytics/what-to-measure/).
- **The people who do come back cost you money** — read the next symptom below.

## It works, and costs more than it earns

- **You cannot say what one action costs** — write the cost into the event row. [What one user costs](/money/unit-economics/).
- **You know the cost and there are no payers** — then the problem is demand. Cutting costs another round will not move it. Look at [distribution](/distribution/) and at activation.

## None of the above

The symptom is unclear, or several of these are true at once — take the route in order instead: [start here](/start/).

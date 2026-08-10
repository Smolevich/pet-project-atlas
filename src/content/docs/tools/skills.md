---
title: What to run and when
description: The audit skills, the browser driver and the CLI this atlas points at — what each one does, when it earns the time, where it came from and under what licence.
updated: 2026-08-10
sources:
  - https://github.com/coreyhaines31/marketingskills
  - https://github.com/zubair-trabzada/geo-seo-claude
  - https://github.com/microsoft/playwright-mcp
  - https://github.com/googleworkspace/cli
  - https://skills.sh/
  - https://github.com/Smolevich/pet-project-atlas
---

## What we are solving

The atlas does not ship audit tooling. Good tooling exists, and rewriting it would be a worse copy nobody maintains.

What is missing is the map: which tool answers which question, and in what order to run them.

Every third-party row below is a package installed on my own machine. The licence column comes from the source repository, not from a guess.

## Steps

| Tool | What it does | When to reach for it | Where it comes from | Licence |
|---|---|---|---|---|
| `seo-audit` | Technical SEO audit — crawlability, indexing, on-page, page speed | Search returns nothing for the site, or a page fell out of the index | Skill, `coreyhaines31/marketingskills` | MIT |
| `geo` | Entry point over the GEO skills, routes a URL to the right one | You want one command and do not yet know which check you need | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-audit` | Full GEO audit through parallel subagents, one composite score | A baseline before you change anything, and the same run a month later | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-citability` | Scores passages for how likely a model is to quote them | The pages are written and assistants still cite somebody else | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-crawlers` | Reads `robots.txt`, meta tags and headers into an access map per agent | Before any citability work, and after any change at the edge | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-llmstxt` | Validates an existing `llms.txt` or drafts one from the site structure | You are publishing the file, or its links have gone stale | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-schema` | Detects and validates JSON-LD, generates the missing blocks | The entity markup is absent, or a redesign may have broken it | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| `geo-report` | Collects the audit results into one document for a reader | Somebody else has to act on the findings | Skill, `zubair-trabzada/geo-seo-claude` | MIT |
| Playwright MCP | Drives a real browser in your own profile, with your live sessions | Search Console, a store console, any panel with no usable API | npm `@playwright/mcp`, `microsoft/playwright-mcp` | Apache-2.0 |
| `gws` | One authenticated command line over the Google Workspace APIs | Keeping the weekly series in a Sheet, pulling an export out of Drive | npm `@googleworkspace/cli`, `googleworkspace/cli` | Apache-2.0 |
| `/atlas:start` | **Not built yet.** Walks a project through the route, calling the audit skills at the right points | — | This repo, `plugin/` | MIT |
| `/atlas:content-plan` | **Not built yet.** Turns a project description and a query export into clusters, one page each | — | This repo, `plugin/` | MIT |
| `/atlas:report` | **Not built yet.** A weekly slice of Search Console and Analytics: what moved, what to do | — | This repo, `plugin/` | MIT |
| `/atlas:voice` | **Not built yet.** Brings a draft in line with `STYLE.md` before the linter sees it | — | This repo, `plugin/` | MIT |

1. **Install the third-party skills from their repositories** — the skills CLI takes an owner and a repo name.

   ```bash
   npx skills add coreyhaines31/marketingskills
   npx skills add zubair-trabzada/geo-seo-claude
   ```

2. **Read the licence in the source repository, not in the skill folder** — an installed `SKILL.md` carries no licence line.
   The lock file `~/.agents/.skill-lock.json` records the repository each skill came from. That name is what you take to the licence.
3. **Run `seo-audit` first when nothing is in the index** — it walks fetch, block and canonical in one pass.
   It is faster than checking seven things by hand, and it fails loudly on the broken one.
4. **Run `geo-crawlers` before `geo-citability`** — access decides whether the writing is ever read.
   A blocked agent cannot quote a page, however good the page is.
5. **Use `geo-audit` for the baseline, a focused skill for the fix** — a composite score is a starting point.
   Re-run the same audit after the work. The delta is the only part of a score that means anything.
6. **Reach for Playwright MCP only where there is no API** — a panel behind a login, a console without export.
   Drive your own profile, so the authenticated sessions already exist. A fresh profile shows you a login form.
7. **Check `gws --help` for the service you need** — the list is printed by your own installed build.
   It covers Workspace. Search Console and Analytics are not in it.
8. **Do not plan around the four `/atlas:` commands** — the `plugin/` directory is not in the repository yet.
   Where a page tells you to run one, run the third-party skill in the same row instead.

## What did not work

- **Reaching for `gws` to pull Search Console numbers**. Its help offers an `<api>:<version>` form for unlisted APIs. I tried `searchconsole:v1` and `analyticsdata:v1beta`, and both came back as unknown services. Those numbers come from their own APIs, or out of the console by hand.
- **Looking for the licence inside the installed skill**. The folders under `~/.claude/skills/` hold a `SKILL.md` and its scripts. No licence, no author, no repository name. Provenance survives only in the lock file the installer wrote.
- **Treating an audit score as the work**. A composite number moves when anything moves. What changed behaviour was one line of a report: the agent that got a 403, the passage nobody could quote.
- **Running citability checks while the crawler was blocked**. The report scored my prose happily. No agent had read the page in weeks, so the score was about a document nobody fetched.
- **Driving a clean browser profile for panels behind a login**. Every run started at a sign-in screen. The profile with the live session is the only one that reaches the panel.
- **Believing this list is stable**. Third-party skills change owners, licences and behaviour between updates. Check the repository on the day you install, and again before you copy anything into your own project.

## Verify

- `cat ~/.agents/.skill-lock.json` and read the `sourceUrl` for each skill you installed. That is the repository whose licence applies.
- Open that repository and read the `LICENSE` file. If there is none, the terms are unknown, and unknown means do not redistribute.
- Run `gws --help` and find your service in the printed list. An absent service is absent, whatever a guide says.
- Run `seo-audit` against a page you already repaired. A report that still flags it means the fix did not reach production.
- Run `geo-crawlers` from a network that is not yours. An access map built from inside your own network hides the edge rules.

The routing question — which of these to run for the symptom you actually have — is the [Tools index](/tools/).

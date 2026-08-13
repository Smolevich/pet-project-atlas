---
title: What to run and when
sidebar:
  order: 1
description: The audit skills, the browser driver and the CLI this atlas points at — what each one does, when it earns the time, where it came from and under what licence.
updated: 2026-08-10
sources:
  - marketingskills, source of seo-audit — https://github.com/coreyhaines31/marketingskills
  - geo-seo-claude, source of the GEO skills — https://github.com/zubair-trabzada/geo-seo-claude
  - Playwright MCP server — https://github.com/microsoft/playwright-mcp
  - gws, the Workspace command line — https://github.com/googleworkspace/cli
  - Semrush, the one paid tool here — https://www.semrush.com/
  - The skills directory and its CLI — https://skills.sh/
  - This repository and its plugin — https://github.com/Smolevich/pet-project-atlas
---

## What we are solving

I do not ship audit tooling with this atlas and I am not going to. The good tools already exist, and my own rewrite of one of them would be a worse copy that nobody maintains, me included.

What I did not have was the map: which tool answers which question, and in what order to run them. Plus which of them I can skip once the symptom already says where to look.

Every third-party row below is a package sitting on my own machine, apart from one paid service. The licence column I read off the source repository, and for that service off what the money actually buys.

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
| Semrush | Domain Overview over Google data: positions, backlinks, an authority score, an AI Search panel | You want positions and links for a domain you cannot measure from the inside | Hosted service, `semrush.com` | Paid subscription, not a skill |
| `/atlas:start` | Walks a project through the route, calling the audit skills at the right points | You have a live URL and no idea which problem to fix first | This repo, `plugin/` | MIT |
| `/atlas:content-plan` | Turns a project description and a query export into clusters, one page each | You need to know what to write, and in which order | This repo, `plugin/` | MIT |
| `/atlas:report` | A weekly slice of Search Console and Analytics: what moved, what to do | The weekly snapshot, once the property is verified and a token exists | This repo, `plugin/` | MIT |
| `/atlas:voice` | Brings a draft in line with `STYLE.md` before the linter sees it | Before opening a pull request against this repository | This repo, `plugin/` | MIT |

### Where these skills come from, and where their licence lives

The skills CLI takes an owner and a repo name, so installing the third-party ones is two lines:

```bash
npx skills add coreyhaines31/marketingskills
npx skills add zubair-trabzada/geo-seo-claude
```

The licence does not come down with them. An installed `SKILL.md` carries no licence line, no author and no repository name, so the only place the provenance survives is the lock file the installer wrote:

```bash
cat ~/.agents/.skill-lock.json
```

Take the repository name out of there and go and read the licence in the repository itself.

### Which of them to run first when nothing is in the index

`seo-audit`. It walks fetch, block and canonical in one pass, which is faster than checking seven things by hand and considerably louder when one of them is broken.

On the GEO side the order matters more than the choice: `geo-crawlers` before `geo-citability`, every time. Access decides whether the writing gets read at all. Running them the other way round once bought me a cheerful citability report about a page no agent had fetched in weeks.

### What a composite score is actually good for

`geo-audit` for the baseline, a focused skill for the fix. A composite number moves when anything moves, so on its own it tells you very little. Run the same audit again after the work and read the delta, which is the part I actually look at.

### When a browser is the only way into a panel

Playwright MCP earns its place where there is no API at all: a panel behind a login, a console with no export button. Drive your own profile so the authenticated sessions are already there. A clean profile shows you a sign-in screen and nothing else.

### What gws covers, and what it does not

```bash
gws --help
```

The list it prints comes from your own installed build, so that list is the answer and not what a guide says. It covers Workspace. Search Console and Analytics are not in it, and the failure below is me finding that out the slow way.

### How the four /atlas: commands get installed

Two lines in Claude Code — add this repository as a marketplace, then install the plugin:

```text
/plugin marketplace add Smolevich/pet-project-atlas
/plugin install atlas
```

What those four commands do is route and order. The auditing stays with the third-party skills above, and that is deliberate: a wrapper that decides when to run something is much cheaper to keep alive than a second audit engine.

## What did not work

- **Reaching for `gws` to pull Search Console numbers**. Its help offers an `<api>:<version>` form for unlisted APIs. I tried `searchconsole:v1` and `analyticsdata:v1beta`, and both came back as unknown services. Those numbers come out of their own APIs, or out of the console by hand.
- **Looking for the licence inside the installed skill**. The folders under `~/.claude/skills/` hold a `SKILL.md` and its scripts. No licence, no author, no repository name, so I gave up on the folders and opened the lock file instead.
- **Treating an audit score as the work**. A composite number moves when anything moves. What actually changed my behaviour was one line of a report: the agent that got a 403, the passage nobody could quote.
- **Running citability checks while the crawler was blocked**. The report scored my prose happily. No agent had read the page in weeks, so I was grading a document nobody had fetched.
- **Driving a clean browser profile for panels behind a login**. Every run started at a sign-in screen. The profile with the live session is the only one that reaches the panel.
- **Believing this list is stable**. Third-party skills change owners, licences and behaviour between updates. Check the repository on the day you install, and again before you copy anything out of it into your own project.

## Verify

- `cat ~/.agents/.skill-lock.json` and read the `sourceUrl` for each skill you installed. That is the repository whose licence applies to you.
- Open that repository and read its `LICENSE` file. If there is none, the terms are unknown, and unknown means do not redistribute.
- Run `gws --help` and find your service in the printed list. An absent service is absent, whatever a guide says.
- Run `seo-audit` against a page you already repaired. If the report still flags it, the fix did not reach production.
- Run `geo-crawlers` from a network that is not yours, because an access map built from inside your own network hides the edge rules.

What the paid row does and does not measure is its own page: [what a paid rank tracker measures](/tools/paid-tools/).

The routing question — which of these to run for the symptom you actually have — is the [Tools index](/tools/).

---
title: What to run and when
sidebar:
  order: 1
description: The audit skills, the browser driver and the CLI this atlas points at — what each one does, when it earns the time, where it came from and under what licence.
updated: 2026-08-18
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

I do not ship audit tooling with this atlas, and I am not going to. The good tools already exist, and my own rewrite of one would be a worse copy that nobody maintains, me included.

What I did not have was the map. Which tool answers which question, in what order, and what to skip once the symptom says where to look.

That map is the `/atlas:` commands at the bottom of the table, and none of them is an audit. `/atlas:start` calls the third-party audits and orders their findings along the route. The rest do what no audit covers: a content plan, a weekly slice of numbers, a draft read against the style guide.

Every third-party row below is a package sitting on my own machine. The one exception is a paid service: I read the licence column off the source repository, and for that service off what the money actually buys.

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
npx skills add -g coreyhaines31/marketingskills
npx skills add -g zubair-trabzada/geo-seo-claude
```

The `-g` flag is not optional. Without it the skill lands in the current project, and one directory over it is gone. The package itself sits in `~/.agents/skills/` with a symlink in `~/.claude/skills/`, so look in both.

The licence does not come down with them. An installed `SKILL.md` carries no licence line, no author and no repository name, and provenance survives in one place only — the lock file the installer wrote:

```bash
cat ~/.agents/.skill-lock.json
```

Take the repository name out of there. Then go and read the licence in the repository itself.

### Which of them to run first when nothing is in the index

`seo-audit`. It walks fetch, block and canonical in one pass, which is faster than checking seven things by hand, and much louder when one of them is broken.

On the GEO side the order matters more than the choice. Run `geo-crawlers` before `geo-citability`, every time. Access decides whether the writing gets read at all.

I once ran them the other way round, and I got a cheerful citability report about a page no agent had fetched in weeks.

### What a composite score is actually good for

`geo-audit` for the baseline, a focused skill for the fix: a composite number moves when anything moves, so on its own it tells you little.

Run the same audit again after the work and read the difference, because that difference is the part I actually look at.

### When a browser is the only way into a panel

Playwright MCP earns its place where there is no API at all: a panel behind a login, a console with no export button.

Drive your own profile, so the authenticated sessions are already there — a clean profile shows you a sign-in screen and nothing else.

### What gws covers, and what it does not

```bash
gws --help
```

The list it prints comes from your own installed build, and that list is the answer, not what a guide says. It covers Workspace.

Search Console and Analytics are not in it. The failure below is me finding that out the slow way.

### How the four /atlas: commands get installed

Two lines in Claude Code — add this repository as a marketplace, then install the plugin:

```text
/plugin marketplace add Smolevich/pet-project-atlas
/plugin install atlas
```

The auditing stays with the third-party skills above, and that is deliberate. `/atlas:start` checks nothing itself: it decides which third-party skill to run and in what order to read what they return.

`/atlas:report` takes one of two routes into Search Console, and says which before it pulls anything.

The cheap one is the browser you are already logged into: Playwright MCP opens the Performance report in your own profile, with no Cloud project and no token. The other is the REST API, which costs a project with the API enabled, a token scoped to `webmasters.readonly` and a quota project. Without the last one Search Console answers 403.

Take the browser for a report you run by hand on a Monday. Take the API when it has to run unattended.

The other three do their own work, but none of it is auditing: `/atlas:content-plan` builds clusters, `/atlas:report` calls the Search Console API, `/atlas:voice` reads a draft against `STYLE.md`. That is cheaper to keep alive than a second audit engine.

## What did not work

- **Reaching for `gws` to pull Search Console numbers**. Its help offers an `<api>:<version>` form for unlisted APIs. I tried `searchconsole:v1` and `analyticsdata:v1beta`; both came back as unknown services. Those numbers come out of their own APIs, or the console by hand.
- **Looking for the licence inside the installed skill**. The licence column above had to be filled from somewhere, so I went digging through the installed folders. They hold a `SKILL.md` and scripts: no licence, no author, no repository name. The terms live in the source repository, whose name survives only in the lock file.
- **Treating an audit score as the work**. A composite number moves when anything moves. What actually changed my behaviour was one line of a report. The agent that got a 403. The passage nobody could quote.
- **Running citability checks while the crawler was blocked**. The report scored my prose happily. No agent had read the page in weeks. I was grading a document nobody had fetched.
- **Driving a clean browser profile for panels behind a login**. Every run started at a sign-in screen. The profile with the live session is the only one that reaches the panel.
- **Believing this list is stable**. Third-party skills change owners, licences and behaviour between updates. Check the repository on the day you install, and again before you copy anything out of it.

## Verify

- `cat ~/.agents/.skill-lock.json` and read the `sourceUrl` for each skill you installed. That is the repository whose licence applies to you.
- Open that repository and read its `LICENSE` file. If there is none, the terms are unknown. Unknown means do not redistribute.
- Run `gws --help` and find your service in the printed list. An absent service is absent, whatever a guide says.
- Run `seo-audit` against a page you already repaired. If the report still flags it, the fix did not reach production.
- Run `geo-crawlers` from a network that is not yours. An access map built from inside your own network hides the edge rules.

What the paid row does and does not measure is its own page: [what a paid rank tracker measures](/tools/paid-tools/).

Which of these to run for the symptom you actually have is the [Tools index](/tools/).

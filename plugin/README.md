# LaVioLab Atlas

![LaVioLab Atlas](assets/icon.png)

LaVioLab Atlas helps you get a side project found. It routes a live site through search, AI search,
content and analytics, and every result links to the page of the [Pet Project Atlas](https://atlas.smolevich.com)
that explains why it matters. It is made by Stanislav Shupilkin at LaVioLab and is open source under the
MIT licence.

## Install

```text
/plugin install laviolab-atlas --marketplace Smolevich/pet-project-atlas
```

In Codex:

```text
codex plugin marketplace add Smolevich/pet-project-atlas
codex plugin add laviolab-atlas@pet-project-atlas
```

## Commands

| Command | What it does |
|---|---|
| `/laviolab-atlas:start` | Asks for your site URL and audience language, runs the third-party `seo-audit` and `geo-audit` skills, merges their findings into one list ordered by what blocks what, and names three things to do this week. |
| `/laviolab-atlas:content-plan` | Turns a project description and an optional Search Console export into query clusters, one page per cluster, queued by money. |
| `/laviolab-atlas:report` | The weekly slice: six numbers from Search Console and your own product data, the delta against the previous period, three conclusions and one action. |

## What it runs and where it connects

The plugin contains instructions (skills) and one remote, read-only MCP server. It ships no scripts,
no binaries and no hooks. The skills run on your machine, in your Claude Code session, and only when you
run a command.

**MCP server** `laviolab-atlas` at `https://atlas.smolevich.com/mcp` (Streamable HTTP, no login). Its
four tools only read the published atlas: `search_playbook` returns matching sections with a short
quote and a link, `get_page` returns one page in full, `list_sections` lists the route, and
`checklist` returns the checklist items for a topic such as robots.txt or llms.txt. It receives the
words of your question and nothing else from your session, and it never reads your site.

The skills pre-approve only `Read` in `allowed-tools`. Everything else they use (calling the audit
skills in `start`, fetching a public page in `content-plan`, writing a file in `content-plan` and
`report`) goes through Claude Code's usual permission prompt, so you approve each one.

- **`start`** looks for `seo-audit` and `geo-audit` among your skills, reading their `SKILL.md` in
  `~/.agents/skills/`, `~/.claude/skills/` and `./.claude/skills/`, and runs them on the URL you give it.
  **It never installs anything.** If an audit is missing, it prints the `npx skills add -g …` line and
  stops; you decide whether to install third-party code. Those audits are maintained by other people
  (`coreyhaines31/marketingskills`, `zubair-trabzada/geo-seo-claude`) and are not part of this plugin.
- **`content-plan`** reads files you hand it, such as a query export, and may fetch public pages you
  name. It writes the plan as a markdown file in your project, so you can commit it next to the pages.
- **`report`** works only from files you download and hand it: the Search Console Performance export
  with a comparison, the Page indexing totals for submitted pages, and your product's own export. It
  does not connect to Google, does not drive a browser and never asks for a token or a password. It
  appends the weekly block to a history file you name.

## Data and privacy

LaVioLab Atlas collects nothing. It has no telemetry and no analytics. The MCP server gets only the
arguments of a tool call, such as the words of a search, answers from the published atlas and stores
nothing; the web server in front of it keeps the usual access log (address, time, path, never the
request body). The rest of the network traffic is what is listed above: the sites you ask it to check. Full note:
<https://atlas.smolevich.com/privacy/>. Terms of use:
<https://atlas.smolevich.com/terms/>.

## Support

Issues and questions: <https://github.com/Smolevich/pet-project-atlas/issues>.

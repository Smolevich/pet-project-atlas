# The plugin

`plugin/` is **LaVioLab Atlas** (`laviolab-atlas`) and ships three commands to a reader's Claude Code:
`/laviolab-atlas:start`, `/laviolab-atlas:content-plan`, `/laviolab-atlas:report`.

`/voice` is not in the plugin. It only works inside this repository, so it is a project
skill in `.claude/skills/voice/` and anyone who clones the repo gets it as `/voice`.

They install as a plugin marketplace:

```text
/plugin install laviolab-atlas --marketplace Smolevich/pet-project-atlas
```

## The rule the skills exist under

**No audit engine of our own.** `seo-audit` and the `geo-*` skills are written and
maintained by other people; a second copy here would be a worse copy nobody maintains.
`/laviolab-atlas:start` calls them and orders their findings along the route. The other two do
work no audit covers: a content plan and a weekly slice of numbers.

A skill never restates a page's argument. It runs something and links back to the page
that explains why it matters.

## What breaks quietly

- **The command name.** It is `/<plugin name>:<skill folder>`. The folder, the `name:` in
  frontmatter and `plugin.json` all have to agree, or the command a page promises does not
  exist.
- **Where third-party skills are installed.** The installer keeps packages in
  `~/.agents/skills/` and symlinks them into the agent directory, and it installs into the
  current project unless told `-g`. A skill that checks one path will call an installed
  audit missing.
- **Links into the atlas.** A skill pointing at a page that has been renamed sends the
  reader to a 404 at the moment they needed the explanation.

All three are covered by `scripts/check-plugin.test.mjs`, which runs in `npm test`.

## What third-party skills do behind your back

`npm run check:skills` compares the tools table against the source repositories on GitHub: the
repo still exists and is not archived, the licence matches the column, and the folder each skill
lives in has not been renamed. It runs weekly in the Security workflow, because that is how this
class of breakage arrives — quietly, between two of your commits.

## Behaviour

Structure is tested; behaviour is not, and the two fail differently. Three cases sit under
`plugin/evals/`, each one written from a failure that already happened: `/laviolab-atlas:start`
inventing its own checks when the audits are missing, ordering findings by score instead of by
rung, and `/laviolab-atlas:report` demanding a Cloud project and a token for numbers the author
could export in a minute.

They need `claude plugin eval`, which is early access and rolled out per organization. Where the
rollout has not arrived, `CLAUDE_CODE_WALNUT_SPIRE=1` turns it on. See
[plugin/evals/README.md](../plugin/evals/README.md).

## The ChatGPT build

ChatGPT gets the same three skills and the MCP server as a ZIP for the OpenAI plugin portal (**With MCP**). It is
built, never edited by hand:

```bash
npm run build:chatgpt   # → dist-chatgpt/laviolab-atlas-<version>.zip
```

CI builds it on every run and keeps it as the `laviolab-atlas-chatgpt` artifact.

`plugin/` stays the only source. `chatgpt/` holds what differs:

- `chatgpt/manifest.json` — the listing (`extensions.com.openai`): name on the card, subtitle,
  description, category, starter prompts, the Russian translation. Name, version and description
  come from `plugin/.claude-plugin/plugin.json`, so bump the version there.
- `chatgpt/skills/<skill>/overrides.md` — sections of a `SKILL.md` that cannot work in ChatGPT,
  each under `<!-- replace: ## Heading -->`. An empty block drops the section; `preamble` and
  `description` stand for the text before the first H2 and the frontmatter description.

What ChatGPT cannot do, and so what the overrides replace: read the user's home directory or write
a file on their machine. `start` asks for the two audit reports instead of looking for installed
audits; `report` hands back the weekly block as markdown instead of appending it to a file.

`report` reads Search Console exports in both builds and never asks for a token. Since 0.3.1 the skills
pre-approve only `Read` in `allowed-tools`: the Claude directory accepts entries beyond Read, Grep,
Glob and LS only from Verified organizations, and 0.3.0 was refused for `Skill`, `Write` and
`WebFetch`. The OpenAI plugin guidelines forbid collecting credentials.

**Where it is listed.** Version 0.3.0 is published in the public ChatGPT plugin directory (OpenAI
dashboard, 2026-11-14): https://chatgpt.com/plugins/plugin_asdk_app_6ae7ba73a20c819194ad481a9bf41597.
The repo is at 0.3.1. The directory serves only what was submitted, so **a new version means a new
ZIP submitted through the portal**; merging to `main` changes nothing in ChatGPT. The Claude directory
has not published the plugin: 0.3.0 was refused there (see above).

**Renaming a heading in `SKILL.md` breaks the build** when an override points at it. That is on
purpose: otherwise ChatGPT would quietly keep the old text. Fix the override in the same change.

## The Codex marketplace

Codex installs the plugin straight from this repository:

```text
codex plugin marketplace add Smolevich/pet-project-atlas
codex plugin add laviolab-atlas@pet-project-atlas
```

Codex reads `.agents/plugins/marketplace.json`, which points at `plugin/`, and the portable manifest
`plugin/plugin.json`. Codex runs locally, so it gets the Claude Code skills unchanged, not the
ChatGPT overrides. The manifest is generated from the same two sources as the ZIP:

```bash
npm run build:codex     # → plugin/plugin.json
```

`npm test` fails when it has drifted. The icon sits in `plugin/assets/`, where the portable format
expects listing assets, and both the manifest and the ZIP point at it.

## The MCP server

`mcp/` is a read-only MCP server at `https://atlas.smolevich.com/mcp` that both plugins connect to:
`plugin/.mcp.json` for Claude Code (`type: http`), `plugin/mcp.json` for Codex and the ChatGPT ZIP
(`type: streamable-http`). Same URL in both; a test holds them together.

Four tools, all `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: false`:
`search_playbook`, `get_page`, `list_sections`, `checklist`. No login: there is no user data behind
them, only the published pages.

- **The index is built, not written.** `npm run build:mcp` reads `src/content/docs`, strips MDX and
  writes `dist-mcp/index.json` next to the server files. A page appears in search the moment it is
  merged. Only translated Russian pages are indexed, because the index reads sources, not the
  fallback routes Starlight generates.
- **No runtime dependencies.** The server is `node:http` and the two pure modules in `mcp/lib/`;
  `content.mjs` (YAML, slugs) runs only at build time. The host needs `node` and nothing from npm.
- **Stateless Streamable HTTP.** POST only, JSON responses, no sessions and no SSE: the server has
  nothing to push. GET is 405 by the spec's own allowance.
- **Section anchors** come from `github-slugger`, the same one Starlight uses, so a link from
  `search_playbook` lands on the heading it quoted.

```bash
npm run build:mcp
ATLAS_MCP_INDEX=dist-mcp/index.json node mcp/server.mjs   # 127.0.0.1:8770/mcp
```

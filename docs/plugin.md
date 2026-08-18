# The plugin

`plugin/` ships four commands to a reader's Claude Code:
`/atlas:start`, `/atlas:content-plan`, `/atlas:report`, `/atlas:voice`.

They install as a plugin marketplace:

```text
/plugin marketplace add Smolevich/pet-project-atlas
/plugin install atlas
```

## The rule the skills exist under

**No audit engine of our own.** `seo-audit` and the `geo-*` skills are written and
maintained by other people; a second copy here would be a worse copy nobody maintains.
`/atlas:start` calls them and orders their findings along the route. The other three do
work no audit covers: a content plan, a weekly slice of numbers, a draft read against
`STYLE.md`.

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

## What is not tested

Structure is tested; behaviour is not. Nothing checks that `/atlas:start` actually stops
when an audit is missing, or that it stops instead of inventing its own checks.

`claude plugin eval` is the tool for that — cases under `evals/`, graders, a no-plugin
baseline arm — but it is in early access and not enabled on this account, so there are no
cases yet. Until then, behaviour is verified by running the command by hand and reading
what it did.

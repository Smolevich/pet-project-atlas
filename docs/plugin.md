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
rung, and `/laviolab-atlas:report` demanding a Cloud project when a logged-in browser was right
there.

They need `claude plugin eval`, which is early access and rolled out per organization. Where the
rollout has not arrived, `CLAUDE_CODE_WALNUT_SPIRE=1` turns it on. See
[plugin/evals/README.md](../plugin/evals/README.md).

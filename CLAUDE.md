# Pet Project Atlas — notes for agents

Public reference site (Astro + Starlight): how to get a side project found — demand,
indexing, AI search, content, distribution, analytics, money. Live at
https://atlas.smolevich.com, deployed from `main` by CI. The site is public on purpose:
no Cloudflare Access in front of it.

Two things live here and they are not the same job. **Content** is what the site publishes
(`src/content/docs/**`). **The plugin** is what a reader's Claude Code runs
(`plugin/skills/*/SKILL.md`). A page explains; a skill runs a check and points back at the
page. If a human reads it, it is a page. If it returns a result, it is a skill.

Specifics live in `docs/`. Read the file when its topic comes up, not up front.

| Topic | File | One line |
|---|---|---|
| Writing content | [docs/content.md](docs/content.md) | four H2s in order, numbers need sources, both languages move together |
| The plugin | [docs/plugin.md](docs/plugin.md) | no audit engine of our own; command names and install paths break quietly |
| Checks before a commit | [docs/checks.md](docs/checks.md) | five commands, all must pass, `check:links` only after `build` |
| Commit messages | [docs/commits.md](docs/commits.md) | English, one line, imperative, prefixed by area |
| Deploy | [DEPLOY.md](DEPLOY.md) | CI only; build and deploy are separate jobs on purpose |
| Voice rules in full | [STYLE.md](STYLE.md) | what the linter enforces and why |
| Contributions | [CONTRIBUTING.md](CONTRIBUTING.md) | workflow and editorial policy for outside pull requests |

## Not negotiable

- **No manual deploy.** Never build locally and copy to the host. Push to `main` and let
  the workflow do it.
- **Nothing about the host in this repo.** Not the provider, not what else runs on it. The
  origin sits behind a tunnel, and a public repo is the wrong place to narrow the search.
- **No secrets in the tree**, including in example configs and drafts.
- **The checks pass before the commit**, not after the push.

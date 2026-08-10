# Pet Project Atlas — notes for agents

Public reference site (Astro + Starlight): how to get a side project found — indexing, AI
search, content, distribution, analytics, money. Live at https://atlas.smolevich.com.
No Cloudflare Access on this host — the site is public on purpose.

## Content vs. plugin

- **Content** (what the site publishes): `src/content/docs/**`, plain Markdown/MDX.
  English is canonical; Russian lives under `ru/` and falls back to English where missing.
- **Plugin** (what a reader's Claude Code runs): `plugin/skills/*/SKILL.md` — thin
  wrappers that call the audit skills at the right point in the route and format the
  output. A skill does not restate the atlas's argument; it runs a check and points back
  at the page that explains why the check matters. If you're writing something a human
  reads on the site, it's a page under `src/content/docs/`. If you're writing something
  that runs a command and returns a result, it's a skill under `plugin/skills/`.

## Page shape

Every content page carries four H2s in order: `## What we are solving`, `## Steps`,
`## What did not work`, `## Verify` (Russian: `## Что решаем`, `## Шаги`,
`## Что не сработало`, `## Проверить`). `scripts/lint-voice.mjs` enforces this and the
rest of the voice rules in CI. Full rules: [STYLE.md](STYLE.md). Contribution workflow
and editorial policy: [CONTRIBUTING.md](CONTRIBUTING.md).

## Before committing

```bash
npm test && npm run lint:voice && npm run build && npm run check:links
```

All four must pass. `check:links` runs against the built `dist/`, so it only means
anything after `build`.

## Deploy

Production deploys go through CI only (`.github/workflows/deploy.yml`, triggered by push
to `main`) — never a manual build/scp/ssh to the box. See [DEPLOY.md](DEPLOY.md) for the
mechanics and one-time setup.

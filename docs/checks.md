# Checks before a commit

```bash
npm test && npm run lint:voice && npm run check:types && npm run build && npm run check:links
```

All of them must pass. Two of them are easy to run in the wrong order:

- `check:links` walks the built `dist/`, so it means nothing until `build` has run in the
  same session.
- `lint:voice` fails the build on errors and only reports warnings. A warning is still a
  sentence someone has to read — fix it in the same commit or say why not.

What each one guards:

| Command | Catches |
|---|---|
| `npm test` | voice rules and plugin structure: manifests, skill names, commands the pages promise |
| `npm run lint:voice` | page shape, ban list, numbers without a source, sentences that ran away |
| `npm run check:types` | Astro and content-collection types |
| `npm run build` | mermaid rendering, MDX that does not compile, broken frontmatter |
| `npm run check:links` | internal links and anchors against the built site |

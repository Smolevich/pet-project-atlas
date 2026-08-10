# Pet Project Atlas

You shipped a side project and nobody found it. This is the map out of that: getting indexed, getting cited by AI search, writing content, picking channels, reading the numbers, taking money.

Every page is written from a real log — what was run, what broke, what came out of it. Numbers carry a date and a source, and CI fails the build when they do not.

Live site: **[atlas.smolevich.com](https://atlas.smolevich.com)**

## What is inside

Six sections, in the order the problems actually arrive:

1. **Indexing** — making the crawler see your pages, and getting them into the index.
2. **AI search** — being found and cited by ChatGPT, Perplexity, Google AI Overviews.
3. **Content** — what to write while nobody is searching for your product by name.
4. **Distribution** — where the first external links come from, and search inside a platform rather than Google.
5. **Analytics** — the handful of numbers worth watching, and how to tie a signup to a source.
6. **Money** — what one user costs when the product calls an AI, and how many payers close the month.

Three more sections hold them together. **Start here** is the route from zero to first traffic. **Tools** says which skill to run for which symptom. **Cases** will hold full write-ups, mine and guests'. Until the first one lands it states the bar a case has to clear, and how to send yours.

## Every page has the same four blocks

```markdown
## What we are solving
## Steps
## What did not work
## Verify
```

"What did not work" is never empty. The dead ends are half the value, so a page without them does not merge. English is the canonical version, Russian lives under `ru/` and falls back to English where it is missing.

## Claude Code plugin

The repo also ships a thin Claude Code plugin, so the atlas answers from inside your editor:

```
/plugin marketplace add Smolevich/pet-project-atlas
/plugin install atlas
```

That gives you four commands. `/atlas:start` walks a live URL through the route and calls the audit skills at the right points. `/atlas:content-plan` turns a project description and a query export into clusters. `/atlas:report` cuts a weekly slice of Search Console and Analytics. `/atlas:voice` brings a draft in line with `STYLE.md` before the linter sees it.

The skills live in [`plugin/`](plugin/). [Tools](https://atlas.smolevich.com/tools/skills/) says which one to run for which symptom.

## Run the site locally

```bash
npm install
npm run dev
```

The site is Astro + Starlight. Content is plain Markdown under `src/content/docs/`.

## Contributing

Data, catalog entries, translations and corrections are the fastest way in. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [STYLE.md](STYLE.md) for the voice.

Before opening a pull request:

```bash
npm test && npm run lint:voice && npm run build
```

No experience to write from? Open an issue instead — [what did not help](https://github.com/Smolevich/pet-project-atlas/issues/new?template=page-did-not-help.yml), [a topic that is missing](https://github.com/Smolevich/pet-project-atlas/issues/new?template=suggest-topic.yml), [your own case](https://github.com/Smolevich/pet-project-atlas/issues/new?template=share-case.yml).

## License

Two licenses, split by directory. Code is [MIT](LICENSE). Content under `src/content/docs/**` is [CC BY 4.0](LICENSE-CONTENT) — copy it, translate it, republish it, and link back to https://atlas.smolevich.com.

Maintained by Stanislav Shupilkin ([@Smolevich](https://github.com/Smolevich), smolevich90@gmail.com).

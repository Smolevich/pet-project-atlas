# Writing content

Pages live in `src/content/docs/**` as Markdown/MDX. English is canonical; Russian lives
under `ru/` and falls back to English where a page is missing.

## Page shape

Every page carries four H2s, in this order:

| English | Russian |
|---|---|
| `## What we are solving` | `## Что решаем` |
| `## Steps` | `## Шаги` |
| `## What did not work` | `## Что не сработало` |
| `## Verify` | `## Проверить` |

`## What did not work` is not decoration. A page without it reads like a tutorial written
by someone who never ran the thing.

## The linter is the voice

`scripts/lint-voice.mjs` runs in CI and enforces the shape above plus the rules in
[STYLE.md](../STYLE.md): the ban list, sentence length, the density of `X, not Y`
constructions, and numbers.

Numbers are the strict one. Any figure on a page needs a `sources:` entry in the
frontmatter — a URL, or a provenance string like `Tool, scope identifier, measured
YYYY-MM-DD`. A page with numbers also needs `updated:`. Cannot source it, do not print it.

## Both languages move together

A fix to an English page that leaves the Russian twin wrong is half a fix, and the half
that stays wrong is the one nobody rereads. Same for the other direction.

## The reader is not a colleague

They do not share your staging environment, your job or your vocabulary. Words like
"классика" assume a shared past; "стенд" assumes a company. Say what the thing is, then
what to do about it.

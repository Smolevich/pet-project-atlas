---
name: voice
description: Bring a page in this repository to the atlas voice, or check a page before opening a PR. Use when the user says "bring this page to the atlas voice", "check a page before opening a PR", "прогони страницу через голос", "почини стиль страницы", or when the voice linter fails in CI.
user-invocable: true
allowed-tools:
  - Read
  - Edit
  - Bash(node scripts/lint-voice.mjs *)
  - Bash(npm run lint:voice *)
  - Bash(git diff *)
  - Bash(git status *)
---

# /atlas:voice

Run the repository's own linter against a page, then fix what it reports against `STYLE.md`.

The rules live in `STYLE.md` at the repository root. Read it. Do not restate its rules here or in your
answer — quote the section the linter names and fix against that section.

## Before you touch anything

1. Confirm you are inside the `pet-project-atlas` repository. `scripts/lint-voice.mjs` and `STYLE.md`
   both have to exist. If they do not, stop and say so — this skill only works here.
2. Read the target page's frontmatter. **`voice: guest` means stop.** A guest case keeps its author's
   voice: the ban list, the page shape and the length rules do not apply to it. Report that the page is
   a guest case and change nothing in its prose.
   The number rule still applies to guest pages, so an unsourced-number error on a guest page is a real
   error — fix that one by adding a source or deleting the number, and nothing else.

## Run the linter

The script takes either a directory or a single file. Point it straight at the page you are fixing:

```bash
node scripts/lint-voice.mjs src/content/docs/<section>/<page>.md
```

For the whole repository, use the package script:

```bash
npm run lint:voice
```

Output shape, one finding per line:

```
<file>:<line>: <what broke>. <what to do>. (STYLE.md §N Section)
```

Errors exit non-zero and fail the build. Warnings keep the build green.

## Fix each finding

Work one finding at a time, in the order the linter printed them. For each one open the section of
`STYLE.md` named in the parentheses and fix against it.

- **§3 Ban list** — a banned word is a symptom of a sentence with no claim in it. Replace the sentence
  with a concrete claim from the author's own log. A synonym from the thesaurus is not a fix.
- **§2 Page shape** — the four required H2 headings are matched literally, at level two, before any
  other H2. A heading with nothing under it counts as missing.
- **§4 Numbers** — either add the date to `updated:` and the source to `sources:`, or delete the number.
  A URL goes in as `Title — https://…`, and the title says why that link is there. Never soften a
  number into words. If you cannot find the source, the number goes.
- **§5 Length** — a warning, not an error. Split the sentence. If a page throws many of these, say so:
  it usually needs cutting, not exceptions.

You may not invent a fact to satisfy a rule. If a fix needs a number, a source or a failure the author
has not given you, ask for it. An unanswered question is a better outcome than a fabricated sentence.

## Finish

1. Re-run the linter on the same path. The page's rows must be gone.
2. Show the diff:

   ```bash
   git diff -- <path>
   ```

3. **Do not commit.** Show the diff, name each change and the rule behind it, and wait for the author
   to confirm. Commit only after they say so.

---
title: What a page that ranks and gets cited is made of
description: The answer in the first three sentences, executable steps, a failures block, an FAQ people actually asked, and a linter that keeps the shape.
updated: 2026-08-12
sources:
  - https://developers.google.com/search/blog/2023/08/howto-faq-changes
  - https://developers.google.com/search/docs/appearance/structured-data/faqpage
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content
---

## What we are solving

The plan says which page to write. What goes inside it is a separate question.

The page has two jobs now. It has to win a slot in a list of ten. It also has to survive being quoted out of context by a model.

One shape does both: the answer first, then the procedure, then the failures, then the questions.

## Steps

1. **Title the page with the reader's question** — the URL carries the primary query, not the internal name.
2. **Answer in the first three sentences** — the symptom, the answer, the condition under which it holds.
   That block is what a reader uses to decide whether to continue. It is also the passage a model lifts.
3. **Make every step executable** — one command, one click, or one file.
   "Optimise your content" is not a step. If you cannot run it, cut it or split it into things you can run.
4. **Write the block nobody else can copy** — what you tried that failed, and what it cost.
   Competitors copy each other's steps freely. Nobody copies your dead ends, because they do not have them.
5. **Add an FAQ only for questions you were actually asked** — from support, from the query list, from comments.
   Google stopped showing the FAQ rich result on 7 May 2026 and removed the documentation in June 2026. The markup gives nobody a rich result now.
   The block still earns its place. A short question with a short self-contained answer is the shape an assistant extracts.
6. **Write anchors that name the destination** — the previous page in the route, the next one, the tool.
   "Read more" tells nobody anything. Put the destination's promise into the anchor text.
7. **End with a way to check** — a command, a report, a query to run.
   A page without a verification block ends in an opinion. The reader cannot tell whether it worked.
8. **Turn the shape into a check a machine runs** — a linter, in CI, that fails the build.
   A style document is read once and forgotten by the third contributor. A rule that fails the build survives them.

## What did not work

- **The three-paragraph run-up**. Context, then background, then the point. Readers left before the point, and the only extractable passage was an intro that asserted nothing.
- **A style guide with nothing enforcing it**. The rules were written down and agreed by everyone. Pages drifted anyway, because nothing objected at the moment of writing.
- **Making every rule an error**. Sentence length as a hard failure blocks a legitimate page over one comma. Here the ban list, the four required blocks and unsourced numbers fail the build. Length only warns.
- **Matching headings loosely**. "What didn't work" and "What did not work" read the same to a human. A check sees two different strings, so the linter matches the heading text literally.
- **Allowing an empty required block**. A heading with nothing under it passed the first version of the check. An empty block now counts as missing.
- **Writing an FAQ for the markup**. Questions nobody asked, answered by repeating the paragraph above them. Schema does not make an empty answer worth quoting.
- **Publishing a restriction as the current state**. This page said FAQPage was limited to government and health sites, which was true from 2023. Google retired the rich result outright in May 2026, and the sentence had simply stopped being checked.
- **Softening a number instead of sourcing it**. "Roughly a couple of thousand visits" looks like data and is not. A number ships with a date and a source, or it does not ship.

## Verify

This repository enforces its own template. That is the cheapest worked example of the last step I can point at.

```bash
npm run lint:voice
```

The script walks every page under `src/content/docs` and reports, per file and per line:

- a banned phrase, with the rule it broke;
- a required block that is missing or empty;
- a number in prose while `sources:` is empty;
- a sentence over the length threshold, as a warning that keeps the build green.

Two exemptions let the check survive contact with contributors. An index page that declares none of the four blocks is navigation, so the check skips it. Declare one block and all four become required. Guest cases keep the author's voice, so the voice checks skip them.

The number rule still applies to guest pages. Facts are checked the same way for everyone.

Then read the page by hand, because a linter cannot.

- Read only the first three sentences. If they do not answer the title, the page is not finished.
- Paste one middle paragraph into an empty note. If you cannot tell what it is about, a model cannot either.
- Ask whether your failures block would be true for anybody else. If it would, it is generic and not yet written.

Access and recognition decide whether an assistant reads this at all: [why AI answers cite someone else](/geo/citable-pages/).

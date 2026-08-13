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

The plan says which page to write. What goes inside it is a separate question, and it has two answers to satisfy at once. The page has to win a slot in a list of ten. It also has to survive being quoted out of context by a model that will not carry your setup along with the quote.

One shape does both. The answer first, then the procedure, then the failures, then the questions.

## Steps

### The title and the first three sentences

Title the page with the reader's question and put the primary query in the URL, not your internal name for the feature.

Then answer in the first three sentences: the symptom, the answer, and the condition under which the answer holds. A reader uses that block to decide whether to keep going, and it is also the passage a model lifts, so those two jobs turn out to be the same job.

### Steps somebody can actually run

One command, one click, or one file. "Optimise your content" is not a step — if you cannot run it, either cut it or split it into the things you can run.

Where a command exists, print the command. Describing a check in words, when the check is one line of shell, costs the reader the ten minutes it takes to reconstruct it.

### The block nobody can copy off you

What you tried that failed, and what it cost. Competitors copy each other's steps freely, and none of them copies your dead ends, because they do not have them.

This is also the part of a page I trust when I am the reader. Anyone can restate a procedure; only the person who walked into the wall knows where it is.

### The FAQ, and what it is worth now

Add one only for questions you were actually asked — from support, from the query list, from comments.

Google stopped showing the FAQ rich result on 7 May 2026 and removed the documentation on 15 June 2026, so the markup gives nobody a rich result any more. The block still earns its place, because a short question with a short self-contained answer is exactly the shape an assistant extracts.

### Anchors, and the way out of the page

Name the destination in the anchor text: the previous page in the route, the next one, the tool. "Read more" tells nobody anything, and it is the phrase I still catch myself typing.

End with a way to check — a command, a report, a query to run. Without it the page ends in an opinion, and the reader has no way to tell whether any of it worked for them.

### Turning the shape into something a machine checks

A linter, in CI, that fails the build. A style document gets read once and forgotten by the third contributor, while a rule that fails the build outlives all of them.

## What did not work

- **The three-paragraph run-up**. Context, then background, then the point. Readers left before the point, and the only extractable passage was an intro that asserted nothing.
- **A style guide with nothing enforcing it**. The rules were written down and everyone agreed with them, and the pages drifted anyway, because nothing objected at the moment of writing.
- **Making every rule an error**. Sentence length as a hard failure blocks a legitimate page over one comma. Here the ban list, the four required blocks and unsourced numbers fail the build, and length only warns.
- **Matching headings loosely**. "What didn't work" and "What did not work" read the same to a human, and a check sees two different strings, so the linter matches the heading text literally.
- **Allowing an empty required block**. A heading with nothing under it passed the first version of the check, so an empty block now counts as missing.
- **Writing an FAQ for the markup**. Questions nobody asked, answered by repeating the paragraph above them. Schema did not make an empty answer worth quoting.
- **Publishing a restriction as the current state**. This page said FAQPage was limited to government and health sites, which had been true since 2023. Google retired the rich result outright in May 2026, and the sentence had simply stopped being checked.
- **Softening a number instead of sourcing it**. "Roughly a couple of thousand visits" looks like data and is not. A number ships with a date and a source, or it does not ship.

## Verify

This repository enforces its own template, which is the cheapest worked example of the last step I can point at.

```bash
npm run lint:voice
```

The script walks every page under `src/content/docs` and reports, per file and per line:

- a banned phrase, with the rule it broke;
- a required block that is missing or empty;
- a number in prose while `sources:` is empty;
- a sentence over the length threshold, as a warning that keeps the build green.

Two exemptions let the check survive contact with contributors. An index page that declares none of the four blocks is navigation, so the check skips it — declare one block and all four become required. Guest cases keep the author's voice, so the voice checks skip them, while the number rule still applies, because facts are checked the same way for everyone.

Then read the page by hand, because a linter cannot.

- Read only the first three sentences. If they do not answer the title, the page is not finished.
- Paste one middle paragraph into an empty note. If you cannot tell what it is about, a model cannot either.
- Ask whether your failures block would be true for anybody else. If it would, it is generic and you have not written it yet.

Access and recognition decide whether an assistant reads this at all: [why AI answers cite someone else](/geo/citable-pages/).

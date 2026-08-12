---
title: Why AI answers cite someone else
description: An answer names a few sources and yours is not one of them. How to write a page that survives being quoted out of context.
updated: 2026-08-12
sources:
  - https://arxiv.org/abs/2311.09735
  - https://schema.org/sameAs
  - https://developers.google.com/search/docs/appearance/structured-data/organization
  - https://developers.google.com/search/docs/appearance/structured-data/search-gallery
---

## What we are solving

You ask an assistant the question your product answers. It names a few sources, and none of them is you.

A search page has ten slots and a scroll. An answer has room for three or four sources, so the outcome is binary.

The paper that named this problem is *GEO: Generative Engine Optimization* (Aggarwal et al., 2023). It rewrote existing pages rather than adding new ones. The reported gain is up to 40% more visibility for a source inside the generated answer, measured over GEO-bench.

The same facts, arranged so a model can lift them, is the whole move.

## Steps

1. **Answer in the first paragraph** — the heading asks the question, the next two sentences answer it.
   The model reads your intro and decides whether there is anything to quote. Background before the answer reads as no answer.
2. **Make every paragraph survive extraction** — name the subject, avoid opening pronouns, keep it to a few sentences.
   Test it by pasting one paragraph into an empty note. If you cannot tell what it is about, a model cannot either.
3. **Put a hard fact in each passage** — a number, a date, a proper name, a version.
   "Many teams" cannot be quoted. A measured value with the date you measured it can.
4. **Replace vague quantifiers with figures** — "most", "often" and "significantly" carry no information.
   Where the figure does not exist yet, go and measure it, or drop the sentence.
5. **State one checkable thing nobody else has** — your own benchmark, your own price table, your own failure log.
   This is the whole difference between a source and a summary. A page that only restates the field gets outranked by whichever restatement is older.
6. **Structure so the document segments cleanly** — heading levels without gaps, a numbered list for a process.
   Use a table when three or more options are compared. Questions make good headings, because they match the phrasing of the query.
7. **Add JSON-LD in the head** — `Organization` or `Person` as the entity, `Article` with an author and a publication date.
   Add `sameAs` too, listing your profiles and listings. Its documented job is entity resolution for Google's Knowledge Graph. Google's own `Organization` reference is where that is written down.
   What it does for AI citation is unmeasured. I have found no vendor statement and no study showing an LLM pipeline reads the field. I have not measured it here either. It is ten minutes and a defensible bet, not a mechanism.
8. **Remember the model learned about you elsewhere** — directories, discussion threads, other people's comparisons.
   On-page work pays off after the model knows you exist as a thing. Recognition first, citation second.

## What did not work

- **Adding volume instead of a verifiable claim**. A longer page with more adjectives changed nothing. The answer kept citing the page that had the number, and that page was shorter than mine.
- **Assuming published pages would carry the product**. On my own projects the pages went up and the signups kept arriving from somewhere else. That share belongs in a case page, with a date next to it.
- **Keeping the conclusion for the end**. The essay shape buries the answer under the setup. The only extractable passage is then an intro that says nothing yet.
- **Writing FAQ blocks to fill the schema**. Questions nobody asks, answered by repeating the paragraph above them. Markup does not make an empty answer quotable.
- **Sprinkling microdata through the markup**. A template change broke it silently, and nothing warned me. JSON-LD in one block in the head survives redesigns.
- **Selling `sameAs` as the thing that merges mentions into one entity a model recognises**. That sentence stood on this page and in the route, and it has no evidence under it. The field's documented history is Google's Knowledge Graph. Whether a language model ever reads it, I do not know, and neither did the sentence.
- **Opening paragraphs with "It" and "However"**. Both words point at a sentence that will not travel with the quote.

## Verify

Run `geo-citability` from [Tools](/tools/). It scores passages and points at the ones that fall apart out of context. That is the check hardest to run on your own writing.

Then measure presence, not position:

- Ask your target question in a few assistants, several runs each. Answers are non-deterministic, so a single run is an anecdote.
- Record two things per run: whether you are named at all, and whether you are linked as a source. Those are different levels.
- Track the trend across runs and weeks. The delta is the signal; a snapshot is noise.
- Watch analytics for referrals from assistant hosts. That traffic is proof of citation, not of ranking.
- Validate the JSON-LD with a structured data test before you trust it.

If no agent shows up in your logs at all, the problem is access, not writing. Start from [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).

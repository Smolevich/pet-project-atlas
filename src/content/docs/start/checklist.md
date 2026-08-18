---
title: The checklist
description: Twenty-three items in the order that never wastes work, each one line with a link to the page that explains it.
updated: 2026-08-12
sources:
  - nginx access log, dataset 2026-07-19..2026-08-12, measured 2026-08-12
---

## What we are solving

Same route as [start here](/start/), with the reasons taken out. That page argues each step. This one is boxes to tick — for a screenshot, or a tab you keep open.

Work top to bottom. Nothing here is undone by anything below it. That is the only reason the order matters.

If a line makes you ask why, the answer is on the page it links to. I wrote the list from things I thought I had already done.

## Steps

- [ ] Collect the wordings people use, in their own words, from support and reviews — [words](/demand/how-people-search/)
- [ ] Check them in Yandex Wordstat and in Google, with operators applied. Read both suggest dropdowns. Without operators you get the category total, not demand for your wording — [words](/demand/how-people-search/)
- [ ] Search the platform your product lives in, from an account that never used it — [words](/demand/how-people-search/)
- [ ] Read a zero on your most obvious phrase as a finding, not a glitch. Either nobody has this problem, or you invented the word — [words](/demand/how-people-search/)
- [ ] Name the paid competitor. Count the ads on the query, and write down the free path — [paying](/demand/will-they-pay/)
- [ ] Fetch a page with `curl -sL` from outside, without cookies. Find your own text in the response — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Read `robots.txt`, then check `noindex` in the tag and in the header. No browser shows you the header — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Point every canonical at its own page. Redirect URL variants to one form. Canonical is the tag that names the real URL of a page — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Verify a domain property in Search Console and submit the sitemap once. Import the same property into Bing. A URL-prefix property covers only the form you typed — [submit](/indexing/submit-and-verify/)
- [ ] Serve `User-agent: *` and `Allow: /`, and name an agent only to block it — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Tag outbound links, one value per venue, and store the source on first contact — [attribution](/analytics/attribution/)
- [ ] Name the single action that counts as activation. Activation is what a user does that proves the product worked — [metrics](/analytics/what-to-measure/)
- [ ] Put who, what, when, source, cost, client and outcome on every event row. Cost and source can only be written at insert time — [event rows](/analytics/product-metrics/)
- [ ] Give each cluster exactly one URL, in a table you keep. A cluster is a set of wordings that want the same page — [clusters](/content/keyword-clusters/)
- [ ] Write the first page in the four-block shape, answering its title up front. The blocks: problem, steps, what did not work, how to check — [page shape](/content/page-templates/)
- [ ] Add JSON-LD with `sameAs` for your profiles and listings — a block of machine-readable facts about the page. Google documents it for the Knowledge Graph; for AI citation nobody has measured it — [citability](/geo/citable-pages/)
- [ ] Publish `llms.txt` only if you ship developer docs. Name only pages that exist. My log records 0 fetches by AI agents in 16 days — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Put the product's function into its platform name, in the audience's script. Platform search matches the name, not the description — [platform](/distribution/in-platform-visibility/)
- [ ] Write the listing card once, then submit in small tagged batches — [catalogs](/distribution/catalogs/)
- [ ] Answer questions where the shortlists get written, and say the product is yours. Never ask for upvotes — [communities](/distribution/communities/)
- [ ] Append a weekly snapshot to a file, same weekday every week — [metrics](/analytics/what-to-measure/)
- [ ] Record each action's cost on its event row. State break-even as a whole number of payers. I never had such a column, so every report reconstructed cost from a rates table — [cost](/money/unit-economics/)
- [ ] Name a price and put the wall after the first real result. Ask one person for money — [first payer](/money/first-payer/)

## What did not work

- **Ticking a box from memory**. Every item here is something I believed was already true. Half of them were not. Each check took a minute.
- **Starting at the indexing checks**. This list used to, and that quietly assumes the demand exists. Everything below the first block is aimed at words somebody has to be typing.
- **Starting in the middle, at the interesting part**. Content and directories are the enjoyable half. Both are wasted while the pages carry a header that drops them out of the index.
- **Ticking the tagging item with nothing to store the tag**. My links went out instrumented and the parameter arrived on every visit, with no column waiting for it. I ticked the box honestly, and the data was gone anyway.
- **Treating it as a list you finish once**. Directory status, edge rules and crawler access are all state. State changes without telling you. I re-run the top half each quarter.
- **Keeping an item this site's own practice contradicted**. The list told you to allow agents by name. `atlas.smolevich.com` was serving a plain wildcard the whole time. My own file was right and the list was wrong.
- **Requiring `llms.txt` after measuring that nothing fetched it**. The measurement sat one page away. The item sat here for exactly as long. And I kept ticking it.

## Verify

- Every ticked box has an artefact behind it: a command output, a report row, a row in the database. Memory does not count.
- The demand boxes leave a file of wordings and a named competitor. If either one is missing, everything ticked below is aimed at nothing.
- Check the tagging items by signing up through your own link. Then read back the value that got stored.
- The cluster table has as many rows as you have pages. Every URL in it resolves.
- Re-run the access checks at the top of the list a quarter later. At least one of them will have changed on you.

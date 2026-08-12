---
title: The checklist
description: Twenty items in the order that never wastes work, each one line with a link to the page that explains it.
updated: 2026-08-12
sources:
  - nginx access log, dataset /var/log/nginx/*.access.log, measured 2026-08-12
---

## What we are solving

Same route as [start here](/start/), with the reasons taken out. That page argues each step; this one is boxes to tick, for a screenshot or a tab you keep open.

Work top to bottom. Nothing here is undone by anything below it — that is the only reason the order matters.

If a line makes you ask why, the answer is on the page it links to. I wrote the list from things I thought I had already done.

## Steps

- [ ] Harvest the phrasings people use, in their own words, from support and reviews — [words](/demand/how-people-search/)
- [ ] Check them in Yandex Wordstat and in Google, operators applied, both suggests read. A bare phrase returns the category total, not demand for your wording — [words](/demand/how-people-search/)
- [ ] Search the platform your product lives in, from an account that never used it — [words](/demand/how-people-search/)
- [ ] Read a zero on your most obvious phrase as a finding, not a glitch. Either nobody has this problem, or you invented the word — [words](/demand/how-people-search/)
- [ ] Name the paid competitor, count the ads on the query, write down the free path. Nobody bids twice on an audience that does not spend — [paying](/demand/will-they-pay/)
- [ ] Fetch a page with `curl -sL` from outside, without cookies, and find your text. Text missing there is text the crawler never sees — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Read `robots.txt`, then check `noindex` in the tag and the header. It drops the page from the index on purpose, and no browser shows the header — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Point every canonical at its own page, and redirect URL variants to one form. Canonical is the tag naming which URL is the real one — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Verify a domain property in Search Console, submit the sitemap once, import it into Bing. A URL-prefix property covers only the form you typed — [submit](/indexing/submit-and-verify/)
- [ ] Serve `User-agent: *` and `Allow: /`, and name an agent only to block it. A named allow list expires every time a vendor renames something — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Tag outbound links, one value per venue, and store the source on first contact. Untagged arrivals can never be attributed later — [attribution](/analytics/attribution/)
- [ ] Name the single action that counts as activation. Activation is what a user does that means the product worked — [metrics](/analytics/what-to-measure/)
- [ ] Put who, what, when, source, cost, client and outcome on every event row. Cost and source can only be written at insert time — [event rows](/analytics/product-metrics/)
- [ ] Give each cluster exactly one URL, in a table you keep. A cluster is a set of wordings that want the same page — [clusters](/content/keyword-clusters/)
- [ ] Write the first page in the four-block shape, answering its title up front. The blocks: problem, steps, what did not work, how to check — [page shape](/content/page-templates/)
- [ ] Add JSON-LD — machine-readable facts about the page — with `sameAs` for your profiles and listings. Documented for Google's Knowledge Graph, unmeasured for AI citation, ten minutes either way — [citability](/geo/citable-pages/)
- [ ] Publish `llms.txt` only if you ship developer docs, naming only pages that exist. My log records 0 fetches by AI agents in 16 days — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Put the product's function into its platform name, in the audience's script. Platform search matches the name, not the description — [platform](/distribution/in-platform-visibility/)
- [ ] Write the listing card once, then submit in small tagged batches — [catalogs](/distribution/catalogs/)
- [ ] Answer questions where the shortlists get written, and say the product is yours. Never ask for upvotes — [communities](/distribution/communities/)
- [ ] Append a weekly snapshot to a file, same weekday every week. A number you cannot compare with itself is decoration — [metrics](/analytics/what-to-measure/)
- [ ] Record each action's cost on its event row, then state break-even in whole payers. An empty column makes every report fall back to estimated rates — [cost](/money/unit-economics/)
- [ ] Name a price and put the wall after the first real result. Ask one person for money — [first payer](/money/first-payer/)

## What did not work

- **Ticking a box from memory**. Every item here is something I believed was already true. Half of them were not, and the check took a minute each.
- **Starting at the indexing checks**. This list used to start there, and starting there assumes the demand exists. Everything below the first block is aimed at words somebody has to be typing.
- **Starting in the middle, at the interesting part**. Content and directories are the enjoyable half. Both are wasted while the pages carry a header that drops them.
- **Ticking the tagging item with nothing to store the tag**. The links went out instrumented, the parameter arrived, and no column existed. The box was honestly ticked and the data was gone.
- **Treating it as a list you finish once**. Directory status, edge rules and crawler access are all state. They change without telling you, so the top half is worth re-running each quarter.
- **Keeping an item this site's own practice contradicted**. The list told you to allow agents by name while `atlas.smolevich.com` served a plain wildcard. When the advice and the author's own file disagree, the file is the honest one.
- **Requiring `llms.txt` after measuring that nothing fetched it**. The item sat here for as long as the measurement did, one page away. A checklist that survives its own evidence is a habit, not a procedure.

## Verify

- Every ticked box has an artefact: a command output, a report row, a database row. Memory is not one.
- The demand boxes leave a file of phrasings and a named competitor. If either is missing, the boxes below it are aimed at nothing.
- The tagging items are checked by signing up through your own link and reading the stored value.
- The cluster table has as many rows as you have pages for it, and every URL in it resolves.
- Re-run the access checks at the top of the list a quarter later. At least one of them will have changed on you.

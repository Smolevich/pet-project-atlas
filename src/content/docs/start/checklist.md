---
title: The checklist
description: Twenty items in the order that never wastes work, each one line with a link to the page that explains it.
---

## What we are solving

The route from [start here](/start/), flattened to one screen. Same order, no explanation.

Work top to bottom. Nothing here is undone by anything below it, which is the only reason the order matters.

## Steps

- [ ] Harvest the phrasings people use, in their own words, from support and reviews — [words](/demand/how-people-search/)
- [ ] Check them in Yandex Wordstat and in Google, operators applied, both suggests read — [words](/demand/how-people-search/)
- [ ] Search the platform your product lives in, from an account that never used it — [words](/demand/how-people-search/)
- [ ] Read a zero on your most obvious phrase as a finding, not a glitch — [words](/demand/how-people-search/)
- [ ] Name the paid competitor, count the ads on the query, write down the free path — [paying](/demand/will-they-pay/)
- [ ] Fetch a page with `curl -sL` from outside, without cookies, and find your text — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Read `robots.txt`, then check `noindex` in the tag and the header — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Point every canonical at its own page, and redirect URL variants to one form — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Verify a domain property in Search Console, submit the sitemap once, import it into Bing — [submit](/indexing/submit-and-verify/)
- [ ] Allow search and user-triggered AI agents by name — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Tag outbound links, one value per venue, and store the source on first contact — [attribution](/analytics/attribution/)
- [ ] Name the single action that counts as activation — [metrics](/analytics/what-to-measure/)
- [ ] Give each cluster exactly one URL, in a table you keep — [clusters](/content/keyword-clusters/)
- [ ] Write the first page in the four-block shape, answering its title up front — [page shape](/content/page-templates/)
- [ ] Add JSON-LD with `sameAs` for your profiles and listings — [citability](/geo/citable-pages/)
- [ ] Publish `llms.txt` naming only pages that exist — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Put the product's function into its platform name, in the audience's script — [platform](/distribution/in-platform-visibility/)
- [ ] Write the listing card once, then submit in small tagged batches — [catalogs](/distribution/catalogs/)
- [ ] Append a weekly snapshot to a file, same weekday every week — [metrics](/analytics/what-to-measure/)
- [ ] Record each action's cost on its event row, then state break-even in whole payers — [cost](/money/unit-economics/)

## What did not work

- **Ticking a box from memory**. Every item here is something I believed was already true. Half of them were not, and the check took a minute each.
- **Starting at the indexing checks**. This list used to start there, and starting there assumes the demand exists. Everything below the first block is aimed at words somebody has to be typing.
- **Starting in the middle, at the interesting part**. Content and directories are the enjoyable half. Both are wasted while the pages carry a header that drops them.
- **Ticking the tagging item with nothing to store the tag**. The links went out instrumented, the parameter arrived, and no column existed. The box was honestly ticked and the data was gone.
- **Treating it as a list you finish once**. Directory status, edge rules and crawler access are all state. They change without telling you, so the top half is worth re-running each quarter.

## Verify

- Every ticked box has an artefact: a command output, a report row, a database row. Memory is not one.
- The demand boxes leave a file of phrasings and a named competitor. If either is missing, the boxes below it are aimed at nothing.
- The tagging items are checked by signing up through your own link and reading the stored value.
- The cluster table has as many rows as you have pages for it, and every URL in it resolves.
- Re-run the access checks at the top of the list a quarter later. At least one of them will have changed.

---
title: The checklist
description: Twenty items in the order that never wastes work, each one line with a link to the page that explains it.
---

## What we are solving

The route from [start here](/start/), flattened to one screen. Same order, no explanation.

Work top to bottom. Nothing here is undone by anything below it, which is the only reason the order matters.

## Steps

- [ ] Fetch a page with `curl -sL` and find your body text in the response — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Read `robots.txt`, then check `noindex` in the tag and the header — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Point every canonical at its own page, and redirect URL variants to one form — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Fetch a page from outside your network, without cookies — [blockers](/indexing/why-google-does-not-see-you/)
- [ ] Verify a domain property in Search Console and submit the sitemap once — [submit](/indexing/submit-and-verify/)
- [ ] Import that property into Bing Webmaster Tools — [submit](/indexing/submit-and-verify/)
- [ ] Allow search and user-triggered AI agents by name — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Tag every outbound link, one fixed value per venue — [attribution](/analytics/attribution/)
- [ ] Store the source on first contact and never overwrite it — [attribution](/analytics/attribution/)
- [ ] Name the single action that counts as activation — [metrics](/analytics/what-to-measure/)
- [ ] Harvest the phrasings people use, in their own words — [clusters](/content/keyword-clusters/)
- [ ] Give each cluster exactly one URL, in a table you keep — [clusters](/content/keyword-clusters/)
- [ ] Write the first page in the four-block shape, answering its title up front — [page shape](/content/page-templates/)
- [ ] Add JSON-LD with `sameAs` for your profiles and listings — [citability](/geo/citable-pages/)
- [ ] Publish `llms.txt` naming only pages that exist — [crawlers](/geo/llms-txt-and-crawlers/)
- [ ] Put the product's function into its platform name, in the audience's script — [platform](/distribution/in-platform-visibility/)
- [ ] Write the listing card once, then submit in small tagged batches — [catalogs](/distribution/catalogs/)
- [ ] Append a weekly snapshot to a file, same weekday every week — [metrics](/analytics/what-to-measure/)
- [ ] Record the cost of every action on its own event row — [cost](/money/unit-economics/)
- [ ] State break-even as a whole number of payers — [cost](/money/unit-economics/)

## What did not work

- **Ticking a box from memory**. Every item here is something I believed was already true. Half of them were not, and the check took a minute each.
- **Starting in the middle, at the interesting part**. Content and directories are the enjoyable half. Both are wasted while the pages carry a header that drops them.
- **Ticking the tagging item with nothing to store the tag**. The links went out instrumented, the parameter arrived, and no column existed. The box was honestly ticked and the data was gone.
- **Treating it as a list you finish once**. Directory status, edge rules and crawler access are all state. They change without telling you, so the top half is worth re-running each quarter.

## Verify

- Every ticked box has an artefact: a command output, a report row, a database row. Memory is not one.
- The tagging items are checked by signing up through your own link and reading the stored value.
- The cluster table has as many rows as you have pages for it, and every URL in it resolves.
- Re-run the access checks at the top of the list a quarter later. At least one of them will have changed.

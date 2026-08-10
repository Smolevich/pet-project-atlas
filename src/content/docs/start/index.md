---
title: Start here
description: The route from a live project nobody finds to first traffic — what to do in week one, week two and month two, one line per step.
---

Six sections, eleven pages, and no obvious place to start. This page is the order, and nothing else.

Every step is one line and a link. The page behind the link explains it; this one only says when.

The flat version, for bookmarking and screenshots: [the checklist](/start/checklist/).

## What we are solving

The project has been live for weeks and the only visitor in the logs is you. You have read enough advice to have twelve things to do and no idea which is first.

Order is the whole problem. Most of the work below is cheap; doing it out of sequence is what costs the month.

## Steps

The section numbers are a reading order. The doing order crosses them twice, and both crossings are marked below.

### Week one — make the site fetchable, then hand it over

1. Fetch your own page with `curl -sL` and find a sentence of body text in the response — [Google does not see your site](/indexing/why-google-does-not-see-you/).
2. Read `robots.txt` on the live domain, every line of it — [same page](/indexing/why-google-does-not-see-you/).
3. Check `noindex` in the meta tag and in the `X-Robots-Tag` header — [same page](/indexing/why-google-does-not-see-you/).
4. Check the canonical on a few pages points at those pages — [same page](/indexing/why-google-does-not-see-you/).
5. Request one page from outside your network, without cookies — [same page](/indexing/why-google-does-not-see-you/).
6. Verify a domain property in Search Console and submit the sitemap once — [submit and verify](/indexing/submit-and-verify/).
7. Import the property into Bing Webmaster Tools — [submit and verify](/indexing/submit-and-verify/).
8. Allow the search and user-triggered AI agents by name — [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).
9. **First crossing.** Tag every outbound link and store the source on first contact — [where the user came from](/analytics/attribution/).
10. Name the single action that counts as activation — [the numbers worth reading weekly](/analytics/what-to-measure/).

Step nine belongs to section five and has to happen now. Attribution cannot be reconstructed, so every untagged day is a day of arrivals you will never classify.

### Week two — write pages that can be found and quoted

11. Harvest the phrasings people actually use, in their words — [what to write](/content/keyword-clusters/).
12. Group them into clusters and give each cluster exactly one URL — [what to write](/content/keyword-clusters/).
13. Order the queue by money: transactional, then comparison, then informational — [what to write](/content/keyword-clusters/).
14. Write the first page in the four-block shape — [what a page is made of](/content/page-templates/).
15. Put the answer in the first three sentences of that page — [what a page is made of](/content/page-templates/).
16. Add JSON-LD with `sameAs` listing your profiles and listings — [why AI answers cite someone else](/geo/citable-pages/).
17. Publish `llms.txt` naming only pages that are actually written — [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).
18. If the product lives in a platform, put its function in the name — [search inside the platform](/distribution/in-platform-visibility/).
19. Take the first weekly snapshot and append it to a file — [the numbers worth reading weekly](/analytics/what-to-measure/).

### Month two — go off-site, then read the money

20. Write the listing card once: name, description, category, screenshots, link — [where the first links come from](/distribution/catalogs/).
21. Check each venue live, then submit in small batches with tagged links — [where the first links come from](/distribution/catalogs/).
22. Write to one listicle author whose page already ranks above you — [where the first links come from](/distribution/catalogs/).
23. **Second crossing.** Re-run the citability work now that something links to you — [why AI answers cite someone else](/geo/citable-pages/).
24. Record the cost of every action on its own event row — [what one user costs](/money/unit-economics/).
25. State break-even as a whole number of payers per month — [what one user costs](/money/unit-economics/).
26. Read the series and fix the earliest large drop, not the last one — [the numbers worth reading weekly](/analytics/what-to-measure/).

Step twenty-three goes back to section two. On-page citability pays once a model has seen you named somewhere else, and month two is when that starts being true.

## What did not work

These are mistakes of order. Each of them is work I did correctly, at a moment when it could not pay.

- **Backlinks while the site was still blocked**. I spent a week on directory submissions. The pages behind those links were carrying a `noindex` header the whole time, so search kept dropping them. The listings survived, the week did not.
- **Writing before the cluster map existed**. Two pages ended up chasing the same intent. Search alternated between them, both stayed flat, and the fix was a merge and a redirect. That is the writing paid for twice.
- **Tagging links after the launch**. The launch day arrivals came in untagged and stayed that way. No later analysis recovers them, because there is nothing to analyse.
- **Citability work before crawler access**. The pages scored well and no agent had fetched them. The edge was refusing them, and the writing was addressed to nobody.
- **Cutting costs before there were payers**. A few dollars of fixed cost, optimised carefully, while the number of payers was zero. Break-even was never a cost problem.
- **Following the section numbers literally**. They are a reading order, not a schedule. Read that way, attribution lands after distribution, which is exactly one section too late.

## Verify

At the end of each stage there is one sentence you should be able to say out loud. If you cannot, stay in the stage.

- **End of week one**. URL Inspection says the URL is on Google, and a link published today carries a source tag that lands in the database.
- **End of week two**. Every cluster has exactly one owning URL, the first page answers its own title in its opening sentences, and the snapshot file has a row.
- **End of month two**. At least one listing whose HTML contains your link, one recorded cost on a real event row, and a break-even you can say as a whole number.

Symptom-first instead of stage-first, when something specific is broken: [Tools](/tools/).

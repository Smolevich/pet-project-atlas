---
title: Start here
description: The route from a live project nobody finds to first traffic — demand first, then week one, week two and month two, one line per step.
updated: 2026-08-12
sources:
  - nginx access log, dataset /var/log/nginx/*.access.log, measured 2026-08-12
  - sitemap.xml, site atlas.smolevich.com, measured 2026-08-12
---

Seven sections, eighteen pages, and no obvious place to start. This page is the order, and under each step the reason it sits there.

The same route with the reasons taken out is [the checklist](/start/checklist/) — one screen, boxes to tick, nothing to read.

The steps are written as orders, because a procedure should be. Everything around them is one project's log, and yours will say something else.

## What we are solving

The project has been live for weeks and the only visitor in the logs is you. You have read enough advice to have twelve things to do and no idea which is first.

Order is the whole problem. Each item below is cheap on its own — doing them out of sequence is what costs the month.

And the first item in that order is not technical at all. It is whether anybody searches for this, and whether those people pay for anything.

## Steps

The section numbers are a reading order. The doing order crosses them twice, and I marked both crossings below.

### Week zero — check there is demand before anything else

1. Harvest the exact phrasings people use, from support, reviews and forums — [the words people actually type](/demand/how-people-search/).
2. Check the Russian phrasings in Yandex Wordstat, with the operators applied. No Russian-speaking audience? Skip to step three. A bare phrase returns the category total, not demand for your wording — [same page](/demand/how-people-search/).
3. Check the English ones in Google, and read both suggest dropdowns — [same page](/demand/how-people-search/).
4. Search the platform your product lives in, from a fresh account — [same page](/demand/how-people-search/).
5. Read a zero on your most obvious phrase as a finding, not a glitch. Either nobody has this problem, or you invented the word — [same page](/demand/how-people-search/).
6. Name the paid competitor on your main query, and record their price shape. Somebody already tested this market with their own money — [whether that audience pays](/demand/will-they-pay/).
7. Check whether anyone bids on the query, and what the free path is. Nobody bids twice on an audience that does not spend — [same page](/demand/will-they-pay/).

A day or two, all of it in a browser, and it decides whether the rest is worth doing. Everything below assumes somebody types these words and somebody pays for something.

### Week one — make the site fetchable, then hand it over

8. Run `curl -sL` on your own page and find body text in the response. Text missing there is text the crawler never sees — [Google does not see your site](/indexing/why-google-does-not-see-you/).
9. Read `robots.txt` on the live domain, every line of it. One line closes the whole domain — a `Disallow: /` that came over from a staging config — [same page](/indexing/why-google-does-not-see-you/).
10. Check `noindex` in the meta tag and in the `X-Robots-Tag` header. It drops the page from the index on purpose, and no browser shows the header — [same page](/indexing/why-google-does-not-see-you/).
11. Check the canonical on a few pages points at those pages. Canonical is the tag naming which URL is the real one for a page. Aimed at the home page, it asks search to discard the rest — [same page](/indexing/why-google-does-not-see-you/).
12. Request one page from outside your network, without cookies. Your own network is trusted, so an edge rule blocking the crawler stays invisible from home — [same page](/indexing/why-google-does-not-see-you/).
13. Verify a domain property in Search Console and submit the sitemap once. A URL-prefix property covers only the form you typed, and its report stays empty — [submit and verify](/indexing/submit-and-verify/).
14. Import the property into Bing Webmaster Tools. Its index also feeds Copilot answers, which is a separate audience — [submit and verify](/indexing/submit-and-verify/).
15. Serve `User-agent: *` and `Allow: /`, and name an agent only to block it. Blocked, you are absent from the answer at any quality of content. A named allow list expires as vendors rename things — [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).
16. **First crossing.** Tag every outbound link and store the source on first contact. A messenger or a store passes no source unless you ask for it — [where the user came from](/analytics/attribution/).
17. Name the single action that counts as activation. Activation is the one thing a user does that means the product actually worked — [the numbers worth reading weekly](/analytics/what-to-measure/).

Step sixteen belongs to section six and has to happen now. Attribution cannot be reconstructed — every untagged day is a day of arrivals you will never classify.

### Week two — write pages that can be found and quoted

18. Group the phrasings from week zero into clusters, one URL each. A cluster is a set of wordings that want the same page — [what to write](/content/keyword-clusters/).
19. Order the queue by money: transactional, then comparison, then informational. That is ready to buy, then still choosing, then still reading. You run out of energy long before you run out of clusters — [what to write](/content/keyword-clusters/).
20. Write the first page in the four-block shape — [what a page is made of](/content/page-templates/). The blocks: the problem, the steps, what did not work, how to check.
21. Put the answer in the first three sentences of that page. That block is the passage a model lifts — [what a page is made of](/content/page-templates/).
22. Add JSON-LD with `sameAs` listing your profiles and listings. JSON-LD is a block of machine-readable facts about the page. It is documented for Google's Knowledge Graph and unmeasured for AI citation — [why AI answers cite someone else](/geo/citable-pages/).
23. Publish `llms.txt` only if you ship developer docs, naming only pages that are actually written. My own log records 0 fetches by any AI agent in 16 days — [AI crawlers and llms.txt](/geo/llms-txt-and-crawlers/).
24. If the product lives in a platform, put its function in the name. Platform search matches the name, not the description — [search inside the platform](/distribution/in-platform-visibility/).
25. Take the first weekly snapshot and append it to a file — [the numbers worth reading weekly](/analytics/what-to-measure/).

### Month two — go off-site, then read the money

26. Write the listing card once: name, description, category, screenshots, link — [where the first links come from](/distribution/catalogs/).
27. Check each venue live, then submit in small batches with tagged links. Published lists of directories go stale faster than anything else here — [where the first links come from](/distribution/catalogs/).
28. Write to one listicle author whose page already ranks above you. One inclusion there beats several entries in directories nobody reads — [where the first links come from](/distribution/catalogs/).
29. **Second crossing.** Re-run the citability work now that something links to you — [why AI answers cite someone else](/geo/citable-pages/).
30. Record the cost of every action on its own event row. An empty column makes every report fall back to estimated rates — [what one user costs](/money/unit-economics/).
31. State break-even as a whole number of payers per month — [what one user costs](/money/unit-economics/).
32. Read the series and fix the earliest large drop, not the last one. Tuning payment while activation is broken works on a step almost nobody reaches — [the numbers worth reading weekly](/analytics/what-to-measure/).
33. Post where the shortlists get written: answer the question and say the product is yours. Never ask for upvotes — [communities and forums](/distribution/communities/).
34. Put who, what, when, source, cost, client and outcome on every event row. Both cost and source can only be written at insert time. This one belongs back in week one — [what an event row has to carry](/analytics/product-metrics/).
35. Name a price, put the wall after the first real result, and ask one person for money. Nobody paying and nobody being asked look the same from the dashboard — [getting the first person to pay](/money/first-payer/).

Step twenty-nine goes back to section three. On-page citability pays once a model has seen you named somewhere else. Month two is when that starts being true.

## What did not work

These are mistakes of order. Every one of them is work I did correctly, at a moment when it could not pay.

- **Optimising for a phrase I invented**. The word I used for the core feature was not the word people typed. Pages, links and dashboards all worked, and the demand walked past all of them.
- **Backlinks while the site was still blocked**. I spent a week on directory submissions. The pages behind those links were carrying a `noindex` header the whole time, so search kept dropping them. The listings survived, the week did not.
- **Writing before the cluster map existed**. Two pages ended up chasing the same intent. Search alternated between them, both stayed flat, and the fix was a merge and a redirect. That is the writing paid for twice.
- **Tagging links after the launch**. The launch day arrivals came in untagged and stayed that way. No later analysis recovers them, because there is nothing to analyse.
- **Citability work before crawler access**. The pages scored well and no agent had fetched them. The edge was refusing them, and the writing was addressed to nobody.
- **Cutting costs before there were payers**. A few dollars of fixed cost, optimised carefully, while the number of payers was zero. Break-even was never a cost problem.
- **Publishing a step I had already measured as empty**. Step twenty-three said publish `llms.txt`, and the log two clicks away recorded no AI agent fetching it once. The measurement and the instruction lived on the same site for a week.
- **Telling readers to allow agents by name**. Step fifteen did, while this site's own `robots.txt` was a wildcard the whole time. My own file was the better advice, and I never read it as advice.
- **Following the section numbers literally**. They are a reading order, not a schedule. Read that way, attribution lands after distribution, which is exactly one section too late.

## Verify

At the end of each stage there is one sentence you should be able to say out loud. If you cannot say it, stay in the stage — the next one is built on top of it.

- **End of week zero**. A file of phrasings, each with its origin and the engine it was checked in. A named paid competitor, or a stated reason the market looks empty.
- **End of week one**. URL Inspection says the URL is on Google. A link published today carries a source tag that lands in the database.
- **End of week two**. Every cluster has exactly one owning URL. The first page answers its own title in its opening sentences, and the snapshot file has a row.
- **End of month two**. At least one listing whose HTML contains your link, and one recorded cost on a real event row. A break-even you can say as a whole number.

When something specific is broken and you would rather start from the symptom than from the stage: [Tools](/tools/).

---
title: Whether that audience pays for anything
description: Paid competitors, ads on the query, what a pre-sale actually proves, and why a large query with nobody bidding on it usually means an audience looking for the free way.
updated: 2026-08-12
sources:
  - https://support.google.com/google-ads/answer/7337243
  - https://support.google.com/google-ads/answer/1704431
  - https://support.google.com/google-ads/answer/6297
  - https://wordstat.yandex.ru/
  - Search Console API, property telegram-voice-bot, measured 2026-08-12
---

## What we are solving

A phrase can carry real demand and no money at all. People type it, find the free way, and leave perfectly satisfied.

Volume answers whether they search. Whether they buy is a different question, and the evidence for it sits somewhere else entirely.

The good part is that all of that evidence is readable before you build anything. That is the whole reason to ask now, while the answer still costs an afternoon.

## Steps

1. **Find the paid competitor on your main query** — run it and read who is on the results page.
   That page is what the tools call the SERP. A product with a pricing page sitting on it was the strongest signal I got for free. Somebody already tested this market with their own money.
2. **Record the shape of their price, not the number** — per seat, per action, per month.
   A free tier with a wall in it is a shape too. The shape says what they found people will pay for, so copy the question they answered rather than the figure.
3. **Look at whether anyone is bidding on the query** — count the ads above the results.
   An ad means somebody pays for that click and keeps repeating the purchase. Nobody bids twice on an audience that does not spend.
4. **Read the bid estimate next to the volume** — Keyword Planner reports bid ranges alongside its forecast.
   A high bid on a small query is a market where one customer is worth a lot. I would rather start there than on a large cheap one.
5. **Treat volume with no bidding as a warning** — a large query and an empty ad block.
   I read that as an audience looking for the free way. On my query that is exactly what it was. Real people, real problem, no line item for it anywhere.
6. **Find out what the free path actually is** — the platform's own feature, an open-source script, doing it by hand.
   Your price competes with that, not with the paid competitor's price. Check it again each quarter, because platforms ship features.
7. **Ask for money before the thing exists** — a price, a payment link, a date.
   A pre-sale proves exactly one thing: this person, at this price, today. It does not prove a market and it does not prove a second person.
8. **Record the refusals in the person's own words** — the reason somebody did not pay is the finding.
   "I would use the free one" and "my employer would never approve this" describe two different products. Only one of them is worth building.
9. **Say the break-even out loud before the price** — fixed cost divided by contribution, rounded up to people.
   If that number is larger than the number of people you have spoken to, you are not pricing. You are hoping. The arithmetic is on [what one user costs](/money/unit-economics/).

## What did not work

- **Treating search volume as demand for a paid product**. The phrases were real and so were the people typing them. Almost everyone who arrived wanted the free way. The pages ranking above me explained how to get the result without paying.
- **Reading one impression as a statement about demand**. `stt модели` sat at average position 1.0 with 1 impression and 0 clicks in three months. I read that as a phrase nobody types. Search Console counts how often my result was shown, which is a fact about my page. The phrase itself had to be checked in Wordstat, and the row is on [what a paid rank tracker measures](/tools/paid-tools/).
- **Reading signups as willingness to pay**. Free signups arrived, used the product and came back. Not one of them converted, and the signup count kept climbing the whole time.
- **Missing the free alternative the platform itself shipped**. The platform I build on gives the same function to its own paying subscribers. For a large part of that audience my price competes with a feature they already have.
- **Counting my own test purchase as revenue**. The model showed break-even reached for a day. The payer was me, through a test account.
- **Cutting a fixed cost of a few dollars while there were no payers**. The denominator was already fine. No break-even exists without a first payer, so the work belonged here, not in the billing console.
- **Building a scenario matrix instead of asking one person**. Optimistic and pessimistic columns are opinions about a margin nobody has earned. One person refusing a real price settles it faster.

## Verify

- Name the paid competitor for your main query, with a link to their pricing page. If there is none, ask why the market is empty before assuming it is yours.
- Run the query and note whether ads appear, then repeat it a week later. One day of ads proves nothing about a budget.
- Write the free path to the same outcome in one sentence, including anything the platform ships itself.
- Ask one real person for money at a real price and store the answer verbatim, refusal included.
- State your break-even as a whole number of payers. If you cannot say it out loud, the price is a guess with a confident face on it.

Ads, CPC and intent read side by side across three niches: [which market to build for](/demand/pick-a-market/).

If both questions come back positive, the next wall is technical rather than commercial. Search has to be able to read the site at all, and that is [indexing](/indexing/).

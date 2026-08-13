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

I picked the niche by intent in the first place: I took the keywords where it reads transactional or commercial, because on the rest people read and leave instead of buying.

And then the part the guides tend to stay quiet about starts. You have to write content often, then check that the new pages got into the index at all, and that the weight of the actual keyword on them is significant. Otherwise there are no impressions even in theory. And impressions are only half of it: to turn one into a click you have to climb the results, because hardly anyone scrolls as far as page four 😀

So volume answers one question, whether they search. Whether they pay is a different one, and you want to look at it before you have written anything, not after.

## Steps

### Who is already selling on your query

I would start here, because it is the only check that costs nothing and takes a minute. Run your main query and read who is standing on the results page. A product with a pricing page in the top ten means somebody already tested this market with their own money, and you do not have to repeat their research.

```
site:example.com pricing
```

Their price is read the same way. Write down the shape rather than the number: per seat, per action, per month, a free tier with a wall inside it. You will put your own figure there anyway, and the shape tells you what people here pay for at all.

Ask this before you have written anything. Afterwards it stops being a check and turns into a search for justifications.

### Is anyone putting money on this query

The ads above the results are people paying for a click and repeating the purchase. Nobody buys the same audience a second month running if that audience does not spend.

Count them by hand: run the query and look at how many ads sit above the organic results. A panel like Semrush shows an `Ads` field, but that is its own count of ad copies in its database, not what a person sees today.

Here are two live groups, read on the same day:

| Group | Volume (US) | CPC | Ads |
|---|---|---|---|
| `ai voice agent` | 1,900 | $16.18 | 14 |
| `youtube transcript` | 60,500 | $0.86 | none |

The second one has thirty-two times the demand and no money behind it at all. Sixty thousand searches a month and not one advertiser is not a market, it is people who need a free tool.

### What free path does the person have right now

Your price competes with the free way, not with the competitor's price. Usually that is a feature of the platform itself, an open-source script, or doing it by hand in ten minutes.

Check it on your own query, reading the suggest: if the word "free" crawls into it, you have your answer already. In my Russian group `голосовой бот` the word for free stood in the top five twice.

Come back to this once a quarter, because platforms ship features and the free path appears on its own.

### Ask for money before the thing exists

This is the most unpleasant and the most honest check. You name a price, you give a payment link, you set a date. A pre-sale proves exactly this: this person, at this price, today. It proves neither a market nor a second person — and it is still more than most people have.

Record the refusals in the person's own words, not as a paraphrase. "I would use the free one" and "my employer would never approve this" describe two completely different products, and only one of them is worth building.

### Say the break-even out loud before the price

Take the fixed costs, divide by the contribution from one payer, round up to whole people. You get a number like "twelve people a month".

If that number is bigger than the number of people you have actually spoken to, you are not pricing, you are hoping. The arithmetic is on [what one user costs](/money/unit-economics/).

## What did not work

- **Treating volume as demand for a paid product**. The phrases were real and so were the people typing them. Almost everyone who arrived wanted the free way. The pages ranking above me explained how to get the result without paying.
- **Reading one impression as a statement about demand**. `stt модели` sat at average position 1.0 with 1 impression and 0 clicks in three months. I read that as a phrase nobody types. Search Console counts how often my page was shown, which is a fact about me. The phrase itself I had to go and check in Wordstat, and the row is on [what a paid rank tracker measures](/tools/paid-tools/).
- **Reading signups as willingness to pay**. Free signups arrived, used the product and came back. Not one converted, and the signup counter kept climbing the whole time.
- **Missing the free alternative the platform itself shipped**. The platform I build on gives the same function to its own paying subscribers. For a large part of that audience my price competes with a feature they already have.
- **Counting my own test purchase as revenue**. The model showed break-even reached for a day. The payer was me, through a test account.
- **Cutting a fixed cost of a couple of dollars while there were no payers**. The denominator was fine as it was. Without a first payer there is no break-even, so the work was here and not in the billing console.
- **Building a scenario matrix instead of talking to one person**. The optimistic and pessimistic columns are opinions about a margin nobody has earned. One person refusing a real price settles it faster.

## Verify

- Name the paid competitor on your main query and link to their pricing page. If there is none, ask why the market is empty before treating it as yours.
- Run the query and note whether ads appear, then repeat it a week later. One day of ads says nothing about a budget.
- Write down the free path to the same outcome in one sentence, including whatever the platform ships itself.
- Ask a real person for money at a real price and keep the answer verbatim, refusal included.
- State your break-even as a whole number of payers. If you cannot say it out loud, the price is a guess with a confident face on it.

Ads, CPC and intent read side by side across three niches: [which market to build for](/demand/pick-a-market/).

If both questions came back yes, the next wall is technical rather than commercial. Search has to be able to read the site at all, and that is [indexing](/indexing/).

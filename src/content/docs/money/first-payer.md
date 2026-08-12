---
title: Getting the first person to pay
description: Break-even comes out as a small whole number of payers and none of them exist. Picking a price without a study, where the wall goes in a free tier, and the difference between nobody paying and nobody being asked.
updated: 2026-08-12
sources:
  - https://core.telegram.org/bots/payments-stars
---

## What we are solving

The money route ends at a diagnosis. Break-even comes out as a small whole number of payers, and the count of payers is zero.

A product nobody pays for and a product nobody has been asked to pay for look identical from the dashboard. Both show no revenue and both feel like a verdict.

Only one of them is. Telling them apart costs one question you have not asked yet.

## Steps

1. **Take the price shape from the competitor** — per seat, per action, or per month.
   Somebody already tested that shape with their own money: [whether that audience pays](/demand/will-they-pay/). Your number then has to clear the worst-case margin floor from [what one user costs](/money/unit-economics/).
2. **Price the unit your event row already records** — a minute, a message, a run.
   If the row carries a cost per action, a package of actions is priceable today. A price in a unit you do not measure cannot be checked against anything.
3. **Do not run a pricing study at this size** — a survey answer is not a purchase.
   The number of people you could survey is small enough to ask each of them for money instead. One of those answers is worth more than a form full of the other kind.
4. **Put the wall where the product has already worked once** — after the first real result, not before it.
   Before it, the person is refusing something they have not seen. Long after it, they already have what they came for and there is nothing left to buy.
5. **Make the wall stop something** — a generous free tier with an upgrade prompt collects nothing.
   The prompt is dismissible and the free tier keeps working, so dismissing it is the rational move. If nothing stops, nobody pays.
6. **Give one resource one limit** — a balance and a separate daily cap are two walls that disagree.
   Whichever fires first is the one your users actually meet. It is usually not the one you priced.
7. **Name the price inside the product, at the wall** — a pricing page serves people who came looking for it.
   The person standing at the wall is the only one holding the question at that moment.
8. **Give every step from wall to payment its own row** — saw the price, opened checkout, started, completed, failed.
   Without those rows "nobody pays" is a single fact. With them it is five, and only one of the five is a pricing problem.
9. **Buy your own product with real money, then refund it** — the whole path, not the sandbox.
   Telegram requires bots selling digital goods inside its apps to use Stars. They must answer `/paysupport` and check for a successful payment update before delivering. A checkout that fails quietly reads on a dashboard as nobody wanting the thing.
10. **Ask by hand while the numbers are unreadable** — write to your most engaged users individually.
    At a handful of weekly actives no funnel means anything. One person answering a real price settles more than a month of watching the graph.
11. **Store every refusal in the person's own words** — the reason is the finding, not the no.
    "I would use the free one" and "my employer would never approve this" point at two different products.
12. **Do not discount before somebody has refused the full price** — a discount off an unasked number tests nothing.
13. **Move the default engine to the cheap one before you take money** — [what one user costs](/money/unit-economics/).
    The first payer arrives on the default path. If that path runs your expensive engine, the first sale spends the margin you were trying to prove.

## What did not work

- **Pricing the packages before asking anybody for money.** Three packages shipped and a channel connected. Not one real payer. I had priced a thing nobody had yet refused.
- **Treating the payment channel as the blocker.** One provider never came through. Connecting a second one took real time. When it finally worked the count of payers did not move. The channel was never the thing in the way.
- **Defaulting to the most expensive engine.** One config line cost margin, speed and the free allowance at once. People sat watching a placeholder while credits went out of the account.
- **Two independent limits on the same resource.** A credit balance, plus a per-day cap on one engine. The most engaged user of that month hit the cap with credits still unspent, and never came back. The cap stopped the person closest to paying and never asked him for money.
- **Reading free signups as willingness to pay.** They arrived, used the product and returned, and none of them converted. The signup number kept climbing the whole time.
- **Waiting for the funnel to say something.** At this volume the weekly swing beat any effect I could ship. The funnel was the wrong instrument and a direct question was the right one.
- **Counting my own test purchase as revenue.** The model showed break-even reached for a day. The payer was me, through a test account.
- **Cutting a few dollars of fixed cost while payers were zero.** No break-even exists without the first one. The work belonged here, not in the billing console.

## Verify

- Say the price out loud with its unit attached. If that unit is not one your rows record, the price cannot be checked against cost.
- Walk your own product as a new user. Count the screens between the first real result and the first mention of money.
- Exhaust the free allowance on a test account. The product has to actually stop, and the message has to name the price.
- Trigger each step between the wall and the payment, then read the rows back. A missing row is a question you will not be able to answer later.
- Make one real purchase with real money, deliver the thing, then refund it through the provider's own method. Confirm the support command answers.
- Ask one person for money at a real price and store the reply verbatim, refusal included.
- Re-run the revenue aggregation and confirm your own purchase is absent from it.

If the refusals name the free path rather than the number, the problem sits upstream: [whether that audience pays](/demand/will-they-pay/).

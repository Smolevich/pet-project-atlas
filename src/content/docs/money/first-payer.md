---
title: Getting the first person to pay
description: Break-even comes out as a small whole number of payers and none of them exist. Picking a price without a study, where the wall goes in a free tier, and the difference between nobody paying and nobody being asked.
updated: 2026-08-12
sources:
  - Telegram Stars for digital goods — https://core.telegram.org/bots/payments-stars
---

## What we are solving

The money route ends at a diagnosis: break-even comes out as a small whole number of payers, and the count of payers is zero.

A product nobody pays for and a product nobody has been asked to pay for look identical from the dashboard — no revenue in either case, and both feel like a verdict. Only one of them is, and telling them apart costs one question you have not asked yet.

## Steps

### Where a price comes from when there is nobody to survey

The shape of the price is easiest to take from a competitor: per seat, per action, or per month. Somebody already tested that shape with their own money: [whether that audience pays](/demand/will-they-pay/). Your number then has to clear the worst-case margin floor from [what one user costs](/money/unit-economics/).

Price the unit your event row already records: a minute, a message, a run. If the row carries a cost per action, a package of actions is priceable today, and a price in a unit you do not measure cannot be checked against anything at all.

A pricing study at this size is not worth running, because an answer in a survey is not a purchase. The number of people you could survey is small enough to ask each of them for money instead. One of those answers is worth more than a form full of the other kind.

### Where the wall goes so that it stops something

The wall goes where the product has already worked once, which is after the first real result. Before it, the person is refusing something they have not seen. Long after it, they already have what they came for and there is nothing left to buy.

And the wall has to stop something. A generous free tier with an upgrade prompt collects nothing: the prompt is dismissible, the free tier keeps working, and dismissing it is the rational move on the reader's side. If nothing stops, nobody pays.

### Which limit your user actually meets

One resource, one limit. A balance and a separate daily cap disagree with each other, and the person meets whichever fires first, which is usually not the one you priced.

### Who is holding the money question right now

Name the price inside the product, at the wall itself. A pricing page serves people who came looking for it, and the person standing at the wall is the only one holding the money question at that moment.

### What exactly happens between the wall and the payment

Every step from wall to payment gets its own row: saw the price, opened checkout, started paying, completed, failed. Without those rows "nobody pays" is a single fact with nothing to discuss in it. With them it is five facts, and exactly one of the five is a pricing problem.

```sql
-- generic names; the point is that each step is visible separately
select action, count(distinct user_id) as people
from events
where action in ('price_shown', 'checkout_opened',
                 'payment_started', 'payment_ok', 'payment_failed')
  and created_at >= now() - interval '30 days'
group by action;
```

What the row itself is made of: [what an event row has to carry](/analytics/product-metrics/).

### Whether the payment path works on real money

Buy your own product with real money and then refund yourself — the whole path, not the sandbox. Telegram requires bots selling digital goods inside its apps to use Stars, and they must answer `/paysupport` and check for a successful payment update before delivering.

A checkout that fails quietly reads on a dashboard exactly like nobody wanting the thing, and the only way to tell those apart is to walk the path yourself.

### What one person says when you ask for a real price

While the numbers are unreadable, ask by hand: write to your most engaged users individually. At a handful of weekly actives no funnel means anything, and one person answering a real price settles more than a month of watching the graph.

Store the refusal in the person's own words, because the finding sits in the reason rather than in the no. "I would use the free one" and "my employer would never approve this" are two different products, and only one of them is worth building.

A discount is premature until somebody has refused the full price: a discount off an unasked number tests nothing whatsoever.

### Which engine the first payer arrives on

Move the default engine to the cheap one before you take money — [what one user costs](/money/unit-economics/). The first payer arrives on the default path, and if that path runs your expensive engine, the first sale spends the very margin the sale was meant to prove.

## What did not work

- **Pricing the packages before asking anybody for money.** Three packages shipped, a payment channel connected, and not one real payer. I had priced a thing nobody had yet refused.
- **Treating the payment channel as the blocker.** One provider never came through, connecting a second one took real time, and when it finally worked the count of payers did not move. The channel was never the thing in the way.
- **Defaulting to the most expensive engine.** One config line cost margin, speed and the free allowance at once. People sat watching a placeholder while credits went out of the account.
- **Two independent limits on the same resource.** A credit balance, plus a per-day cap on one engine. The most engaged user of that month hit the cap with credits still unspent, and never came back. My own cap stopped the person standing closest to paying, and never asked him for money.
- **Reading free signups as willingness to pay.** They arrived, used the product and returned, and none of them converted. The signup number kept climbing the whole time.
- **Waiting for the funnel to say something.** At this volume the weekly swing beat any effect I could ship. The funnel turned out to be the wrong instrument and a direct question the right one.
- **Counting my own test purchase as revenue.** The model showed break-even reached for a day. The payer was me, through a test account.
- **Cutting a few dollars of fixed cost while payers were zero.** The denominator was fine already, and no break-even exists without a first payer. The work belonged here, not in the billing console.

## Verify

- Say the price out loud with its unit attached. If that unit is not one your rows record, the price cannot be checked against cost.
- Walk your own product as a new user and count the screens between the first real result and the first mention of money.
- Exhaust the free allowance on a test account. The product has to actually stop, and the message has to name the price.
- Trigger each step between the wall and the payment, then read the rows back. A missing row is a question you will not be able to answer later.
- Make one real purchase with real money, deliver the thing, then refund it through the provider's own method. Confirm the support command answers while you are there.
- Ask one person for money at a real price and store the reply verbatim, refusal included.
- Re-run the revenue aggregation and confirm your own purchase is absent from it.

If the refusals name the free path rather than the number, the problem sits upstream of the price: [whether that audience pays](/demand/will-they-pay/).

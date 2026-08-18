---
title: What one user costs when the product calls an AI
sidebar:
  order: 1
description: Variable cost per action, fixed cost per month, and break-even expressed in payers rather than percentages. How to measure the cost of an action instead of estimating it.
updated: 2026-08-10
sources:
  - Usage and cost on the API response — https://openrouter.ai/docs/use-cases/usage-accounting
  - Credit limits and rate limits — https://openrouter.ai/docs/api-reference/limits
  - Telegram Stars for digital goods — https://core.telegram.org/bots/payments-stars
  - Telegram Bot Payments API — https://core.telegram.org/bots/payments
---

## What we are solving

Every action a user takes spends real money at a provider. Until I know what one action costs, any price I name is a guess with a confident face on it.

Two numbers close the question: the variable cost of serving one action, and the fixed cost of a month in which nobody shows up. Break-even follows from those costs and comes out in payers per month. A margin percentage does not tell you whether to continue. "Two people a month" does.

## Steps

### Which costs grow when somebody shows up

Split the costs into two buckets once, in writing, because fixed and variable get optimised in completely different ways. Fixed is the server, the domain and any plan billed whether or not anyone arrives. Variable is tokens, characters, seconds and per-call fees.

A box running three projects enters this product at its share. You have to say that share out loud. I keep it as a named constant with a comment listing the projects, so when the mix changes I edit one number instead of hunting for it through a model.

### What does one action actually cost

Put the cost of a call on the same event row as the result, and put it there at once, because an hour later there is nowhere left to get it from. Many APIs return usage on the response, and some return the charge itself. If yours returns only quantity, store the quantity and multiply by a rate you keep in a table.

The column and the read off it look roughly like this — the names here are generic, your schema is your own:

```sql
-- filled from the provider's response, in the same request that produced the result
alter table events add column cost_usd numeric(12, 6);

-- how many actions there were, how many carry a price, and what they cost
select count(*)         as actions,
       count(cost_usd)  as priced,
       sum(cost_usd)    as spend
from events
where created_at >= date_trunc('month', now());
```

The thing to read there is the gap between `actions` and `priced`. I never had such a column at all, and I did not know it, so every cost I quoted was reconstructed later by joining a rates table. Rates change, the join takes today's, and the answer about May quietly drifts. On a chart a reconstruction looks exactly like a measurement.

What else belongs on that row, and why it has to be written at insert time: [what an event row has to carry](/analytics/product-metrics/).

### What happens if someone spends a whole package on the expensive engine

Two engines at different prices cannot live in one model until you express the costs in the unit you sell. That unit is credits, minutes or messages — whatever the package is priced in.

Compute the worst case, not the average. A user is entitled to spend an entire package on your most expensive engine. Your margin floor is the lowest margin across packages, evaluated at that engine, and that floor has to be acceptable rather than the average across all of them.

### How much of the ticket actually lands

The payment channel's cut leaves before the margin does, and on a small ticket you see it clearly. Read the channel's own terms. Do not assume the ticket is what arrives.

### How many people close the month

Then the arithmetic all of this was for:

```text
contribution per payer = package price − variable cost of the package − channel fee

break-even             = ceil( fixed monthly cost / contribution per payer )
                         measured in payers per month
```

Rounding up to whole people is not pedantry: you cannot sell to a fraction of one. Substitute your own numbers and something like "two people a month" comes out — a number like that stays in your head and can be said out loud.

### Whether that payer is me

Take your own accounts out as an explicit list of ids, and take them out first, before any aggregation. Count unique payers rather than transactions. Several purchases by one person are one payer, not three.

Skip that and the first payer in your model is you, and nothing in the model will say so.

### Where the model gets its facts, and how it goes stale

Pull the actuals from production, or the model ages without telling you. If the source is unreachable, use the cache but stamp the output with a date, because silent old numbers produce decisions about last quarter.

Keep the formulas in code rather than in spreadsheet cells. Then known inputs become unit tests, and a cell dragged with the mouse cannot rewrite the model on you without warning.

### Which engine nearly everyone actually gets

Make the default the cheapest engine that clears your quality bar. The default is what nearly everyone gets. Your real cost structure is described by the default path, not by the option list in settings. The expensive engine belongs behind a deliberate choice.

## What did not work

- **Defaulting to the most expensive provider.** One config line cost margin, latency and the free allowance at once. Nearly every request went to the paid premium engine while a free one sat idle, answering slowly enough that people watched a placeholder. Every second of it spent credits the free engine would not have.
- **Two independent limits on the same resource.** A credit balance, plus a separate per-day cap on one engine. The most engaged user of that month hit the daily cap with credits still on his balance. He never came back.
- **Reading a key's limit as money.** A key's limit shows a spending ceiling rather than a balance. It happily shows headroom while the account is empty. I learned that inside my own product rather than in the provider's panel — as a payment-required error.
- **Not checking whose key it was.** A key from a local config belonged to another account. That account's credits were the ones going out while mine sat untouched. Establish the owner through the provider's key endpoint before a key goes anywhere near `.env`.
- **Counting my own test purchase as revenue.** The model briefly showed break-even reached. The payer was me, through a test account. My purchase went into the aggregation like anybody else's.
- **Cutting a fixed cost of a few dollars while there were no payers.** The denominator was already fine. The denominator was what I kept shrinking. No break-even is reachable without a first payer. The work belonged on demand, not in the billing console.
- **Keeping rates in a sheet the product never read.** The pricing tables in production were empty. The code ran on a hard-coded fallback. I changed the price several times and nothing reached a user.
- **Building a scenario matrix instead of measuring.** Optimistic and pessimistic columns argued about a margin nobody had earned yet. One recorded cost per action ended the argument.

## Verify

- Trigger one real action, then read the cost stored on its event. A null or a zero means you are estimating and calling it measuring.
- Sum the recorded costs for a month and compare with the provider's own dashboard for the same window. A disagreement means a wrong rate or an unfilled field, and both are worth an hour.
- Check consumption of every free tier against its quota and forecast the days remaining. A free allowance ends at a moment you want to learn about before your users do.
- Ask the provider's API who owns the key and what the account balance is. Neither question is answered by the key's limit.
- Say your break-even out loud as a whole number of payers this month. If you cannot, the model is not finished.
- Re-run the revenue aggregation and confirm your own test purchase is absent from it.

In practice the threshold at this size comes out small, and the payers come out missing. That is a demand problem rather than a cost problem, and it sends you back to [distribution](/distribution/) and to activation instead of another round of savings.

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

Every action a user takes spends real money at a provider, and until I know what one action costs, any price I name is a guess with a confident face on it.

Two numbers close the question: the variable cost of serving one action, and the fixed cost of a month in which nobody shows up. Break-even follows from those two and comes out in payers per month. A margin percentage does not tell you whether to continue, and "two people a month" does.

## Steps

### Which costs grow when somebody shows up

Split the costs into two buckets once, in writing, because the two get optimized in completely different ways. Fixed is the server, the domain and any plan billed whether or not anyone arrives. Variable is tokens, characters, seconds and per-call fees.

A box running three projects enters this product at its share, and that share has to be said out loud. I keep it as a named constant with a comment listing the projects: when the mix changes I edit one number instead of hunting for it through a model.

### What does one action actually cost

The cost of a call goes onto the same event row as the result, and it goes there at once, because an hour later there is nowhere left to get it from. Many APIs return usage on the response, and some return the charge itself. If yours returns only quantity, store the quantity and multiply by a rate you keep in a table.

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

The thing to read there is the gap between `actions` and `priced`. Mine existed, sat nullable and stayed empty for months, so every report quietly fell back to estimated rates. On a chart an estimate looks exactly like a measurement and gives nothing away.

What else belongs on that row, and why it has to be written at insert time: [what an event row has to carry](/analytics/product-metrics/).

### What happens if someone spends a whole package on the expensive engine

Two engines at different prices cannot live in one model until the costs are expressed in the unit you actually sell — credits, minutes, messages, whatever the package is priced in.

And the case to compute is the worst one, not the average, because a user is entitled to spend an entire package on your most expensive engine. Your margin floor is the lowest margin across packages evaluated at that engine, and it is that number that has to be acceptable, not the average across all of them.

### How much of the ticket actually lands

The payment channel's cut leaves before the margin does, and on a small ticket you see it clearly. Read the channel's own terms rather than assuming the ticket is what arrives.

### How many people close the month

Then the arithmetic all of this was for:

```text
contribution per payer = package price − variable cost of the package − channel fee

break-even             = ceil( fixed monthly cost / contribution per payer )
                         measured in payers per month
```

Rounding up to whole people is not pedantry: you cannot sell to a fraction of one. Substitute your own numbers and something like "two people a month" comes out, and a number like that stays in your head and can be said out loud.

### Whether that payer is me

Your own accounts come out as an explicit list of ids, and they come out first, before any aggregation. Count unique payers rather than transactions, too: several purchases by one person are one payer, not three.

Skip that and the first payer in your model is you, and nothing in the model will say so.

### Where the model gets its facts, and how it goes stale

Pull the actuals from production, or the model ages without telling you. If the source is unreachable, use the cache but stamp the output with a date, because silent old numbers produce decisions about last quarter.

The formulas themselves live in code rather than in spreadsheet cells. Then known inputs become unit tests, and a cell dragged with the mouse cannot rewrite the model on you without warning.

### Which engine nearly everyone actually gets

The default has to be the cheapest engine that clears your quality bar, because the default is what nearly everyone gets. Your real cost structure is described by the default path and not by the option list in settings, so the expensive engine belongs behind a deliberate choice.

## What did not work

- **Defaulting to the most expensive provider.** One config line cost margin, latency and the free allowance at once. Nearly every request went to the paid premium engine while a free one sat idle, and it answered slowly enough that people sat watching a placeholder. Each second of that output spent credits the free engine would not have spent.
- **Two independent limits on the same resource.** A credit balance, plus a separate per-day cap on one engine. The most engaged user of that month hit the daily cap with credits still on his balance. He never came back.
- **Reading a key's limit as money.** A key's limit shows a spending ceiling rather than a balance, and it happily shows headroom while the account is empty. I learned that inside my own product rather than in the provider's panel — as a payment-required error.
- **Not checking whose key it was.** A key from a local config belonged to another account, and that account's credits were the ones going out while mine sat untouched. Establish the owner through the provider's key endpoint before a key goes anywhere near `.env`.
- **Counting my own test purchase as revenue.** The model briefly showed break-even reached. The payer was me, through a test account, and my purchase went into the aggregation like anybody else's.
- **Cutting a fixed cost of a few dollars while there were no payers.** The denominator was already fine, and it was the denominator I kept shrinking. No break-even is reachable without a first payer, so the work belonged on demand and not in the billing console.
- **Keeping rates in a sheet the product never read.** The pricing tables in production were empty and the code ran on a hard-coded fallback. I changed the price several times and nothing reached a user.
- **Building a scenario matrix instead of measuring.** Optimistic and pessimistic columns argued about a margin nobody had earned yet. One recorded cost per action ended the argument.

## Verify

- Trigger one real action, then read the cost stored on its event. A null or a zero means you are estimating and calling it measuring.
- Sum the recorded costs for a month and compare with the provider's own dashboard for the same window. A disagreement means a wrong rate or an unfilled field, and both are worth an hour.
- Check consumption of every free tier against its quota and forecast the days remaining. A free allowance ends at a moment you want to learn about before your users do.
- Ask the provider's API who owns the key and what the account balance is. Neither question is answered by the key's limit.
- Say your break-even out loud as a whole number of payers this month. If you cannot, the model is not finished.
- Re-run the revenue aggregation and confirm your own test purchase is absent from it.

In practice the threshold at this size comes out small, and the payers come out missing. That is a demand problem rather than a cost problem, and it sends you back to [distribution](/distribution/) and to activation instead of another round of savings.

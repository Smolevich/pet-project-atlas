---
title: What one user costs when the product calls an AI
description: Variable cost per action, fixed cost per month, and break-even expressed in payers rather than percentages. How to measure the cost of an action instead of estimating it.
updated: 2026-08-10
sources:
  - https://openrouter.ai/docs/use-cases/usage-accounting
  - https://openrouter.ai/docs/api-reference/limits
  - https://core.telegram.org/bots/payments-stars
  - https://core.telegram.org/bots/payments
---

## What we are solving

Every action a user takes spends real money at a provider. Until you know what one action costs, a price is a guess with confidence.

Two numbers close the question. The variable cost of serving one action, and the fixed cost of a month in which nobody shows up.

Break-even follows from those two, expressed in payers per month. A margin percentage does not tell you whether to continue. "Two people a month" does.

## Steps

1. **Split every cost into fixed and variable, in writing** — the two buckets get optimized differently.
   Fixed is the server, the domain and any plan billed whether or not anyone arrives. Variable is tokens, characters, seconds and per-call fees.
2. **Attribute shared costs with an explicit fraction** — a box running three projects enters this product at its share.
   Keep the fraction as a named constant with a comment listing the projects. When the mix changes you edit one number instead of hunting through a model.
3. **Record the cost of each call as it happens** — into the event row, next to the result.
   Many APIs return usage on the response, and some return the charge itself. If yours returns only quantity, store the quantity and multiply by a rate you keep in a table.
4. **Do not leave that field nullable and unfilled** — an empty column is the classic way to fake this.
   Mine existed and stayed empty for months, so every report silently fell back to estimated rates. On a chart an estimate looks exactly like a measurement.
5. **Convert costs into the unit you actually sell** — credits, minutes, messages, whatever the package is priced in.
   Two engines at different prices cannot live in one model until they are expressed per sold unit.
6. **Compute the worst case, not the average** — a user may spend a whole package on your most expensive engine.
   They are entitled to. Your margin floor is the lowest margin across packages, evaluated at that engine. That floor is the number that has to be acceptable.
7. **Subtract the payment channel's cut before the margin** — on a small ticket the fee leaves before anything else.
   Read the channel's own terms rather than assuming the ticket is what lands.
8. **Express break-even as payers per month** — fixed cost divided by contribution per sale.
   Round up to whole people. You cannot sell to a fraction of one, and a whole number stays in your head.
9. **Exclude internal accounts before any aggregation** — an explicit list of your own ids, subtracted first.
   Count unique payers, not transactions. Several purchases by one person are one payer, and your own test purchase is not revenue.
10. **Pull the actuals from production, and stamp stale data** — a model that cannot refresh itself rots.
    If the source is unreachable, use the cache and mark the output stale with a date. Silent old numbers produce decisions about last quarter.
11. **Keep the formulas in code, not in spreadsheet cells** — then known inputs become unit tests.
    A dragged cell can rewrite a model, and nothing will tell you.
12. **Make the default engine the cheapest one that clears your quality bar** — the default is what nearly everyone gets.
    Your real cost structure is the default path, not the option list. The expensive engine belongs behind a deliberate choice.

## What did not work

- **Defaulting to the most expensive provider.** One config line cost margin, latency and the free allowance at once. Nearly every request went to the paid premium engine while a free one sat idle. The premium call was slow enough that people sat watching a placeholder. Each second of its output also spent credits the free engine would not have spent.
- **Two independent limits on the same resource.** A credit balance, plus a separate per-day cap on one engine. The most engaged user of that month hit the daily cap with credits still on his balance. He never came back.
- **Reading a key's limit as money.** A limit is a spending ceiling, not a balance. It can show headroom while the account is empty. The failure then surfaces inside your product as a payment-required error.
- **Not checking whose key it was.** A key from a local config belonged to another account. That account's credits were spent. My own account sat untouched the whole time. Establish the owner through the provider's key endpoint before a key goes anywhere near `.env`.
- **Counting my own test purchase as revenue.** The model briefly showed break-even reached. The payer was me, through a test account.
- **Cutting a fixed cost of a few dollars while there were no payers.** The denominator was already fine. No break-even is reachable without a first payer, so the work belonged on demand.
- **Keeping rates in a sheet the product never read.** The pricing tables in production were empty. The code ran on a hard-coded fallback. I changed the price several times and nothing reached a user.
- **Building a scenario matrix instead of measuring.** Optimistic and pessimistic columns are opinions about margin nobody has earned yet. One recorded cost per action ends that argument.

## Verify

- Trigger one real action, then read the cost stored on its event. A null or a zero means you are estimating and calling it measuring.
- Sum the recorded costs for a month and compare with the provider's own dashboard for the same window. A disagreement means a wrong rate or an unfilled field, and both are worth an hour.
- Check consumption of every free tier against its quota and forecast the days remaining. A free allowance ends at a moment you want to learn before your users do.
- Ask the provider's API who owns the key and what the account balance is. Neither question is answered by the key's limit.
- Say your break-even out loud as a whole number of payers this month. If you cannot, the model is not finished.
- Re-run the revenue aggregation and confirm your own test purchase is absent from it.

In practice the threshold at this size comes out small, and the payers come out missing. That is a demand problem, not a cost problem. It sends you back to [distribution](/distribution/) and to activation, not to another round of savings.

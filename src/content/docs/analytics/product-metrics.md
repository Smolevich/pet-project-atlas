---
title: What an event row has to carry, and where people get stuck
description: The weekly numbers come from somewhere. What one event row must hold to answer questions later, why cost and source belong on it at insert time, and how to find the step where people stop.
updated: 2026-08-12
---

## What we are solving

The weekly list says which numbers to read. It does not say how they are collected, and it cannot say where a person stopped.

"They did not convert" and "the button was below the fold on a phone" produce the same row. One of those is a verdict on demand and the other is an afternoon of work.

An empty column never announces itself. It turns a measured model into an estimated one, and on a chart the two look the same.

## Steps

1. **The row is the record, the dashboard is a view** — what is not on the row is gone.
   A panel can be rebuilt in an afternoon. A field nobody wrote is missing for the whole period it was missing.
2. **Put seven things on every event row** — who, what, when, where from, cost, client, outcome.
   Who is a stable internal id, not a session. What is a name from a closed list. The outcome is `ok` or a named error class, never a boolean.
3. **Write the cost and the source at insert time** — no later join reconstructs either of them.
   The cost is knowable only while the provider's response is still in hand: [what one user costs](/money/unit-economics/). The source is knowable only at first contact: [where the user actually came from](/analytics/attribution/).
4. **Keep event names in a closed list in code** — free text produces four spellings of one step.
   Nothing merges them afterwards. The mapping you write by hand rots at the next rename, quietly.
5. **Keep the raw payload beside the parsed fields** — you will ask a question the parser did not anticipate.
6. **Give every screen between arrival and activation its own event** — a drop needs a location, not only a size.
   Activation is the single action after which a person has the thing you built: [the numbers worth reading weekly](/analytics/what-to-measure/). Everything before it is steps, and every step loses people.
7. **Write a row on first contact, before any action** — otherwise the people who did nothing appear in no table.
   They left on the first screen. They are the verdict on that screen, and an event-only model cannot count them.
8. **Record the client, platform and screen size at first contact** — the phone is a funnel fact.
   Without it, a button below the fold and a lack of interest are the same number.
9. **Log errors with the same identity as events** — user id, the action, the class of input.
   An error line without a user id answers an ops question. The same line with one answers a product question.
10. **Separate a refusal from a failure** — a quota message, an unsupported input and a crash are three things.
    In a funnel they collapse into one failed attempt. They need three different fixes, and only one of them is a bug.
11. **Group failures by input, not by stack trace** — the repeating group is a product boundary.
    You never wrote that boundary down: the format you do not accept, the language you mishandle, the length you truncate.
12. **Read whole sessions end to end, a few every week** — while the volume still allows it.
    At this size one full path says more than any aggregate. Aggregates start earning their place when reading the paths becomes impossible.

## What did not work

- **Building the panel before writing the questions.** Panels that answer nothing still get read every week. I deleted most of my event tables and rebuilt the thing around cost and exhaustion.
- **A cost column left nullable and empty.** For months it held nothing, so reports fell back to estimated rates. On a chart an estimate is indistinguishable from a measurement.
- **The source parameter that arrived and was never stored.** It went into a log line and was dropped there. The links looked instrumented for weeks while nothing reached a row.
- **Not recording the kind of input.** The field appeared late. It said people arrived with a recording already made, not speaking into the chat. Every first screen I had written addressed the other person.
- **Reading the error log as an ops artefact.** It was where I looked when something was down. Grouped by input rather than by time, the same lines described the product's edges.
- **Counting events instead of people.** Three actions by one person read as three users. One test account reads as traction the same way.
- **Having no row for the people who did nothing.** They are the largest group and the harshest signal. No event table contains them, which is exactly why they never came up as a problem.
- **Averaging across everyone instead of cohorts.** Steady signup growth kept the average flat. Retention inside each new cohort was falling.

## Verify

- Trigger one real action and read its row: who, what, when, source, cost, client, outcome. A null in any of those is a question you cannot answer later.
- Pick a person who signed up and never activated. Rebuild their path from rows alone, without opening the code. Where you cannot, an event is missing.
- Count the rows for people who took no action at all. If that count cannot be produced, first contact is not being recorded.
- Take last week's failures and group them by class of input. If they are all one class called error, the log is not instrumented yet.
- Break one number from the weekly list down by source and by client. If it does not break down, the fields are missing from the row.
- Run the same query a month later. A name that no longer parses means the closed list is a comment rather than a constraint.

The numbers this feeds are on [the numbers worth reading weekly](/analytics/what-to-measure/). What each recorded action costs you is on [what one user costs](/money/unit-economics/).

---
title: What an event row has to carry, and where people get stuck
description: The weekly numbers come from somewhere. What one event row must hold to answer questions later, why cost and source belong on it at insert time, and how to find the step where people stop.
updated: 2026-08-12
---

## What we are solving

The weekly list tells you which numbers to read. It does not tell you how they get collected, and it cannot tell you where a person stopped.

"They did not convert" and "the button was below the fold on a phone" produce exactly the same row in most tables. One of those is a verdict on demand and the other is an afternoon of work, and you cannot tell them apart later if the row does not know the difference now.

An empty column never announces itself either. It turns a measured model into an estimated one, and on a chart the estimate and the measurement are the same line.

## Steps

### Why the panel can be rebuilt and the row cannot

What you get to ask later is decided by the row, not by the panel that reads it. A panel that turns out to be wrong is an evening of work. A field nobody wrote is missing for the entire period during which nobody wrote it, and there is no way back.

So the shape of the row is the decision worth spending time on. Seven things go on it — who, what, when, where from, what it cost, on what client, how it ended:

```sql
create table events (
  user_id     bigint      not null,
  name        text        not null,
  created_at  timestamptz not null default now(),
  source      text,
  cost        numeric,
  client      text,
  outcome     text        not null
);
```

`user_id` is a stable internal id rather than a session, because sessions end and the question you will ask later is about a person. `name` comes from a closed list in code. `outcome` is `ok` or a named error class and never a boolean — a boolean throws away the only part of a failure you can act on.

### What has to be written at insert time, because no join brings it back

Cost and source are the two that catch everybody. The cost of an action is knowable only while the provider's response is still in your hand, and the details are on [what one user costs](/money/unit-economics/). The source is knowable only at first contact, which is [where the user actually came from](/analytics/attribution/).

Keep the raw payload beside the parsed fields while you are there. At some point you will ask a question your parser was never written to anticipate, and the raw payload is the difference between answering it and shrugging.

Write a row on first contact too, before the person has done anything at all. Otherwise the ones who arrived and left immediately appear in no table you own, and they are the group your first screen is actually being judged by.

The same moment is when to record the client, the platform and the screen size. A phone changes the funnel and not just the layout: without that field, a button below the fold and a genuine lack of interest are the same number on your chart.

### Which events have to exist for a drop to have a location

Every screen between arrival and activation gets its own event. A drop needs a place, not only a size — knowing that most people leave is useless until you know which screen they were looking at when they left.

Activation is the single action after which a person has the thing you built, and it is defined on [the numbers worth reading weekly](/analytics/what-to-measure/). Everything before it is steps, and every step loses somebody.

Keep the event names in a closed list in code, not as free text passed at the call site. Free text gives you four spellings of one step, nothing merges them afterwards, and the hand-written mapping you build to paper over it rots quietly at the next rename.

### How to read failures so they say something about the product

Log errors with the same identity as events: user id, the action, the class of input. An error line without a user id answers an operations question, which is a fine thing for a line to do at three in the morning. The same line with a user id answers a product question.

Then separate a refusal from a failure. A quota message, an unsupported input and a crash collapse into one failed attempt in a funnel. They need three different fixes, and only one of them is a bug.

Group what is left by input rather than by stack trace. The repeating group is a boundary of your product that you never wrote down anywhere: the format you do not accept, the language you mishandle, the length you silently truncate.

### When aggregates have not earned their place yet

Read whole sessions end to end, a few every week, while the volume still lets you. At this size one complete path tells you more than any average over the same week.

Aggregates start earning their keep at the point where reading the paths stops being physically possible. Until then they are mostly a way of not looking.

## What did not work

- **Building the panel before writing the questions.** I read panels that answered nothing, every week, for longer than I want to write down. In the end I deleted most of my event tables and rebuilt the thing around cost and exhaustion.
- **Leaving my cost column nullable and empty.** For months it held nothing, so every report quietly fell back to estimated provider rates. On a chart an estimate is indistinguishable from a measurement, and I was reading my own guesses back as data.
- **Letting the source parameter arrive and never storing it.** It went into a log line and ended there. My links looked instrumented for weeks while nothing reached a row.
- **Not recording the kind of input.** The field appeared late. Since it exists, most arrivals turn out to carry a recording made somewhere else rather than speech into the chat. That is a direction and not a figure — the counts sit in a database this atlas does not publish. Every first screen I had written up to then was addressed to the other person.
- **Reading my error log as an ops artefact.** It was the place I opened when something was down, and nothing else. Grouped by input instead of by time, the same lines turned out to be describing the edges of the product.
- **Counting events instead of people.** Three actions by one person read as three users, and my own test account read as traction the same way.
- **Having no row for the people who did nothing.** They are the largest group and the harshest signal. No event table contains them, which is exactly why they never came up as a problem in any review of mine.
- **Averaging across everyone instead of cohorts.** The average sat flat while signups grew and I read that as stability. Whether any single cohort was moving, that panel could not have told me.

## Verify

- Trigger one real action and read its row: who, what, when, source, cost, client, outcome. A null in any of those is a question you will not be able to answer later.
- Pick a person who signed up and never activated, then rebuild their path from rows alone, without opening the code.

  ```sql
  select created_at, name, outcome, client
  from events
  where user_id = $1
  order by created_at;
  ```

  Wherever the path has a gap you cannot explain, an event is missing.
- Count the people who took no action at all. If this query cannot be written, first contact is not being recorded.

  ```sql
  select count(*)
  from users u
  where not exists (
    select 1 from events e where e.user_id = u.id
  );
  ```
- Take last week's failures and group them by class of input. If they all fall into one class called `error`, the log is not instrumented yet.
- Break one number from the weekly list down by source and by client. If it does not break down, those fields are not on the row.
- Run the same query a month later. A name that no longer parses means your closed list is a comment rather than a constraint.

No figure appears on this page, so it carries no sources block. What transfers between projects here is the shape of the row, not anybody's counts.

The numbers this feeds are on [the numbers worth reading weekly](/analytics/what-to-measure/). What each recorded action costs you is on [what one user costs](/money/unit-economics/).

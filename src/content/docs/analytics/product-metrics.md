---
title: What an event row has to carry, and where people get stuck
sidebar:
  order: 3
description: The weekly numbers come from somewhere. What one event row must hold to answer questions later, why cost and source belong on it at insert time, and how to find the step where people stop.
updated: 2026-08-13
sources:
  - Voice AI bot database, table usage_events, measured 2026-08-13
---

## What we are solving

The weekly list tells you which numbers to read. It does not tell you how they get collected. And it cannot tell you where a person stopped.

"They did not convert" and "the button was below the fold on a phone" produce the same row in most tables. One of those is a verdict on demand. The other is an afternoon of work. You cannot tell them apart later if the row does not know the difference now.

An empty column never announces itself either. It turns a measured model into an estimated one. On a chart the estimate and the measurement are the same line.

## Steps

### Why the panel can be rebuilt and the row cannot

The row decides what you can ask later. The panel that reads the row decides nothing. A panel that turns out to be wrong is an evening of work. A field nobody wrote is missing for the whole period nobody wrote it. There is no way back.

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

`user_id` is a stable internal id rather than a session. Sessions end, and the question you will ask later is about a person. `name` comes from a closed list in code. `outcome` is `ok` or a named error class, never a boolean. A boolean throws away the only part of a failure you can act on.

### What has to be written at insert time, because no join brings it back

Cost and source are the two that catch everybody. You know the cost of an action only while the provider's response is still in your hand. The details are on [what one user costs](/money/unit-economics/). You know the source only at first contact. That is [where the user actually came from](/analytics/attribution/).

Keep the raw payload beside the parsed fields while you are there. At some point you will ask a question your parser never anticipated. The raw payload is the difference between answering it and shrugging.

Here is my own table failing both of these, read on 13 August 2026. `usage_events` holds 1,180 rows going back to 13 May. Columns whose name contains `cost` or `price`: zero. Columns holding a source: zero.

So every cost figure I have reported about this bot, I got by joining the rates table afterwards. Rates change and the join uses today's. So the answer about May quietly drifts.

The source is worse, because there is nothing to join against. Nobody wrote it, so it does not exist.

There is a third one on the same table, and it dates precisely. A `meta` field was added on 31 May. The 219 rows written between 13 and 30 May have it empty. That is where the kind of input lives — voice message, uploaded file, video. Eighteen days of arrivals I can never sort by what people actually sent.

Write a row on first contact too, before the person has done anything. Otherwise the ones who arrived and left appear in no table you own. And they are the group judging your first screen.

Record the client, the platform and the screen size at the same moment. A phone changes the funnel and not just the layout. Without that field, a button below the fold and a genuine lack of interest are the same number on your chart.

### Which events have to exist for a drop to have a location

Give every screen between arrival and activation its own event. A drop needs a place, not only a size. You know most people leave. That is useless until you know which screen they were looking at.

Activation is the single action after which a person has the thing you built. It is defined on [the numbers worth reading weekly](/analytics/what-to-measure/). Everything before it is steps, and every step loses somebody.

Keep the event names in a closed list in code. Do not pass free text at the call site. Free text gives you four spellings of one step, and nothing merges them afterwards. The hand-written mapping you build to paper over it rots quietly at the next rename.

### How to read failures so they say something about the product

Log errors with the same identity as events: user id, the action, the class of input. An error line without a user id answers an operations question. That is a fine thing for a line to do at three in the morning. The same line with a user id answers a product question.

Then separate a refusal from a failure. A quota message, an unsupported input and a crash are three different events. A funnel collapses them into one failed attempt. They need three different fixes. Only one of them is a bug.

Mine splits almost in half. Of 76 rows marked `error`, 44 are things that broke — a gateway timing out, a file too large, a transcode failing. The other 32 are the bot telling somebody a free limit is used up. That is a pricing decision wearing an error costume. Six different people hit that wall.

And the error column stores the message I show the user, not a code. So the same wall counts as two different failures, split by the language the person reads in. 24 rows carry the Russian sentence, 5 the English one. Nothing in the table knows those are the same event.

The fix is one field with a short name from a closed list. Put it next to the message, not instead of it.

Group what is left by input rather than by stack trace. The repeating group is a boundary of your product that you never wrote down anywhere. It is the format you do not accept, the language you mishandle, the length you silently truncate.

### When aggregates have not earned their place yet

Read whole sessions end to end, a few every week, while the volume still lets you. At this size one complete path tells you more than any average over the same week.

Aggregates start earning their keep when you can no longer physically read the paths. Until then they are mostly a way of not looking.

## What did not work

- **Building the panel before writing the questions.** I read panels that answered nothing, week after week. I kept it up for longer than I want to write down. In the end I deleted most of my event tables and rebuilt the thing around cost and exhaustion.
- **Never adding a cost column at all.** I thought I had left it empty. I opened the table for this page. There is no such column and never was, across all 1,180 rows. Every cost I have quoted I reconstructed later from a rates table. On a chart a reconstruction and a measurement are the same line.
- **Letting the source parameter arrive and never storing it.** It went into a log line and ended there. My links looked instrumented for weeks. Nothing reached a row.
- **Not recording the kind of input.** The field arrived on 31 May, 18 days into the bot's life. The 219 rows before it stay blank forever. Since it exists, uploaded files rival speech into the chat — 256 against 341. Every first screen I had written before that spoke to the other person.
- **Reading my error log as an ops artefact.** I opened it when something was down, and never otherwise. Then I grouped the same lines by input instead of by time. They turned out to describe the edges of the product.
- **Counting events instead of people.** Three actions by one person read as three users. My own test account read as traction the same way.
- **Having no row for the people who did nothing.** They are the largest group and the harshest signal. No event table contains them. That is exactly why they never came up as a problem in any review of mine.
- **Averaging across everyone instead of cohorts.** The average sat flat while signups grew. I read that as stability. Whether any single cohort was moving, that panel could not tell me.

## Verify

- Trigger one real action and read its row: who, what, when, source, cost, client, outcome. A null in any of those is a question you cannot answer later.
- Pick a person who signed up and never activated. Rebuild their path from rows alone, without opening the code.

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
- Take last week's failures and group them by class of input. If they all land in one class called `error`, the log is not instrumented.
- Break one number from the weekly list down by source and by client. If it does not break down, those fields are not on the row.
- Run the same query a month later. A name that no longer parses means your closed list is a comment, not a constraint.

The counts above are from one small bot and prove nothing about yours. What transfers is the shape of the row and the order of the mistakes. That is why I left mine in.

The numbers this feeds are on [the numbers worth reading weekly](/analytics/what-to-measure/). What each recorded action costs you is on [what one user costs](/money/unit-economics/).

---
title: Where the user actually came from
description: A browser sends a referrer, a bot or an app sends nothing. Tagging links, storing the source on first contact, and why the honest answer is often zero rather than approximate.
updated: 2026-08-12
sources:
  - Deep links and the start payload — https://core.telegram.org/bots/features#deep-linking
  - Campaign parameters in a URL — https://support.google.com/analytics/answer/10917952
  - Play Install Referrer library — https://developer.android.com/google/play/installreferrer/library
  - Campaign links in App Store Connect — https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/
---

## What we are solving

Signups arrive and you cannot say which link sent them. On the web that is a reporting problem you can usually clean up later. Inside a bot or a mobile app it is not a reporting problem at all, it is an absence.

A browser sends a referrer by default, so the worst case there is a messy report. A messenger or an app store passes nothing whatsoever unless you ask for it in the link and store it yourself on arrival.

So the honest answer is not "roughly half of them came from that directory". The honest answer is nothing, and no amount of analysis after the fact turns it into something.

## Steps

### Why one venue ends up as four different spellings

Write the vocabulary down before the first link goes out — a fixed list of source values, one per venue, in a file somebody can open. Tagging as you go produces `reddit`, `Reddit`, `reddit-selfhosted` and `r/selfhosted` inside a month, and those four never merge cleanly afterwards because you no longer remember which post used which.

### What counts as a channel, including the ones you own

Every outbound link gets a tag, and that includes your own channel, your own newsletter and your own pinned post. Campaign parameters on the web, a deep-link payload for a bot, a campaign link for an app store.

Skipping your own posts is the tempting shortcut and it costs the most. Untagged, they land in direct traffic, and direct traffic is where you then read word of mouth that never happened.

### Does a real scheme fit in a Telegram deep link

It does, and this page used to claim otherwise. Telegram documents 64 characters of `A-Za-z0-9_-` in the start payload, so the link you hand out looks like this:

```text
https://t.me/my_bot?start=reddit-selfhosted-2026-08-12
```

That payload is 28 characters and carries venue, medium and date with room to spare. Hyphen and underscore are the only separators you get. Pick one, write the choice into the vocabulary above, and never mix the two — a parser that has to guess will eventually guess wrong.

### Where the source goes so that nothing overwrites it

One column on the user row, written server-side, in the insert and nowhere else. The client is the wrong place to keep it: it keeps what it likes, and it vanishes the moment the person opens the product on another device.

```sql
create table users (
  id          bigint primary key,
  source      text,
  source_raw  text,
  created_at  timestamptz not null default now()
);
```

The second column is the raw parameter exactly as it arrived. You will change the scheme at some point and want to re-read the history through the new one, and `source_raw` is the only way that is possible.

Then the write happens once per person and never again:

```sql
insert into users (id, source, source_raw)
values ($1, $2, $3)
on conflict (id) do nothing;
```

`do nothing` is the whole point. A returning visitor carrying a different tag hits the conflict and leaves the original value alone, which is what you want. Last touch is almost always your own link, because returning people come back through your channel, and it overwrites exactly the answer you needed.

### What to record for the arrivals that carry no tag at all

Give them their own bucket and call it `unknown`. Folding them into direct is how a gap in your data turns into a confident wrong conclusion on a chart.

Alongside that, record the cheap context at first contact: landing page, interface language, locale, platform. None of it is attribution, but it survives when the tag does not, and often enough it names the venue on its own.

### How word of mouth ever shows up

Ask the person, once, after they have got something out of the product. One optional question, a few options and a free-text box.

This is not a nicety. Word of mouth carries no tag and is invisible to every technical method on this page, so a self-report is the only place it will ever appear.

Attribution is not reconstructable, and that is the reason this page sits early in the route rather than late. Every day the links stay bare is a day of arrivals nobody will ever be able to classify.

## What did not work

- **Assuming the source was visible by default.** My links were bare, the handler never read the start parameter, and there was no column waiting to hold it if it had. Attribution was not approximate, it was zero, and months of distribution work went unjudged.
- **Reading user geography as a market signal.** The mix was following a metadata field rather than a market. That field turned out to be the alphabet my product name is written in. I built product theories on an artefact of a name.
- **Calling the deep-link parameter too short for a scheme.** This page said a structured value would not fit. Telegram documents 64 characters, the scheme I needed came to 28, and the parameter was never the obstacle — the missing column was.
- **Writing the source on every contact.** Within a few weeks my whole table said "my own channel", because that is where returning people click.
- **Adding the tag but not the column.** The parameter arrived and went into a log line, where it stayed and was rotated away. My links looked instrumented for weeks while nothing was being stored.
- **Trusting referrer in the web analytics tool.** In-app browsers and link previews strip it, and the real referrals then pile up under direct traffic. The report was confidently wrong, which is a worse place to be than empty.
- **Asking "how did you find us" on the first screen.** The question stands between the person and the value, which is precisely where onboarding loses people. The answer is worth less than the step costs.
- **One tag for a whole launch day.** Five venues under one tag told me the launch worked. It did not tell me which of the five to do again, which was the only thing I wanted to know.

## Verify

- Open your own tagged link, sign up through it, then read the row back out of the database. The source value has to be sitting there.
- Come back through a different tagged link. The stored value must be unchanged.
- Check the share of records carrying any source at all, once a week. As the untagged links get fixed it should climb.

  ```sql
  select date_trunc('week', created_at) as week,
         count(*) as signups,
         count(source) as tagged
  from users
  group by week
  order by week desc;
  ```
- Compare self-reported answers against stored tags. Where the two disagree, the tag is usually missing rather than wrong.
- Send yourself a link with a tag your parser has never seen. It must land in `unknown` — not crash, and not quietly become direct.
- Group the stored sources by month and read the venues you have stopped using.

  ```sql
  select date_trunc('month', created_at) as month,
         source,
         count(*)
  from users
  group by month, source
  order by month desc, count(*) desc;
  ```

  A venue you stopped using months ago that still turns up in this month's rows means something is overwriting the column or defaulting it.

The next question is what an arriving user costs you: [what one user costs](/money/unit-economics/).

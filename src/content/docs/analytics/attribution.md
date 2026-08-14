---
title: Where the user actually came from
sidebar:
  order: 1
description: A browser sends a referrer, a bot or an app sends nothing. Tagging links, storing the source on first contact, and why the honest answer is often zero rather than approximate.
updated: 2026-08-12
sources:
  - Deep links and the start payload — https://core.telegram.org/bots/features#deep-linking
  - Campaign parameters in a URL — https://support.google.com/analytics/answer/10917952
  - Play Install Referrer library — https://developer.android.com/google/play/installreferrer/library
  - Campaign links in App Store Connect — https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/
---

## What we are solving

Signups arrive and you cannot say which link sent them. On the web that is a reporting problem, and you can usually clean a report up later. Inside a bot or a mobile app there is nothing to clean: the data is simply not there.

A browser sends a referrer on its own. The worst you get on the web is a messy report. A messenger and an app store send you nothing. You have to ask for the tag in the link and store it yourself the moment somebody arrives.

So the honest answer is not "roughly half of them came from that directory". The honest answer is "I do not know". No amount of analysis after the fact makes something out of nothing.

## Steps

### Why one venue ends up as four different spellings

Write the vocabulary down before the first link goes out. It is a fixed list of source values, one per venue, in a file somebody can open.

Tagging as you go does not work. Inside a month you have `reddit`, `Reddit`, `reddit-selfhosted` and `r/selfhosted`. Those four never merge cleanly afterwards: you no longer remember which post went out with which tag.

### What counts as a channel, including the ones you own

You put a tag on every outbound link. Your own channel, your own newsletter and your own pinned post get one too. On the web the tag lives in campaign parameters. In a bot it lives in the deep-link payload. In an app store it lives in a campaign link.

Skipping your own posts is the easiest shortcut and it costs the most. Untagged, they land in direct traffic. Then you open direct traffic and read word of mouth there that never happened.

### Does a real scheme fit in a Telegram deep link

It does, and this page used to claim otherwise. Telegram documents 64 characters of `A-Za-z0-9_-` in the start payload. The link you hand out looks like this:

```text
https://t.me/my_bot?start=reddit-selfhosted-2026-08-12
```

That payload takes 28 characters. Venue, medium and date are already in it, and there is room left over. You get two separators: a hyphen and an underscore. Pick one, write the choice into the same vocabulary, and never mix the two. A parser that has to guess will eventually guess wrong.

### Where the source goes so that nothing overwrites it

Keep the source in one column on the user row. You write it server-side, in the insert and nowhere else. The client will not do: it keeps what it likes. And it vanishes the moment the person opens the product on another device.

```sql
create table users (
  id          bigint primary key,
  source      text,
  source_raw  text,
  created_at  timestamptz not null default now()
);
```

Put the raw parameter in the second column, exactly as it arrived. At some point you will change the scheme and want to re-read the history through the new one. `source_raw` is the only thing that lets you.

You write it once per person and never again:

```sql
insert into users (id, source, source_raw)
values ($1, $2, $3)
on conflict (id) do nothing;
```

`do nothing` is the whole point. Somebody comes back carrying a different tag, hits the conflict, and leaves the original value alone. That is what you want. Last touch is almost always your own link, because returning people come back through your channel. They overwrite exactly the answer you needed.

### What to record for the arrivals that carry no tag at all

Give them their own bucket and call it `unknown`. Fold them into direct traffic, and a gap in your data turns into a confident wrong conclusion on a chart.

Record the cheap context at first contact while you are there: landing page, interface language, locale, platform. None of it is attribution. But the context survives when the tag does not, and often enough it names the venue on its own.

### How word of mouth ever shows up

Ask the person yourself, once, after they have got something out of the product. One optional question, a few options and a free-text box.

This is not a nicety. Word of mouth carries no tag. No technical method on this page can see it. A self-report is the only place it will ever appear.

You cannot reconstruct attribution afterwards. That is why this page sits early in the route rather than late. Every day the links stay bare is a day of arrivals you will never sort by source.

## What did not work

- **Assuming the source was visible by default.** My links were bare. The handler never read the start parameter. There was no column waiting to hold it either. My attribution was not approximate but zero, and months of distribution work went unjudged.
- **Reading user geography as a market signal.** The mix was following a metadata field rather than a market. That field turned out to be the alphabet my product name is written in. I built product theories on an artefact of a name.
- **Calling the deep-link parameter too short for a scheme.** This page said a structured value would not fit. Telegram documents 64 characters, and the scheme I needed came to 28. The obstacle was never the parameter — it was the missing column.
- **Writing the source on every contact.** Within a few weeks my whole table said "my own channel". Returning people click exactly there.
- **Adding the tag but not the column.** The parameter arrived and went into a log line, where it stayed and was rotated away. My links looked instrumented for weeks. Nothing was being stored.
- **Trusting referrer in the web analytics tool.** In-app browsers and link previews strip it. The real referrals then pile up under direct traffic. My report was confidently wrong, which is worse than empty.
- **Asking "how did you find us" on the first screen.** The question stands between the person and the value. That is precisely where onboarding loses people. The answer is worth less than the extra step costs.
- **One tag for a whole launch day.** Five venues under one tag told me the launch worked. They did not tell me which of the five to do again. That was the only thing I wanted to know.

## Verify

- Open your own tagged link, sign up through it, then read the row back out of the database. The source value has to be sitting there.
- Come back through a different tagged link. The stored value must be unchanged.
- Check the share of records carrying any source at all, once a week. As you fix the untagged links, the share should climb.

  ```sql
  select date_trunc('week', created_at) as week,
         count(*) as signups,
         count(source) as tagged
  from users
  group by week
  order by week desc;
  ```
- Compare self-reported answers against stored tags. Where the two disagree, the tag is usually not wrong. It is simply missing.
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

  You stopped using a venue months ago, and it still turns up in this month's rows. Something is overwriting the column or defaulting it.

The next question is what an arriving user costs you: [what one user costs](/money/unit-economics/).

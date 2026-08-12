---
title: Where the user actually came from
description: A browser sends a referrer, a bot or an app sends nothing. Tagging links, storing the source on first contact, and why the honest answer is often zero rather than approximate.
updated: 2026-08-12
sources:
  - https://core.telegram.org/bots/features#deep-linking
  - https://support.google.com/analytics/answer/10917952
  - https://developer.android.com/google/play/installreferrer/library
  - https://developer.apple.com/help/app-store-connect/view-app-analytics/campaigns/
---

## What we are solving

Signups arrive and you cannot say which link sent them. On the web that is a reporting problem. Inside a bot or a mobile app it is usually an absence.

A browser sends a referrer by default, so the worst case there is a messy report. A messenger or a store passes nothing at all unless you ask for it and store it yourself.

So the honest answer is not "roughly half came from that directory". It is nothing, and no analysis fixes it after the fact.

## Steps

1. **Write the vocabulary down before the first link goes out** — a fixed list of source values, one per venue.
   Ad-hoc tagging produces four spellings of the same directory. They never merge cleanly later.
2. **Tag every outbound link, your own channels included** — one value per venue.
   Campaign parameters on the web, a deep-link payload for a bot, a campaign link for an app. Your own posts are a channel too. Untagged, they land in direct traffic and inflate word of mouth.
3. **Build the source scheme to fit the deep link** — Telegram allows 64 characters of `A-Za-z0-9_-`.
   `reddit-selfhosted-2026-08-12` is 28 of them: venue, medium and date, with room left over.
   Hyphen and underscore are the only separators you get. Pick one, write it into the vocabulary, and never mix the two.
4. **Read the parameter on first contact, store it server-side** — one column on the user row.
   Write it in the insert only. The client is the wrong place: it keeps what it likes, and it vanishes when the person switches device.
5. **Never overwrite the first source** — a later visit carrying a different tag must leave the original value alone.
   Last touch is almost always your own link, because returning people come back through your channel. It overwrites exactly the answer you needed.
6. **Keep the raw parameter next to the parsed value** — you will change the scheme and want to re-read history.
7. **Ask the person once, after they have got something** — one optional question, a few options and a free-text box.
   Word of mouth carries no tag and is invisible to every technical method. This is the only way it ever shows up.
8. **Record cheap context at first contact** — landing page, interface language, locale, platform.
   These survive when the tag is missing, and they often identify the venue on their own.
9. **Give untagged arrivals their own bucket, named unknown** — folding them into direct turns a gap into a false conclusion.

Attribution is not reconstructable. Every day the links stay bare is a day of arrivals you can never classify.

## What did not work

- **Assuming the source was visible by default.** The links were bare. The handler never read the start parameter, and no column existed to hold it. Attribution was not approximate, it was zero, and months of distribution work went unjudged.
- **Reading user geography as a market signal.** The mix followed a metadata field, not the market. The field was the alphabet the product name was written in. I built product theories on an artefact of a name.
- **Calling the deep-link parameter too short for a scheme.** This page said a scheme would not fit. Telegram documents 64 characters, and the scheme I needed was 28. The parameter was never the obstacle; the missing column was.
- **Writing the source on every contact.** Within weeks the whole table said "my own channel". That is where returning people click.
- **Adding the tag but not the column.** The parameter arrived, went into a log line and was dropped. The links looked instrumented for weeks while nothing was stored.
- **Trusting referrer in the web analytics tool.** In-app browsers and link previews strip it. Real referrals then pile up under direct traffic. The report was confidently wrong, which is worse than empty.
- **Asking "how did you find us" on the first screen.** It sits between the person and the value. That is where onboarding loses people, and the answer is worth less than the step costs.
- **One tag for a whole launch day.** Five venues under one tag tells you the launch worked. It does not tell you which venue to repeat.

## Verify

- Open your own tagged link, sign up, then read the row from the database. The source value has to be there.
- Come back through a different tagged link. The stored value must be unchanged.
- Query the share of records carrying any source at all, weekly. Once every link is tagged it should climb toward all of them.
- Compare self-reported answers against stored tags. Where they disagree the tag is usually missing rather than wrong.
- Send yourself a link with a tag your parser does not know. It must land in unknown, not crash and not quietly become direct.
- Group stored sources by month. A venue you stopped using months ago still appearing means something is overwriting or defaulting.

The next question is what an arriving user costs you: [what one user costs](/money/unit-economics/).

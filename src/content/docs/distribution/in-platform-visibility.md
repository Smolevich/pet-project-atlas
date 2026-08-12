---
title: Search inside the platform, not only in Google
description: Telegram, app stores and marketplaces run their own index over a handful of short fields. Which fields those are, and what a name in the wrong script costs.
updated: 2026-08-12
sources:
  - https://core.telegram.org/bots/api#setmyname
  - https://core.telegram.org/bots/features
  - https://developer.apple.com/app-store/search/
  - https://developer.apple.com/app-store/product-page/
  - https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/
  - https://support.google.com/googleplay/android-developer/answer/9898842
---

## What we are solving

If the product lives inside Telegram, an app store or a marketplace, that platform runs its own search. It is a separate index with its own rules, and your website has no influence on it.

The fields it matches are few and short. Put the wrong words in them and the demand walks past.

Nothing breaks and nothing is logged. That is what makes this failure expensive to find.

## Steps

Each platform matches a different set of fields. Learn the set before writing anything.

| Platform | What search matches | What it does not match |
|---|---|---|
| Telegram | Bot name and `@username` | Description and About, read after you are found |
| App Store | Title, subtitle, keywords field, primary category | Description and promotional text |
| Google Play | Title, plus other store listing metadata | — |

1. **Write the name in the words the audience types, in their script** — the function, not only the brand.
   The Bot API allows 0-64 characters for a name. An App Store title is capped at 30, a Google Play title likewise.
2. **Use per-language metadata where it exists** — `setMyName` and `setMyDescription` take a `language_code`.
   You do not have to choose one script. A separate name can be shown to speakers of each language.
3. **Give each remaining field its own job** — a short description holds 120 characters, a full one 512.
   The short one sits on the profile and travels with the link when someone shares it. The long one answers "should I press start".
4. **Spend the keyword budget without repeating yourself** — Apple's keyword field holds 100 bytes, comma-separated.
   Bytes, not characters. ASCII spends one byte a letter, Cyrillic in UTF-8 spends two, so the field is about 50 letters.
   Apple's own product-page guide says 100 characters. The App Store Connect reference says bytes, and that is the one submission enforces.
   Words already in the title or subtitle should not be repeated there. Competitor names in that field are a common rejection reason.
5. **Read the metadata back from the platform** — `getMe` and the `getMy*` methods return what is set.
   Memory is not evidence here, and neither is the console where you typed it. The API response is.
6. **Search the platform as a stranger** — a fresh account, the audience's language, the phrases they would type.
   Write down who comes up. Their names are a free list of the exact words the demand uses.
7. **Tag every external link into the platform** — a start parameter per venue.
   Write it to the user record on first contact only. A repeat start would overwrite the original source with whatever they clicked last.

## What did not work

- **An English-only name while the demand was in another script**. Global search matches the name, so queries in the audience's alphabet could not reach the bot at all. Nothing was broken and nothing was logged.
- **Reading the user base as a market signal**. The geography of signups matched the Latin spelling of the name, not the market I was building for. I spent weeks on product theories about an audience that was an artefact of a metadata field.
- **Assuming the description would carry it**. It had been in the right language the whole time. Search does not match that field, so it changed nothing.
- **Comparing the products instead of the names**. Competitors with the function spelled out in the audience's script were far larger, on the same public APIs. The moat was a name, not technology.
- **Counting characters against a byte limit**. The keyword field takes 100 bytes, and a Cyrillic list spends two bytes a letter. Half the budget I thought I had was gone before I typed anything. Apple's marketing page says characters, and I read that one.
- **Trusting my memory of the name**. Reading it back over the API disagreed with what I believed I had set. Every diagnosis before that check rested on a wrong fact.
- **Publishing links with no start parameter**. The code did not read the parameter either, so attribution was zero rather than approximate. Months of distribution work could not be evaluated.
- **Treating the website as the main door**. The signups arrived from inside the platform, through its own search and links shared in chats. Ranking the site was real work aimed at a channel the audience was not using.

## Verify

- Search from an account that has never used the product, in the audience's language. Note whether you appear at all, and who is above you.
- Read the name, description and short description back over the API. Compare them to what you meant to set.
- Count the characters against the platform's limits before submitting, not after a rejection.
- After a rename, watch the language and locale mix of new signups. It should move toward the script you added.
- Send yourself a tagged link and confirm the parameter is stored on first contact. Start again and confirm it is not overwritten.

Off the platform, the first external links come from somewhere else entirely: [where the first external links come from](/distribution/catalogs/).

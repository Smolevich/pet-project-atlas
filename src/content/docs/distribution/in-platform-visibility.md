---
title: Search inside the platform, not only in Google
description: Telegram, app stores and marketplaces run their own index over a handful of short fields. Which fields those are, and what a name in the wrong script costs.
updated: 2026-08-12
sources:
  - setMyName in the Bot API — https://core.telegram.org/bots/api#setmyname
  - getMyName in the Bot API — https://core.telegram.org/bots/api#getmyname
  - getMe in the Bot API — https://core.telegram.org/bots/api#getme
  - App information in App Store Connect — https://developer.apple.com/help/app-store-connect/create-an-app-record/view-and-edit-app-information
  - Telegram bot profile fields — https://core.telegram.org/bots/features
  - How App Store search works — https://developer.apple.com/app-store/search/
  - Creating an App Store product page — https://developer.apple.com/app-store/product-page/
  - App Store Connect version metadata — https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/
  - Store listing metadata in Google Play — https://support.google.com/googleplay/android-developer/answer/9898842
---

## What we are solving

Your product lives inside Telegram, an app store or a marketplace. Then that platform runs its own search over its own index. Your website has no influence on that index whatsoever.

The fields it matches are few and they are short. Put the wrong words in them and the demand walks straight past you.

Nothing breaks while that happens, and nothing is logged. That is what makes this failure so expensive to find.

## Steps

Each platform matches a different set of fields. Learn the set before writing anything.

| Platform | What search matches | What it does not match |
|---|---|---|
| Telegram | Bot name and `@username` | Description and About, read after you are found |
| App Store | Title, subtitle, keywords field, primary category | Description and promotional text |
| Google Play | Title, plus other store listing metadata | — |

### The name carries the search, so write it in their words

Put the function in the name, not only the brand. And write it in the script your audience types in. Everything else on the profile is read after somebody has already found you.

The budgets are small, which is the whole difficulty:

| Field | Limit |
|---|---|
| Telegram bot name | 0-64 characters |
| App Store title | 30 characters |
| Google Play title | 30 characters |
| Telegram short description | 120 characters |
| Telegram description | 512 characters |
| App Store keywords | 100 bytes |

You do not have to choose one script, either. `setMyName` and `setMyDescription` take a `language_code`. So you show speakers of each language a separate name. That is the cheapest fix on this page.

The two description fields have different jobs. The short one sits on the profile and travels with the link when somebody shares it. The long one answers "should I press start".

### Spending the keyword budget without repeating yourself

Apple's keyword field holds 100 bytes, comma-separated. Bytes, not characters. ASCII spends one byte a letter and Cyrillic in UTF-8 spends two. For a Russian list that is about 50 letters.

Apple's own product-page guide says 100 characters. The App Store Connect reference says bytes. Submission enforces bytes.

Words already in the title or subtitle do not need repeating there. And competitor names in that field are a common rejection reason.

The field is version metadata, not app-wide information. That is why people cannot find it.

Open **Apps**, pick the app, then the version under its platform in the sidebar. **Keywords** sits there with Description and Promotional Text, and it is localizable per language.

Name and Subtitle are app-wide. They live under **App Information**, on a different screen entirely.

### Reading the metadata back off the platform

Ask the platform what is actually set. Your memory is not evidence here. Neither is the console you typed the values into.

`getMe` returns a `User` object — id, username and `first_name`, which is the bot's name. It carries no description at all, so the rest needs its own call.

`getMyName`, `getMyDescription` and `getMyShortDescription` each read back one field, and each takes `language_code`. Pass the audience's language. Otherwise you read the default and conclude you set nothing.

### Searching for yourself as a stranger

A fresh account, the audience's language, the phrases they would actually type. Write down who comes up.

Their names are a free list of the exact words the demand uses. People who already rank for those words assembled the list for you.

### Tagging every link that goes into the platform

One start parameter per venue. Write it to the user record on first contact only.

A repeat start overwrites the original source with whatever they clicked last. Then a venue that worked and a venue that did nothing look identical.

## What did not work

- **An English-only name while the demand was in another script**. Global search matches the name, so queries in the audience's alphabet could not reach the bot at all. Nothing was broken and nothing was logged.
- **Reading the user base as a market signal**. The geography of signups matched the Latin spelling of the name rather than the market I was building for. I spent weeks on product theories about that audience. The audience was an artefact of one metadata field.
- **Assuming the description would carry it**. It had been in the right language the whole time. Search does not match that field, so it changed nothing.
- **Comparing the products instead of the names**. Competitors with the function spelled out in the audience's script were far larger. They ran on the same public APIs. What they had was a name, not technology.
- **Counting characters against a byte limit**. The keyword field takes 100 bytes, and a Cyrillic list spends two bytes a letter. Half the budget I thought I had was gone before I typed anything. Apple's marketing page says characters, and that is the page I read.
- **Trusting my memory of the name**. Reading it back over the API disagreed with what I believed I had set. Every diagnosis before that check rested on a wrong fact.
- **Publishing links with no start parameter**. The code did not read the parameter either. Attribution was zero rather than approximate. Months of distribution work could not be evaluated at all.
- **Treating the website as the main door**. No signup carried a source. So the share I could attribute to the site is unknown: [where the user came from](/analytics/attribution/). Ranking it was real work. I just aimed it at a channel I never showed the audience was using.

## Verify

- Search from an account that has never used the product, in the audience's language. Note whether you appear at all, and who is above you.
- Read the name, description and short description back over the API and compare them to what you meant to set.

  ```bash
  curl -s "https://api.telegram.org/bot$TOKEN/getMyName?language_code=ru"
  ```
- Count the characters against the platform's limits before submitting, not after a rejection.
- After a rename, watch the language and locale mix of new signups. It should move toward the script you added.
- Send yourself a tagged link and confirm the parameter is stored on first contact. Start again and confirm it is not overwritten.

Off the platform, the first external links come from somewhere else entirely: [where the first external links come from](/distribution/catalogs/).

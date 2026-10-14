---
title: Checking whether assistants name you
sidebar:
  order: 4
description: Ten questions, six assistants, logged out, on day 0 and again on day 7. My bot came up in 4 answers and then in 6, and the difference was noise. How to set up the check so that it can say anything at all.
updated: 2026-10-10
sources:
  - Assistant answers by hand, dataset ai-answers-2026-10-03..2026-10-10, measured 2026-10-10
---

## What we are solving

You want to know whether ChatGPT and the others recommend your product. You ask one of them once, it names somebody else, and you have no idea whether that means anything.

I ran the check properly on my voice bot: the same ten questions, the same six assistants, a week apart. The procedure matters more than my result, because one answer tells you almost nothing.

## Steps

1. **Write the questions the way a user types them.** Mine were ten, in two languages, like "how to send text as a voice message in Telegram". Each one is a question my product answers. My brand name is in none of them.
2. **Fix the wording and never change it.** Store the list in a file. On the second run you paste it unchanged, otherwise you are comparing two different tests.
3. **Ask from a clean browser, logged out.** A logged-in assistant knows your history and your own site, so it shows you more of yourself than a stranger would see. Same for search results.
4. **Define a mention before you look.** Mine was strict: my domain or the bot's `@handle` in the answer or in its source cards. The product name alone never appeared once.
5. **Record every cell, including refusals.** Ten questions by six assistants is 60 cells. For each one store the full answer text, a screenshot, the time, and who was named instead of you.
6. **Repeat after the change, and compare totals only.** Every cell is one draw from a random answer, so a single cell flipping from "no" to "yes" proves nothing.

## What did not work

- **Two of the six assistants refused a logged-out user.** Claude showed a sign-in page in all 10 cells on both days. Perplexity answered 9 of 10 on day 0, then refused 9 of 10 on day 7. So the check runs on four assistants, unless you log in and break step 3.
- **Reading a change in a single cell.** On day 0 Google named my bot first in two of its answers. A week later both mentions were gone, and Google mentioned it in a new answer instead. The same question asked in two back-to-back runs also gave a different list of bots.
- **Hoping for an effect inside a week.** I changed pages specifically for these questions. The crawler behind ChatGPT search did not fetch the main changed page during the week, see [edited pages wait for their next crawl](/indexing/edited-pages-wait/).

## Verify

My two runs, 3 and 10 October 2026.

| Assistant | Answered, day 0 / day 7 | Mentions, day 0 → day 7 |
|---|---|---|
| ChatGPT | 10 / 10 | 0 → 3 |
| Perplexity | 9 / 1 | 0 → 1 |
| Google AI Overview | 10 / 10 | 3 → 2 |
| Google AI Mode | 10 / 10 | 1 → 0 |
| Gemini | 10 / 10 | 0 → 0 |
| Claude | 0 / 0 | logged-out access not available |

That is 4 mentions in 49 answers, then 6 in 41. The difference between two single runs lies inside the noise, so I read it as "no evidence either way".

What I did read: on day 7 ChatGPT named the bot exactly in the how-to questions the new article answered. That points at the article, and only a third run on the same questions can confirm it.

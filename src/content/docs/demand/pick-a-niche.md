---
title: Where a niche starts when everything is taken
sidebar:
  order: 1
description: What counts as a pet project, whether it is allowed to take money, and why you look for somebody else's rough edge rather than an empty market. Plus what skipping this step cost me, in numbers.
updated: 2026-08-13
sources:
  - Voice AI bot database, table users, measured 2026-08-13
  - Voice AI bot database, table usage_events, measured 2026-08-13
  - Voice AI bot database, table user_credits, measured 2026-08-13
  - Voice AI bot database, table stars_payments, measured 2026-08-13
---

## What we are solving

You have decided to push a side project. You open a niche and somebody is already sitting in it, usually more than one somebody.

That is true, and it is not a verdict. "Taken" and "done well" are different things, and the second is considerably rarer.

Almost anyone can assemble a product now, and the scarcity has moved because of it. Writing the thing got cheap. Two things stayed hard: being found, and being able to say plainly how you differ.

The second one is what gets skipped. People go and build features without answering it, and below you can see what that cost me.

## Steps

### What counts as a pet project here, and whether it may take money

A pet project is the thing you build outside your job and outside somebody else's plan. It is about who decides, not about a ban on revenue.

Money spoils nothing. If anything the reverse: people use free things happily and tell you nothing at all by doing so. One person who pays says more about the product than a hundred who signed up.

So the money question sits alongside the rest of the route rather than after it. What exactly to charge for — an action or a month — is its own conversation: [the pricing model](/money/pricing-model/).

### There will be no empty niche, and emptiness is the wrong thing to look for

An empty market usually means one of two things: the job does not exist, or nobody pays for it. Both are bad, and that is the first thing worth checking — [whether this audience pays for anything](/demand/will-they-pay/).

A crowded market, on the other hand, is confirmed demand. Somebody has already proved on your behalf that the job exists and that money changes hands over it.

From there a simple thing takes over. Every working competitor has at least one part that is done badly, and it irritates the people who are already paying.

A paying customer is the most patient person in your niche. They spent money and they are inclined to justify the purchase, even to themselves. If they still went and wrote the review, something genuinely got to them.

That is where the research starts. Not "what is missing from this market" but "what is here and grates".

### Where that irritation is already written down

You do not have to extract it with interviews. People have written it all already, for free, with dates on it.

- **Store reviews.** Read the one and two star reviews of paid products, not the average rating. An average is marketing; two stars from a subscriber is a specification.
- **Subject forums and Reddit.** Search for the shape of the complaint rather than the product name: `alternative to`, `switching from`, `X vs Y`, `why I left`.
- **Social feeds, from Instagram to X.** These show you a trend rather than a single complaint: which way of doing the job is rising and which one people are tired of.
- **Your own support, if the product already exists.** The cheapest sample there is, and usually the only unread one.

The search is the same shape every time. Take the competitor's name and attach a word of annoyance to it.

```
site:reddit.com "alternative to <competitor>"
site:reddit.com "<competitor>" (annoying OR "gave up" OR refund)
```

The point is not to collect a list of grievances. The point is to find the repeating one, written by different people in different words. One complaint is a person; ten of the same complaint is a niche.

Being observant matters more than any tool here. The report you want does not exist, but the habit of reading other people's annoyance carefully does.

### What "features first" actually costs

These are my numbers, and they are not about the thing I was afraid of.

Between 12 May and 13 August, 244 people signed up to the bot.

**82 of them did nothing whatsoever.** Not one row in the events table. Sixty-six of those 82 were gone less than a minute after arriving.

155 people got at least one successful result. Of those, **117 used it on exactly one day** and never came back.

Now the second story, the one people are usually warned about — they use it until the free tier runs out. Three of my users reached the end of the free allowance. One of them used the product again afterwards. None of them paid.

So the freemium wall turned out to be a luxury: you have to survive long enough to reach it. The lowest balance among all 244 is 16 credits against an average of 209, and that is after three months of operation.

No new feature would have moved any of these numbers. People left long before they would have seen one.

### How to state the difference in one line

The difference has to sound like a sentence your competitor cannot repeat without rebuilding themselves.

"Easier" and "faster" do not count: everybody says that about themselves and nobody can check it. A usable sentence names a specific irritation and the specific people it gets to.

Say it out loud before the first line of code. If it will not come out, you do not have a difference yet, and it is better to find that out now than at your three hundredth user.

## What did not work

- **Looking for an empty niche.** Empty almost always means nobody pays for the job. The thing to check is not the absence of competitors but the presence of money.
- **Building features instead of answering the difference question.** 82 people out of 244 pressed nothing at all. Not one of my features ever reached them.
- **Expecting people to hit the free limit.** I built the economics around a wall that three people reached. They were not leaving because of it — they left much earlier, and quietly.
- **Reading a competitor's average rating.** The average is the output of marketing. Everything useful sits in the one and two star reviews, and those are the ones to read.
- **Treating a signup as a signal.** 244 signups looked like an audience. One day of use for 117 of them is what it actually was.
- **Believing the difference would occur to me along the way.** It did not. It either exists before the code, or it gets written into the description afterwards and convinces nobody.

## Verify

- Say out loud the name of one live competitor and one thing it does badly. If a second one will not come, the research has not started.
- Find that same complaint from three different people in three different places, with dates. One complaint is a person, not a market.
- Check that at least one of the complainers pays. A free user's grievance is worth less, because they risked nothing.
- State the difference in one sentence without the words "easier" and "faster". A sentence your competitor can repeat word for word is not a difference.
- Look up how many of your own users took no action at all. If that number does not exist, [the event row is not carrying it](/analytics/product-metrics/).

Once you know what you are building and how it differs, the next question is which market to build it for: [which market to build for](/demand/pick-a-market/).

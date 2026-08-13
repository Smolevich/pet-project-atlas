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
  - App Store customer reviews RSS, dataset itunes.apple.com/us/rss/customerreviews/id=1276437113, measured 2026-08-13
  - Otter plans and the per-recording limit — https://otter.ai/pricing
  - Peter Thiel, "Competition Is for Losers" — https://www.wsj.com/articles/peter-thiel-competition-is-for-losers-1410535536
  - Paul Graham on annoyance as a signal — https://paulgraham.com/startupideas.html
  - Capterra terms on automated access — https://www.capterra.com/legal/terms-of-use/
  - G2 terms on automated access — https://legal.g2.com/terms-of-use
  - Pay-per-usage pricing in the X API — https://docs.x.com/x-api/introduction
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

> In the real world outside economic theory, every business is successful exactly to the extent that it does something others cannot.
>
> — Peter Thiel, "Competition Is for Losers", The Wall Street Journal, 12 September 2014. The same argument runs through chapter three of Zero to One.

Worth keeping a second one beside it, about where the idea comes from at all.

> When something annoys you, it could be because you're living in the future.
>
> — Paul Graham, "How to Get Startup Ideas", November 2012. For him irritation is a signal rather than a nuisance.

### Where that irritation is already written down

You do not have to extract it with interviews. People have written it all already, for free, with dates on it.

**The App Store hands over its reviews in one command, with no account.** Find the app id first, then read the feed:

```bash
curl -s 'https://itunes.apple.com/search?term=otter&entity=software&country=us&limit=3'
curl -s 'https://itunes.apple.com/us/rss/customerreviews/page=1/id=1276437113/sortby=mostrecent/json'
```

Fifty reviews a page, around nine pages, then nothing. Every entry carries a date, a rating and the app version — the version tells you which release things started falling apart on. The country sits in the URL, and the same product complains differently in `gb`, `fr` and `de`.

Here is what that feed had. Otter on the Pro plan at $16.99 a month cuts a single recording off at 90 minutes. This is not a malfunction: it is written in their own price list, and four hours per recording only comes with the $30 plan.

On 2 August 2026 somebody on the $99.99-a-year subscription leaves one star.

> Paywalled out of seeing the last 19 minutes of an enthralling conversation.

A week earlier, on 25 July, two stars from somebody else.

> after several years of satisfying service, I am now forced me to move on to other providers

Both were paying, both left, and one line of a price list stopped them. That is the thing you are looking for.

**Count them rather than scrolling them.** I pulled that app's whole feed: 209 one and two star reviews between 16 September 2024 and 3 August 2026. Money and limits account for 118 of them. Speaker labelling accounts for 11.

I had been certain the headline pain in this niche was "which of them is talking". Among paying customers it loses to money by roughly ten to one, and finding that out took ten minutes.

**Forums give you links that will still resolve.** An App Store review has no permanent address — it slides onto another page as soon as newer ones arrive. So quote Discourse forums instead, where every thread has its own URL that will outlive your article.

```bash
curl -s 'https://community.openai.com/search.json?q=transcription+empty'
curl -s 'https://hn.algolia.com/api/v1/search_by_date?query=%22otter.ai%22&tags=comment'
```

Both are open without a key and without an account, checked on 13 August 2026.

**And this part stopped being free, which is where most advice is out of date.** Reddit no longer reads from a script: without OAuth the feed returns 403. Search on X is prepaid now, with no free reading at all. G2 and Capterra both banned headless browsers outright in their 2026 terms, so reading by hand is fine and automating is not.

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

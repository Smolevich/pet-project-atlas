---
title: Where the first external links come from
description: The venues that exist, the card you prepare once, how to tell a live directory from an abandoned one, and why mass submission wastes the week.
updated: 2026-08-10
sources:
  - https://developers.google.com/search/docs/essentials/spam-policies
  - https://www.wikidata.org/wiki/Wikidata:Notability
---

## What we are solving

The pages are written and the site is technically clean, and it still sits on page two for every query that matters. Page one belongs to a competitor and to other people's "best tools for X" lists.

What is missing is authority off your own domain, and nothing you do on the domain closes that. The first move is a handful of places that confirm the project exists at all — the same listings a model reads long before it reads your site.

## Steps

Sort venues before you touch any of them. They cost the same hour and buy different things.

| Kind | Examples | What it buys |
|---|---|---|
| Entity anchors | Wikidata, structured knowledge bases | Recognition as a thing, which every AI answer needs first |
| Category directories and review sites | Software directories, alternative-to listings | A category, a position, a comparison surface |
| Platform-native catalogs | Bot lists, extension and plugin stores | An audience that already has the platform open |
| Other people's listicles | "Top tools for X" articles | The page that is already ranking above you |
| Discussion venues | Forums, Q&A sites, community threads | The shortlists assistants quote back |

### The card you write once, before you open any form

Name, one-line description, category, long description, screenshots, contact, link. Every venue asks for the same fields in a different order, and one card is what keeps the entries consistent. Consistency is what lets scattered mentions merge back into one entity later.

Put a tracking parameter on every link you submit, one value per venue, and do it in the card rather than in the form. Without it you end up with listings and no idea which of them sent anyone, and adding attribution afterwards means going back through every form you filled.

### Is this directory alive, and does search know it

Lists of "best directories" go stale faster than anything else in this field, so check each venue on the day you submit rather than trusting the list.

Fetch the home page first — a 500, a parked page or an expired certificate ends the question before you write a word. Then read the date on the newest listing, because if the freshest entry is a year old, nobody is moderating and your submission joins a queue no human reads.

Search for a competitor's name restricted to that host to see whether the directory's own listing pages are in the index. If they are not, a link from there is invisible to search.

Then open one listing with JavaScript off. A card rendered client-side is an empty page to a crawler, and one request tells you which kind you are dealing with:

```bash
curl -s https://directory.example/listing/competitor | grep -ci competitor
```

Last, check that submissions are moderated at all. A venue that publishes everything instantly filters nothing and passes on nothing, and Google's spam policies name low-quality directory links as link spam.

### The listicle author, not only the directory

That article ranking above you has a byline and a contact. One inclusion in a page that already ranks beats several entries in directories nobody reads.

It is also much harder, and that is the honest part: it needs a name, an email and a reason the author cares. A form needs none of those, which is exactly why I kept filling forms.

### Submitting in small batches, and the log

Venue, date, link submitted, moderation promise, current status. The log records what you did, and that is all it records — directory status is state, not knowledge, so next quarter it is a starting point and not an answer.

### Paying for placement

Paid listings exist and some of them are expensive. Buy one when you know what a signup is worth to you. Before that you are guessing with money instead of guessing with time.

## What did not work

- **Mass submission without a prepared card**. Every form got a slightly different description and a different category, and the result was scattered entries that nothing could merge back into one entity.
- **Trusting a published list of directories**. Working through one, I hit dead hosts and parked domains, and one catalog turned out to index channels rather than the thing I was submitting.
- **Trusting my own notes from last time**. A re-check months later contradicted them in both directions. Hosts I had recorded as dead were serving again, and one I had submitted to had gone, which means that submission had never existed as a listing.
- **Submitting untagged links**. The listings went live and no signup could be traced to any of them. The venues worked or they did not, and I had no way to tell which.
- **Counting submissions as progress**. A form is not a listing, and a listing on a page that search does not index is not a link anyone will follow.
- **Chasing volume in directories**. Bulk entries in low-quality catalogs are a documented spam pattern, and they take the same week you needed for one outreach email.
- **Writing off the entity anchors as impossible**. They have their own inclusion rules and a young project often does not clear them. The venues that do accept you are what eventually builds the case for the ones that did not.

## Verify

- Fetch each listing URL and find your link in the HTML, not in a screenshot of the rendered page.

  ```bash
  curl -s https://directory.example/listing/you | grep -c 'example.com'
  ```
- Search for the listing page itself. If it is not indexed, it passes nothing to you.
- Check analytics for referrals carrying the parameter you attached to that venue.
- Watch for your own name showing up as a query in Search Console. Brand queries are the first sign the entity exists outside your head.
- After a few weeks, ask an assistant for tools in your category, several runs each. Being named at all is the level directories move.

Recognition built off-site is what the on-page work converts: [why AI answers cite someone else](/geo/citable-pages/). Inside a platform the rules are different again: [search inside the platform](/distribution/in-platform-visibility/).

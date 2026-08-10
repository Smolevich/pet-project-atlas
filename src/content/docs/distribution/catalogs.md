---
title: Where the first external links come from
description: The venues that exist, the card you prepare once, how to tell a live directory from an abandoned one, and why mass submission wastes the week.
updated: 2026-08-10
sources:
  - https://developers.google.com/search/docs/essentials/spam-policies
  - https://www.wikidata.org/wiki/Wikidata:Notability
---

## What we are solving

The pages are written and the site is technically clean. It still sits on page two for every query that matters. Page one belongs to a competitor and to other people's "best tools for X" lists.

That gap is off-site authority, and nothing on your own domain closes it. The first move is a handful of places that confirm the project exists.

The same listings feed AI answers. A model learns what you are from directories and threads long before it reads your site.

## Steps

Sort venues before you touch any of them. They cost the same hour and buy different things.

| Kind | Examples | What it buys |
|---|---|---|
| Entity anchors | Wikidata, structured knowledge bases | Recognition as a thing, which every AI answer needs first |
| Category directories and review sites | Software directories, alternative-to listings | A category, a position, a comparison surface |
| Platform-native catalogs | Bot lists, extension and plugin stores | An audience that already has the platform open |
| Other people's listicles | "Top tools for X" articles | The page that is already ranking above you |
| Discussion venues | Forums, Q&A sites, community threads | The shortlists assistants quote back |

1. **Write the card once, before you open any form** — name, one-line description, category, long description, screenshots, contact, link.
   Every venue asks for the same fields in a different order. One card keeps the entries consistent, and consistency is what merges scattered mentions into one entity.
2. **Put a tracking parameter on every link you submit** — one value per venue.
   Without it you get listings and no idea which one sent anyone. Adding attribution later means going back to every form you filled.
3. **Fetch the home page first** — a 500, a parked page or an expired certificate ends the question.
   Lists of "best directories" go stale faster than anything else in this field.
4. **Read the date on the newest listing** — if the freshest entry is a year old, nobody is moderating.
   A submission there joins a queue that no human reads.
5. **Check the directory's own pages are indexed** — search for a competitor's name restricted to that host.
   If its listing pages are not in the index, a link from there is invisible to search.
6. **Open one listing with JavaScript off** — if the card renders client-side only, a crawler sees an empty page.
   You would be linking from a page that, to a bot, contains nothing.
7. **Check that submissions are moderated at all** — a venue that publishes everything instantly filters nothing.
   It also passes on nothing. Low-quality directory links are named in Google's spam policies as link spam.
8. **Aim at the listicle author, not only at the directory** — that article has a byline and a contact.
   One inclusion in a page that already ranks beats several entries in directories nobody reads. It is harder, which is why most people skip it.
9. **Submit in small batches and log them** — venue, date, link submitted, moderation promise, current status.
   The log records what you did. It is not a list you can trust next quarter, because directory status is state, not knowledge.
10. **Do not pay for placement at zero revenue** — paid listings exist and some are expensive.
    Buy one when you know what a signup is worth. Before that you are guessing with money instead of with time.

## What did not work

- **Mass submission without a prepared card**. Every form got a slightly different description and a different category. The result was scattered entries that nothing could merge back into one entity.
- **Trusting a published list of directories**. Working through one, I hit dead hosts and parked domains. One catalog indexed channels, not the thing I was submitting. Check each venue live, on the day you submit.
- **Trusting my own notes from last time**. A re-check months later contradicted them in both directions. Hosts I had recorded as dead were serving again, and one I had submitted to had gone. That submission had never existed as a listing.
- **Submitting untagged links**. The listings went live and the signups could not be traced to any of them. The venues worked or did not, and I had no way to tell which.
- **Counting submissions as progress**. A form is not a listing. A listing on a page that search does not index is not a link anyone will follow.
- **Chasing volume in directories**. Bulk entries in low-quality catalogs are a documented spam pattern, not a strategy. They also take the week you needed for one outreach email.
- **Writing off the entity anchors as impossible**. They have their own inclusion rules, and a young project often does not clear them. The venues that do accept you are what eventually builds the case.

## Verify

- Fetch each listing URL and find your link in the HTML, not in a screenshot of the rendered page.
- Search for the listing page itself. If it is not indexed, it passes nothing to you.
- Check analytics for referrals carrying the parameter you attached to that venue.
- Watch for your own name showing up as a query in Search Console. Brand queries are the first sign the entity exists outside your head.
- After a few weeks, ask an assistant for tools in your category, several runs each. Being named at all is the level directories move.

Recognition built off-site is what the on-page work converts: [why AI answers cite someone else](/geo/citable-pages/). Inside a platform the rules are different again: [search inside the platform](/distribution/in-platform-visibility/).

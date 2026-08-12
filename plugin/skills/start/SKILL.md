---
name: start
description: Route a live pet project through the atlas — run the existing SEO and GEO audits, merge them into one prioritised list, link the page that explains each item, and name three things to do this week. Use when the user says "nobody finds my project", "where do I start with SEO", "audit my site and tell me what to do first", "прогони проект по атласу", or gives a URL and asks what to fix.
user-invocable: true
allowed-tools:
  - Skill
  - Read
  - Bash(ls *)
  - WebFetch
---

# /atlas:start

**This skill runs no checks of its own.** It calls audit skills that already exist and orders their
output against the atlas route. Every finding below comes from `seo-audit` or `geo-audit`. If you find
yourself fetching `robots.txt` by hand, you have left this skill — stop and call the audit instead.

## 1. Ask two questions

Ask both before running anything, and wait for the answers:

1. **The URL of the live site.** Not a staging host, not localhost. The audits read what search reads.
2. **The language the audience searches in.** It decides which results pages matter and what language
   the recommended pages are written in. It is not the language of the interface.

If the project has no public URL — it lives only in Telegram, in a store, or in an app — say so and go
straight to [search inside the platform](https://atlas.smolevich.com/distribution/in-platform-visibility/).
The audits below need a page to fetch.

## 2. Check the audits are installed

```bash
ls ~/.claude/skills/
```

`seo-audit` and `geo-audit` both have to be there.

If either is missing, **say so and stop**. Do not substitute your own checks — a hand-rolled audit is a
worse audit that looks like a real one. Print the install lines and point at the tools page:

```bash
npx skills add coreyhaines31/marketingskills
npx skills add zubair-trabzada/geo-seo-claude
```

What each tool is and where it comes from: <https://atlas.smolevich.com/tools/skills/>.

## 3. Run them, in this order

1. **`seo-audit`** on the URL. Fetch, block, canonical, indexing, on-page, speed.
2. **`geo-audit`** on the same URL. Crawler access, citability, schema, `llms.txt`, platform readiness.

SEO first. Access and indexing decide whether anything else is even read. A citability score for a page
no agent can fetch is a score of a document nobody has.

Keep both raw reports. You will cite lines out of them, not summarise them into adjectives.

## 4. Merge into one list

One list, not two. Drop the composite scores — a score moves when anything moves and tells the reader
nothing to do. Keep the individual findings.

Order by this rule, top down. The first rung that is broken outranks everything below it:

1. **Fetchable** — the page returns body text to a plain client.
2. **Allowed** — `robots.txt`, `noindex`, `X-Robots-Tag`, edge rules.
3. **Indexed** — submitted, discovered, in the index.
4. **Findable** — the pages answer phrases people actually type.
5. **Quotable** — an assistant can lift a passage and attribute it.
6. **Attributed** — you can say which link sent the person.

Deduplicate across the two reports. Both audits flag crawler access; that is one row, not two.

Drop anything the audits report that this project cannot act on this month. A finding nobody will do is
noise in the list.

## 5. Link the page for every item

Each row gets exactly one atlas link. Route by symptom:

| Finding | Page |
|---|---|
| Not fetchable, blocked, `noindex`, wrong canonical, JS-only body | [Google does not see your site](https://atlas.smolevich.com/indexing/why-google-does-not-see-you/) |
| Not submitted, no sitemap, stale URLs, only the home page indexed | [Submit and verify](https://atlas.smolevich.com/indexing/submit-and-verify/) |
| AI crawler blocked, or a published `llms.txt` gone stale | [AI crawlers and llms.txt](https://atlas.smolevich.com/geo/llms-txt-and-crawlers/) |
| Low citability, no JSON-LD, no `sameAs`, assistants cite competitors | [Why AI answers cite someone else](https://atlas.smolevich.com/geo/citable-pages/) |
| No impressions, pages target phrases nobody types, pages compete | [What to write about](https://atlas.smolevich.com/content/keyword-clusters/) |
| Thin page, no answer up top, no failures block, weak titles | [What a page is made of](https://atlas.smolevich.com/content/page-templates/) |
| Page two everywhere, no external links, no mentions | [Where the first links come from](https://atlas.smolevich.com/distribution/catalogs/) |
| The product lives in a messenger or a store | [Search inside the platform](https://atlas.smolevich.com/distribution/in-platform-visibility/) |
| Cannot say which numbers to read, activation unnamed | [The numbers worth reading weekly](https://atlas.smolevich.com/analytics/what-to-measure/) |
| Links untagged, everything reads as direct | [Where the user came from](https://atlas.smolevich.com/analytics/attribution/) |
| It works and costs more than it earns | [What one user costs](https://atlas.smolevich.com/money/unit-economics/) |

A finding with no page in this table still goes in the list, marked as having no atlas page yet. Do not
invent a URL to fill the column.

Output one markdown table: rank, finding, the audit line it came from, the page.

## 6. Close with three things for this week

Exactly three. Not five, not a backlog.

- Take them off the top of the merged list, highest broken rung first.
- Each one is a thing a person finishes in an evening. "Improve content" is not one.
- Each one names how you will know it worked — a command, a report, a number.

Add one line the author cannot get from an audit: **tag your outbound links today if they are not
tagged.** Attribution is the only item on the route that cannot be reconstructed later, so an untagged
week is a week of arrivals nobody will ever classify. That is
[attribution](https://atlas.smolevich.com/analytics/attribution/).

Then point at the full route for what comes after this week:
<https://atlas.smolevich.com/start/>.

## Rules

- Do not invent findings. Everything in the list traces to a line in one of the two reports.
- Do not report a score as an outcome. Report what to change.
- If an audit fails to run, say which one and why. A half audit presented as a whole one is the failure
  mode this skill exists to avoid.

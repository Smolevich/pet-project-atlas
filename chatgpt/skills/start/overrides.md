<!-- replace: description -->
Route a live pet project through the atlas — take the reports of the existing SEO and GEO audits,
merge them into one prioritised list, link the page that explains each item, and name three things to
do this week. Use when the user says "nobody finds my project", "where do I start with SEO", "прогони
проект по атласу", or pastes an SEO or AI-search audit of their site and asks what to fix first.

<!-- replace: preamble -->
# start

**This skill runs no checks of its own.** It orders the output of two audits that already exist,
`seo-audit` and `geo-audit`, against the atlas route. Every finding below comes from one of their
reports. If you find yourself fetching `robots.txt` by hand, you have left this skill — stop and ask
for the report instead.

<!-- replace: ## 2. Check the audits are installed -->
## 2. Get the two audit reports

`seo-audit` and `geo-audit` are open-source skills maintained by other people. They run in a coding
agent on the user's computer, not here. Ask the user to paste or upload the full output of both, run
on the URL from step 1. If either audit is available as a skill in this environment, run it on that
URL instead of asking.

If a report is missing, **say so and stop**. Do not substitute your own checks — a hand-rolled audit is
a worse audit that looks like a real one. Do not try to install anything. Give the user the install
lines to run in their own coding agent, and say who maintains each package:

```bash
npx skills add -g coreyhaines31/marketingskills
npx skills add -g zubair-trabzada/geo-seo-claude
```

`seo-audit` comes from `coreyhaines31/marketingskills`, `geo-audit` from `zubair-trabzada/geo-seo-claude`.
Neither is part of this plugin. Once the user has both reports, they bring them back here.

That is the whole answer when a report is missing. End it there: no questions about the site, no
"meanwhile" tip, no list, no route. The closing line about tagging links in section 6 belongs to a
finished run, not to this one.

What each tool is and where it comes from: <https://atlas.smolevich.com/tools/skills/>.

<!-- replace: ## 3. Run them, in this order -->
## 3. Read them, in this order

1. **`seo-audit`** first. Fetch, block, canonical, indexing, on-page, speed.
2. **`geo-audit`** second. Crawler access, citability, schema, `llms.txt`, platform readiness.

SEO first. Access and indexing decide whether anything else is even read. A citability score for a page
no agent can fetch is a score of a document nobody has.

Check that both reports are for the URL from step 1. If they name another host, say so before merging.

Keep both raw reports. You will cite lines out of them, not summarise them into adjectives.

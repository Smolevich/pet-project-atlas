---
max_turns: 10
allowed_tools: [Skill, Read, Glob]
---

Here is the output of `seo-audit` and `geo-audit` for https://example.com.

seo-audit: 12 pages have a canonical pointing at the home page; `X-Robots-Tag: noindex` is served
on /pricing; LCP is 4.1s on mobile; 3 titles are duplicated.
geo-audit: citability 34/100; no JSON-LD `Organization`; `llms.txt` missing; Cloudflare is
returning 403 to `ChatGPT-User` and `PerplexityBot`.

Give me the list of what to fix, in order.

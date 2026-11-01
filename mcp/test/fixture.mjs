/** Маленький индекс для тестов: три страницы в формате исходников атласа. */
import { buildPage } from '../lib/content.mjs';

const CRAWLERS = `---
title: AI crawlers and llms.txt
description: Which AI agents may read the site and whether llms.txt is worth writing.
updated: 2026-08-13
sources:
  - https://example.com/robots
---

import { Image } from 'astro:assets';

## What we are solving

A crawler that never reaches you cannot cite you.

## Steps

### What goes in robots.txt

Serve \`User-agent: *\` and \`Allow: /\`. Name an agent only to block it.

<Image src={x} alt="robots.txt of a test site" />

### Is llms.txt worth writing

My log recorded no fetches of llms.txt by AI agents in sixteen days.

## Verify

- Fetch robots.txt from outside and read the wildcard rule.
- Grep the access log for GPTBot.
`;

const CHECKLIST = `---
title: The checklist
description: Every item in order.
---

## Steps

- [ ] Read \`robots.txt\`, then check \`noindex\` — [blockers](/indexing/blockers/)
- [ ] Serve \`User-agent: *\` and \`Allow: /\` — [crawlers](/geo/crawlers/)
- [ ] Name a price and ask one person for money — [first payer](/money/first-payer/)
`;

const RU = `---
title: AI-краулеры и llms.txt
description: Каких агентов пускать.
---

## Что решаем

Краулер, который до вас не дошёл, вас не процитирует.

## Проверить

- Скачать robots.txt снаружи.
`;

export const INDEX = {
  version: '9.9.9',
  sections: [
    { slug: 'start', label: 'Start here', ru: 'Начать здесь' },
    { slug: 'geo', label: '3. AI search', ru: '3. AI-поиск' },
    { slug: 'money', label: '7. Money', ru: '7. Деньги' },
  ],
  pages: [
    buildPage('geo/crawlers.mdx', CRAWLERS),
    buildPage('start/checklist.md', CHECKLIST),
    buildPage('ru/geo/crawlers.md', RU),
  ],
};

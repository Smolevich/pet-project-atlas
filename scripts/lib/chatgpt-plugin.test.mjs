import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyOverrides,
  buildManifest,
  forbiddenHits,
  listingProblems,
  neutralizeCommands,
  parseOverrides,
} from './chatgpt-plugin.mjs';

const SKILL = `---
name: report
description: Weekly slice.
user-invocable: true
allowed-tools:
  - Bash(curl *)
---

# /laviolab-atlas:report

Intro.

## Keep

Shared text.

## Swap

Old text.

\`\`\`markdown
## Not a section
\`\`\`

## Drop

Gone.
`;

test('правка заменяет раздел, пустая удаляет, остальное не трогает', () => {
  const out = applyOverrides(SKILL, parseOverrides('<!-- replace: ## Swap -->\n## Swap\n\nNew text.\n\n<!-- replace: ## Drop -->\n'));
  assert.match(out, /## Keep\n\nShared text\./);
  assert.match(out, /New text\./);
  assert.doesNotMatch(out, /Old text|Gone/);
});

test('## внутри блока кода остаётся частью своего раздела', () => {
  const out = applyOverrides(SKILL, parseOverrides('<!-- replace: ## Swap -->\n## Swap\n\nNew.\n'));
  assert.doesNotMatch(out, /## Not a section/);
});

test('из frontmatter уходят настройки Claude Code', () => {
  const out = applyOverrides(SKILL, new Map());
  assert.match(out, /^---\nname: report\ndescription: Weekly slice\.\n---\n/);
});

test('описание можно переписать для ChatGPT', () => {
  const out = applyOverrides(SKILL, parseOverrides('<!-- replace: description -->\nFrom uploaded\nexports.\n'));
  assert.match(out, /^description: From uploaded exports\.$/m);
});

test('правка для исчезнувшего раздела — ошибка, а не тихо старый текст', () => {
  assert.throws(() => applyOverrides(SKILL, parseOverrides('<!-- replace: ## Renamed -->\nx\n')), /Renamed/);
});

test('текст правок вне маркера не теряется молча', () => {
  assert.throws(() => parseOverrides('stray\n<!-- replace: ## Keep -->\nx\n'), /потеряется/);
});

test('команды Claude Code становятся именами скиллов', () => {
  const out = neutralizeCommands('# /laviolab-atlas:report\n\nRun `/laviolab-atlas:content-plan`.', 'laviolab-atlas');
  assert.equal(out, '# report\n\nRun the `content-plan` skill.');
});

test('упоминание Claude ловится, имя чужого репозитория — нет', () => {
  assert.equal(forbiddenHits('npx skills add -g zubair-trabzada/geo-seo-claude').length, 0);
  assert.equal(forbiddenHits('Run it in Claude Code').length, 1);
  assert.equal(forbiddenHits('ls ~/.claude/skills').length, 2);
});

const claude = { name: 'laviolab-atlas', version: '1.2.3', description: 'd', author: { name: 'a' } };
const openai = (ui) => ({
  interface: { displayName: 'LaVioLab Atlas', shortDescription: 'Get found', longDescription: 'x', developerName: 'S', ...ui },
});

test('имя и версия берутся из манифеста Claude, листинг — из ChatGPT', () => {
  const m = buildManifest(claude, openai({}));
  assert.deepEqual([m.name, m.version, m.extensions['com.openai'].interface.displayName], ['laviolab-atlas', '1.2.3', 'LaVioLab Atlas']);
});

test('годный листинг проходит лимиты подачи', () => {
  assert.deepEqual(listingProblems(buildManifest(claude, openai({}))), []);
});

test('подзаголовок длиннее 30 символов не пройдёт подачу', () => {
  const problems = listingProblems(buildManifest(claude, openai({ shortDescription: 'x'.repeat(31) })));
  assert.match(problems.join(), /shortDescription/);
});

test('скриншоты в skills-only ZIP запрещены', () => {
  assert.match(listingProblems(buildManifest(claude, openai({ screenshots: ['./a.png'] }))).join(), /screenshots/);
});

test('больше трёх стартовых промптов не пройдёт подачу', () => {
  assert.match(listingProblems(buildManifest(claude, openai({ defaultPrompt: ['a', 'b', 'c', 'd'] }))).join(), /defaultPrompt/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex } from '../../scripts/build-mcp-index.mjs';
import { checklist, getPage, searchPlaybook } from '../lib/search.mjs';

const index = await buildIndex();

test('каждый пункт чек-листа ведёт на страницу, которая есть в индексе', () => {
  const urls = new Set(index.pages.map((page) => page.url));
  const missing = index.pages.flatMap((page) => page.checklist).filter((item) => item.page && !urls.has(item.page.split('#')[0]));
  assert.deepEqual(missing, []);
});

test('в индексе нет разметки MDX: import и компоненты не долетают до ответа', () => {
  const leaked = index.pages.filter((page) => /^import\s|^\s*<[A-Z]/m.test(page.markdown.replace(/```[\s\S]*?```/g, '')));
  assert.deepEqual(leaked.map((page) => page.url), []);
});

test('версия сервера — версия плагина', async () => {
  const { default: plugin } = await import('../../plugin/.claude-plugin/plugin.json', { with: { type: 'json' } });
  assert.equal(index.version, plugin.version);
});

test('вопрос про llms.txt приводит на страницу о краулерах', () => {
  const urls = searchPlaybook(index, { query: 'is llms.txt worth publishing' }).results.map((r) => r.url);
  assert.ok(urls.some((url) => url.includes('/geo/llms-txt-and-crawlers/')), urls.join('\n'));
});

test('чек-лист по robots.txt и AI-краулерам не пустой', () => {
  assert.ok(checklist(index, { topic: 'robots.txt AI crawlers' }).items.length > 0);
});

test('страница чек-листа читается и по-русски', () => {
  assert.equal(getPage(index, { slug: '/ru/start/checklist/' }).lang, 'ru');
});

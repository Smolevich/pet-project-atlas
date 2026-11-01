import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ToolError, bestQuote, checklist, getPage, listSections, parseSlug, searchPlaybook, stems } from '../lib/search.mjs';
import { INDEX } from './fixture.mjs';

test('единственное и множественное число дают одну основу, по-английски и по-русски', () => {
  assert.deepEqual(stems('crawler crawlers краулер краулеры'), ['crawl', 'crawl', 'краул', 'краул']);
});

test('поиск находит раздел и даёт ссылку прямо на него', () => {
  const [top] = searchPlaybook(INDEX, { query: 'is llms.txt worth it' }).results;
  assert.equal(top.url, 'https://atlas.smolevich.com/geo/crawlers/#is-llmstxt-worth-writing');
});

test('цитата — дословный абзац раздела, где больше слов запроса', () => {
  const quote = bestQuote('Intro about nothing.\n\nMy log recorded no fetches of llms.txt.\n\nOutro.', stems('llms.txt fetches'));
  assert.equal(quote, 'My log recorded no fetches of llms.txt.');
});

test('в цитату не попадает таблица', () => {
  assert.equal(bestQuote('| llms | txt |\n|---|---|\n\nPlain llms text.', ['llms']), 'Plain llms text.');
});

test('русский запрос ищет по русским страницам', () => {
  const urls = searchPlaybook(INDEX, { query: 'краулеры', lang: 'ru' }).results.map((r) => r.url);
  assert.ok(urls.every((url) => url.includes('/ru/')), urls.join(' '));
});

test('запрос без слов — ошибка инструмента, а не пустой ответ', () => {
  assert.throws(() => searchPlaybook(INDEX, { query: '  ?! ' }), ToolError);
});

test('лимит больше десяти урезается до десяти', () => {
  const many = { ...INDEX, pages: Array.from({ length: 30 }, () => INDEX.pages[0]).map((p, i) => ({ ...p, url: `${p.url}${i}/` })) };
  assert.equal(searchPlaybook(many, { query: 'robots', limit: 500 }).results.length, 10);
});

test('длинный абзац обрезается по слову и помечается многоточием', () => {
  const quote = bestQuote(`${'word '.repeat(200)}end`, ['word']);
  assert.ok(quote.length < 430 && quote.endsWith(' …'));
});

test('get_page принимает полный адрес и путь /ru/', () => {
  assert.equal(parseSlug('https://atlas.smolevich.com/ru/geo/crawlers/#x').lang, 'ru');
});

test('страница отдаётся целиком, с источниками и датой замера', () => {
  const page = getPage(INDEX, { slug: 'geo/crawlers' });
  assert.deepEqual([page.updated, page.sources], ['2026-08-13', ['https://example.com/robots']]);
});

test('без русского перевода get_page отдаёт английскую страницу, а не ошибку', () => {
  assert.equal(getPage(INDEX, { slug: 'start/checklist', lang: 'ru' }).lang, 'en');
});

test('неизвестный слаг — ошибка с подсказкой похожих страниц', () => {
  assert.throws(() => getPage(INDEX, { slug: 'geo/crawler' }), /similar: geo\/crawlers/);
});

test('разделы идут в порядке маршрута, пустые не показываются', () => {
  assert.deepEqual(listSections(INDEX).sections.map((s) => s.slug), ['start', 'geo']);
});

test('без темы чек-лист отдаётся целиком и по порядку', () => {
  assert.equal(checklist(INDEX).items.length, 3);
});

test('пункт находится по теме, даже если слово темы есть только в заголовке его страницы', () => {
  const texts = checklist(INDEX, { topic: 'llms.txt' }).items.map((i) => i.text);
  assert.deepEqual(texts, ['Serve `User-agent: *` and `Allow: /`']);
});

test('одно общее слово длинной темы не тянет посторонний пункт', () => {
  const texts = checklist(INDEX, { topic: 'robots.txt noindex for one person' }).items.map((i) => i.text);
  assert.ok(!texts.some((t) => t.startsWith('Name a price')), texts.join(' | '));
});

test('к теме прилагаются шаги Verify подходящей страницы', () => {
  assert.equal(checklist(INDEX, { topic: 'robots.txt' }).verify.steps.length, 2);
});

test('тема, о которой в атласе ничего нет, — ошибка инструмента', () => {
  assert.throws(() => checklist(INDEX, { topic: 'kubernetes autoscaling' }), ToolError);
});

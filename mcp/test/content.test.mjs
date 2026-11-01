import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPage, checklistItems, mdxToMarkdown, slugOf, splitChunks } from '../lib/content.mjs';
import { INDEX } from './fixture.mjs';

test('путь исходника даёт язык и слаг, index — адрес раздела', () => {
  assert.deepEqual(slugOf('ru/geo/index.md'), { lang: 'ru', slug: 'geo' });
});

test('главная получает корневой адрес сайта', () => {
  assert.equal(buildPage('index.mdx', '---\ntitle: Home\n---\n\nText.').url, 'https://atlas.smolevich.com/');
});

test('из MDX уходят import, а компонент оставляет свою подпись', () => {
  const text = mdxToMarkdown("import X from 'y';\n\nBefore.\n\n<Image src={x} alt=\"A chart of fetches\" />\n\nAfter.");
  assert.equal(text, 'Before.\n\n(A chart of fetches)\n\nAfter.');
});

test('многострочный компонент не протекает в текст разметкой', () => {
  const text = mdxToMarkdown('<Histogram\n  title="Fetches by hour"\n  rows={[\n    { label: 1 },\n  ]}\n/>\n\nAfter.');
  assert.equal(text, '(Fetches by hour)\n\nAfter.');
});

test('<Tag> внутри блока кода — пример, а не компонент', () => {
  const text = mdxToMarkdown('```\n<Image alt="x" />\n```');
  assert.match(text, /<Image alt="x" \/>/);
});

test('якорь раздела совпадает с тем, что ставит Starlight', () => {
  const [chunk] = splitChunks('### Is `llms.txt` worth writing\n\nText.');
  assert.equal(chunk.anchor, 'is-llmstxt-worth-writing');
});

test('повторный заголовок получает суффикс, как в HTML', () => {
  const anchors = splitChunks('## Steps\n\na\n\n## Steps\n\nb').map((c) => c.anchor);
  assert.deepEqual(anchors, ['steps', 'steps-1']);
});

test('пункт чек-листа отделяется от ссылки на страницу-объяснение', () => {
  const [item] = checklistItems('- [ ] Serve a wildcard — [crawlers](/geo/crawlers/)', 'en');
  assert.deepEqual(item, { text: 'Serve a wildcard', page: 'https://atlas.smolevich.com/geo/crawlers/', lang: 'en' });
});

test('шаги Verify берутся и из английского, и из русского раздела', () => {
  const steps = INDEX.pages.map((page) => page.verify.length);
  assert.deepEqual(steps, [2, 0, 1]);
});

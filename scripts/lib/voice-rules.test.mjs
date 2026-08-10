import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBannedPhrases, findMissingSections } from './voice-rules.mjs';

test('находит запрещённую фразу и её строку', () => {
  const text = 'Fine line.\nThis is a game-changer for indexing.';
  const hits = findBannedPhrases(text);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].phrase, 'game-changer');
  assert.equal(hits[0].line, 2);
});

test('регистр не спасает', () => {
  const hits = findBannedPhrases('A Game-Changer indeed.');
  assert.equal(hits.length, 1);
});

test('чистый текст не даёт срабатываний', () => {
  assert.deepEqual(findBannedPhrases('Sitemap submitted. 40 pages indexed in 6 days.'), []);
});

test('фраза внутри длинного слова не считается', () => {
  assert.deepEqual(findBannedPhrases('The unlockable achievement'), []);
});

test('основа слова ловится с любым окончанием', () => {
  const hits = findBannedPhrases('Это революционный подход к индексации.');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].phrase, 'революционн');
});

test('основа не ловится в середине другого слова', () => {
  assert.deepEqual(findBannedPhrases('эволюционный путь'), []);
});

test('находит пропущенный блок про фейлы', () => {
  const md = '## What we are solving\nx\n## Steps\ny\n## Verify\nz';
  assert.deepEqual(findMissingSections(md, 'en'), ['What did not work']);
});

test('полный набор блоков не даёт нарушений', () => {
  const md = '## What we are solving\na\n## Steps\nb\n## What did not work\nc\n## Verify\nd';
  assert.deepEqual(findMissingSections(md, 'en'), []);
});

test('русская страница проверяется по русским заголовкам', () => {
  const md = '## Что решаем\na\n## Шаги\nb\n## Что не сработало\nc\n## Проверить\nd';
  assert.deepEqual(findMissingSections(md, 'ru'), []);
});

test('блок с заголовком, но пустым телом считается пропущенным', () => {
  const md = '## What we are solving\na\n## Steps\nb\n## What did not work\n\n## Verify\nd';
  assert.deepEqual(findMissingSections(md, 'en'), ['What did not work']);
});

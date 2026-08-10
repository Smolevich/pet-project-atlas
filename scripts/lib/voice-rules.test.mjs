import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBannedPhrases } from './voice-rules.mjs';

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

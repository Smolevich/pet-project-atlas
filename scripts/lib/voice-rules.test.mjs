import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findBannedPhrases,
  findMissingSections,
  findLongSentences,
  parseFrontmatter,
  findUnsourcedNumbers,
} from './voice-rules.mjs';

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

// "The unlockable achievement" раньше считалось чистым текстом. Это был
// ложный пропуск: "unlock" в списке стоит как основа, и окончание его не
// спасает. Осталась проверка левой границы — она держит "эволюционный".

test('основа слова ловится с любым окончанием', () => {
  const hits = findBannedPhrases('Это революционный подход к индексации.');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].phrase, 'революционный');
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

test('предложение длиннее порога попадает в предупреждения', () => {
  const long = Array.from({ length: 25 }, (_, i) => `word${i}`).join(' ') + '.';
  const hits = findLongSentences(long, 20);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].words, 25);
});

test('короткие предложения молчат', () => {
  assert.deepEqual(findLongSentences('Sitemap submitted. 40 pages indexed.', 20), []);
});

test('блоки кода не проверяются', () => {
  const md = '```\n' + Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ') + '\n```';
  assert.deepEqual(findLongSentences(md, 20), []);
});

test('парсит voice и sources из frontmatter', () => {
  const raw = '---\ntitle: X\nvoice: guest\nsources:\n  - https://a.dev\n---\nbody';
  const { data, body } = parseFrontmatter(raw);
  assert.equal(data.voice, 'guest');
  assert.deepEqual(data.sources, ['https://a.dev']);
  assert.equal(body.trim(), 'body');
});

test('число без sources — нарушение', () => {
  const hits = findUnsourcedNumbers('Traffic grew to 1200 visits.', { sources: [] });
  assert.equal(hits.length, 1);
});

test('число при наличии sources — не нарушение', () => {
  const hits = findUnsourcedNumbers('Traffic grew to 1200 visits.', { sources: ['https://a.dev'] });
  assert.deepEqual(hits, []);
});

test('версии и номера в коде не считаются числами-утверждениями', () => {
  const hits = findUnsourcedNumbers('```\nastro 7.0.2\n```', { sources: [] });
  assert.deepEqual(hits, []);
});

test('версия инструмента не считается утверждением', () => {
  assert.deepEqual(findUnsourcedNumbers('Works on Node 24 and Astro 7.', { sources: [] }), []);
});

test('порядковый номер в заголовке не считается утверждением', () => {
  assert.deepEqual(findUnsourcedNumbers('## 1. Indexing', { sources: [] }), []);
});

test('число в inline-коде не считается утверждением', () => {
  assert.deepEqual(findUnsourcedNumbers('Set `max-age=3600` in the header.', { sources: [] }), []);
});

test('число в ссылке не считается утверждением', () => {
  assert.deepEqual(findUnsourcedNumbers('See [the RFC](https://example.dev/rfc/9110).', { sources: [] }), []);
});

test('измерение остаётся нарушением', () => {
  const hits = findUnsourcedNumbers('Clicks grew to 1200 in six weeks.', { sources: [] });
  assert.equal(hits.length, 1);
});

test('процент остаётся нарушением', () => {
  const hits = findUnsourcedNumbers('Only 4% of signups came from the site.', { sources: [] });
  assert.equal(hits.length, 1);
});

test('ноль как результат остаётся нарушением', () => {
  const hits = findUnsourcedNumbers('Paying users after three months: 0.', { sources: [] });
  assert.equal(hits.length, 1);
});

test('маркер нумерованного списка не считается утверждением', () => {
  assert.deepEqual(findUnsourcedNumbers('1. Check rendering without JavaScript.', { sources: [] }), []);
});

test('число в теле пункта списка остаётся нарушением', () => {
  const hits = findUnsourcedNumbers('2. Clicks grew to 1200 in six weeks.', { sources: [] });
  assert.equal(hits.length, 1);
});

// --- Группа A: ложные срабатывания на числах-неутверждениях ---

const NO_SOURCES = { sources: [] };
const clean = (text) => assert.deepEqual(findUnsourcedNumbers(text, NO_SOURCES), []);

test('цифры внутри адреса почты не считаются утверждением', () => {
  clean('Maintained by Stanislav Shupilkin ([@Smolevich](https://github.com/Smolevich), smolevich90@gmail.com).');
});

test('цифры в никнейме автора не считаются утверждением', () => {
  clean('Written by @user123 of Example.');
});

test('имя продукта с цифрой не считается утверждением', () => {
  clean('Open GA4 and read the report.');
});

test('имя модели с цифрой не считается утверждением', () => {
  clean('Ask GPT-4 about your tool.');
});

test('уровень заголовка H2 не считается утверждением', () => {
  clean('Use H2 headings for the blocks.');
});

test('имя протокола с цифрой не считается утверждением', () => {
  clean('Enable IPv6 on the host.');
});

test('номер стандарта не считается утверждением', () => {
  clean('Read the RFC 9309 spec.');
});

test('год не считается измерением', () => {
  clean('Track INP, not FID, since 2024.');
});

test('порядковый номер в жирном начертании не считается утверждением', () => {
  clean('**1. Indexing** comes first.');
});

test('порядковый номер внутри пункта списка не считается утверждением', () => {
  clean('- 1. Check rendering.');
});

// --- Группа A: бан-лист не должен видеть код и ссылки ---

test('бан-лист не читает содержимое блока кода', () => {
  const md = '```bash\ncurl https://api.example.com/unlock\n```';
  assert.deepEqual(findBannedPhrases(md), []);
});

test('бан-лист не читает inline-код', () => {
  assert.deepEqual(findBannedPhrases('Run `git leverage --help` first.'), []);
});

test('бан-лист не читает URL', () => {
  assert.deepEqual(findBannedPhrases('See https://example.com/leverage/ for details.'), []);
});

test('бан-лист не читает цель markdown-ссылки', () => {
  assert.deepEqual(findBannedPhrases('See [the notes](/tools/unlock/) for details.'), []);
});

test('бан-лист всё ещё видит фразу в прозе рядом с кодом', () => {
  const hits = findBannedPhrases('Run `npm test`. This is a game-changer.');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 1);
});

// --- Группа B: пропуски, которые линтер обязан ловить ---

const flagged = (text) => assert.equal(findUnsourcedNumbers(text, NO_SOURCES).length, 1);

test('десятичная дробь с процентом — измерение, а не версия', () => {
  flagged('Conversion rose to 3.5%.');
});

test('десятичная дробь как цена — измерение, а не версия', () => {
  flagged('The plan costs 9.99 a month.');
});

test('цена с валютой — измерение, а не версия', () => {
  flagged('We charge $4.99 per user.');
});

test('трёхчастная версия остаётся идентификатором', () => {
  clean('Built on Astro 7.0.2 and Starlight 0.41.7.');
});

test('версия с префиксом v остаётся идентификатором', () => {
  clean('Pinned at v1.2 for now.');
});

test('число в строке таблицы остаётся нарушением', () => {
  flagged('| Clicks | 1200 | 40% |');
});

test('число в заголовке остаётся нарушением', () => {
  flagged('## We got 1200 clicks');
});

test('порядковый номер в заголовке по-прежнему не нарушение', () => {
  clean('## 1. Indexing');
});

test('короткое слово перед числом не делает его идентификатором', () => {
  flagged('Signups: es 12 people.');
});

test('склонения английских фраз из бан-листа ловятся', () => {
  assert.equal(findBannedPhrases('We are leveraging the sitemap.').length, 1);
  assert.equal(findBannedPhrases('This unlocks new traffic.').length, 1);
  assert.equal(findBannedPhrases('Let us dive into the data.').length, 1);
  assert.equal(findBannedPhrases('It works seamlessly.').length, 1);
  assert.equal(findBannedPhrases('Pure synergies here.').length, 1);
  assert.equal(findBannedPhrases('A game-changing release.').length, 1);
});

test('склонения русских слов из бан-листа ловятся', () => {
  assert.equal(findBannedPhrases('Часть экосистемы Google.').length, 1);
  assert.equal(findBannedPhrases('Эффект синергии каналов.').length, 1);
});

test('основа не ловится в середине другого слова после расширения списка', () => {
  assert.deepEqual(findBannedPhrases('эволюционный путь'), []);
  assert.deepEqual(findBannedPhrases('Deleveraging is a finance term'), []);
});

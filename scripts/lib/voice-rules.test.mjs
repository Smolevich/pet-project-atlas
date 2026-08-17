import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findBannedPhrases,
  findMissingSections,
  findLongSentences,
  sentenceRhythm,
  antithesisDensity,
  parseFrontmatter,
  findUnsourcedNumbers,
  findNumericClaims,
  findSectionOrderProblems,
  countRequiredSections,
  BANNED_PHRASES,
  BANNED_STEMS,
  REQUIRED_SECTIONS,
  isValidSource,
  findInvalidSources,
  parseProvenance,
  splitTitledSource,
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

// --- Группа C: frontmatter ---

test('кавычки вокруг значения не попадают в значение', () => {
  assert.equal(parseFrontmatter('---\nvoice: "guest"\n---\nbody').data.voice, 'guest');
  assert.equal(parseFrontmatter("---\nvoice: 'guest'\n---\nbody").data.voice, 'guest');
});

test('список в одну строку разбирается как список', () => {
  const raw = '---\nsources: [https://a.dev, https://b.dev]\n---\nbody';
  assert.deepEqual(parseFrontmatter(raw).data.sources, ['https://a.dev', 'https://b.dev']);
});

test('CRLF не ломает разбор frontmatter', () => {
  const raw = '---\r\ntitle: X\r\nvoice: guest\r\nsources:\r\n  - https://a.dev\r\n---\r\nbody\r\n';
  const { data, body } = parseFrontmatter(raw);
  assert.equal(data.voice, 'guest');
  assert.deepEqual(data.sources, ['https://a.dev']);
  assert.equal(body.trim(), 'body');
});

test('вложенный frontmatter не роняет разбор', () => {
  const raw = '---\ntitle: X\nhero:\n  title: X\n  actions:\n    - text: Start\n      link: /start/\n---\nbody';
  const { data } = parseFrontmatter(raw);
  assert.equal(data.title, 'X');
  assert.equal(data.hero.actions[0].link, '/start/');
});

test('без frontmatter тело возвращается целиком и начинается с первой строки', () => {
  const { data, body, bodyStartLine } = parseFrontmatter('# Title\ntext');
  assert.deepEqual(data, {});
  assert.equal(body, '# Title\ntext');
  assert.equal(bodyStartLine, 1);
});

test('bodyStartLine указывает на первую строку тела в файле', () => {
  const raw = '---\ntitle: X\nupdated: 2026-08-10\n---\nfirst body line\n';
  const { bodyStartLine, body } = parseFrontmatter(raw);
  assert.equal(bodyStartLine, 5);
  assert.equal(body.split('\n')[0], 'first body line');
});

test('сломанный YAML отдаётся как ошибка, а не как пустой frontmatter', () => {
  const { error } = parseFrontmatter('---\ntitle: [unclosed\n---\nbody');
  assert.ok(error);
});

// --- Группа D: правила, которые доки обещали, а код не проверял ---

test('четыре блока в обратном порядке — нарушение порядка', () => {
  const md = '## Verify\na\n## What did not work\nb\n## Steps\nc\n## What we are solving\nd';
  assert.deepEqual(findMissingSections(md, 'en'), []);
  assert.equal(findSectionOrderProblems(md, 'en').length, 1);
});

test('порядок соблюдён — нарушения нет', () => {
  const md = '## What we are solving\na\n## Steps\nb\n## What did not work\nc\n## Verify\nd';
  assert.deepEqual(findSectionOrderProblems(md, 'en'), []);
});

test('лишний H2 перед четвёркой — нарушение порядка', () => {
  const md = '## Intro\nx\n## What we are solving\na\n## Steps\nb\n## What did not work\nc\n## Verify\nd';
  assert.equal(findSectionOrderProblems(md, 'en').length, 1);
});

test('лишний H2 после четвёрки — не нарушение', () => {
  const md = '## What we are solving\na\n## Steps\nb\n## What did not work\nc\n## Verify\nd\n## Notes\ne';
  assert.deepEqual(findSectionOrderProblems(md, 'en'), []);
});

test('пропущенный блок не превращается ещё и в ошибку порядка', () => {
  const md = '## Steps\nb\n## Verify\nd';
  assert.deepEqual(findSectionOrderProblems(md, 'en'), []);
});

test('русские блоки проверяются на порядок по-русски', () => {
  const md = '## Проверить\na\n## Что не сработало\nb\n## Шаги\nc\n## Что решаем\nd';
  assert.equal(findSectionOrderProblems(md, 'ru').length, 1);
});

test('заголовки внутри блока кода не считаются заголовками страницы', () => {
  const md = '```markdown\n## What we are solving\n## Steps\n## What did not work\n## Verify\n```\nreal text';
  assert.deepEqual(findMissingSections(md, 'en'), REQUIRED_SECTIONS.en);
  assert.equal(countRequiredSections(md, 'en'), 0);
});

test('блок, под которым только код, не считается пустым', () => {
  const md = '## What we are solving\na\n## Steps\n```\nnpm test\n```\n## What did not work\nc\n## Verify\nd';
  assert.deepEqual(findMissingSections(md, 'en'), []);
});

test('перенос строки не прячет длинное предложение', () => {
  const words = Array.from({ length: 40 }, (_, i) => `w${i}`);
  const md = [words.slice(0, 15).join(' '), words.slice(15, 30).join(' '), words.slice(30).join(' ') + '.'].join('\n');
  const hits = findLongSentences(md, 20);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].words, 40);
  assert.equal(hits[0].line, 1);
});

test('соседние абзацы не склеиваются в одно предложение', () => {
  const short = Array.from({ length: 15 }, (_, i) => `w${i}`).join(' ') + '.';
  assert.deepEqual(findLongSentences(`${short}\n\n${short}`, 20), []);
});

test('соседние пункты списка не склеиваются', () => {
  const bullet = '- ' + Array.from({ length: 15 }, (_, i) => `w${i}`).join(' ') + '.';
  assert.deepEqual(findLongSentences(`${bullet}\n${bullet}`, 20), []);
});

test('заголовок не приклеивается к следующему абзацу', () => {
  const short = Array.from({ length: 15 }, (_, i) => `w${i}`).join(' ') + '.';
  assert.deepEqual(findLongSentences(`## Steps\n${short}`, 20), []);
});

test('строки таблицы по длине не считаются', () => {
  const row = '| ' + Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ') + ' |';
  assert.deepEqual(findLongSentences(row, 20), []);
});

test('номер строки указывает на предложение, а не на начало абзаца', () => {
  const short = 'Short one.';
  const long = Array.from({ length: 25 }, (_, i) => `w${i}`).join(' ') + '.';
  const hits = findLongSentences(`${short}\n${long}`, 20);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 2);
});

test('findNumericClaims видит число независимо от sources', () => {
  assert.equal(findNumericClaims('Traffic grew to 1200 visits.').length, 1);
  assert.deepEqual(findNumericClaims('Works on Node 24 and Astro 7.'), []);
});

test('countRequiredSections считает объявленные блоки', () => {
  assert.equal(countRequiredSections('## Steps\nx', 'en'), 1);
  assert.equal(countRequiredSections('Just navigation links.', 'en'), 0);
});

// --- Группа E: экспортированные константы действительно описывают правило ---

test('бан-лист хранится в нижнем регистре — иначе сверка регистра мимо', () => {
  for (const phrase of [...BANNED_PHRASES, ...BANNED_STEMS]) {
    assert.equal(phrase, phrase.toLowerCase());
  }
});

test('в обоих языках ровно четыре обязательных блока', () => {
  assert.equal(REQUIRED_SECTIONS.en.length, 4);
  assert.equal(REQUIRED_SECTIONS.ru.length, 4);
});

// --- Группа F: источник может быть не только URL ---

const PROVENANCE = 'Search Console, property atlas.smolevich.com, measured 2026-08-10';

test('URL остаётся годным источником', () => {
  assert.equal(isValidSource('https://example.dev/notes/'), true);
  assert.equal(isValidSource('http://example.dev/notes/'), true);
});

test('строка происхождения годится как источник', () => {
  assert.equal(isValidSource(PROVENANCE), true);
  assert.equal(isValidSource('Plausible, site atlas.smolevich.com, measured 2026-08-10'), true);
  assert.equal(isValidSource('psql, dataset signup_events, measured 2026-01-31'), true);
});

test('своё измерение с строкой происхождения снимает ошибку про источник', () => {
  assert.deepEqual(findUnsourcedNumbers('Clicks grew to 1200.', { sources: [PROVENANCE] }), []);
});

test('расплывчатая ссылка на себя источником не считается', () => {
  assert.equal(isValidSource('my own data'), false);
  assert.equal(isValidSource('my own data, my own data, measured 2026-08-10'), false);
  assert.equal(isValidSource('Search Console, my own data, measured 2026-08-10'), false);
  assert.equal(isValidSource('Search Console, property atlas.smolevich.com'), false);
  assert.equal(isValidSource('Search Console, property atlas.smolevich.com, measured вчера'), false);
  assert.equal(isValidSource('Search Console, property atlas.smolevich.com, measured 2026-13-40'), false);
  assert.equal(isValidSource('Search Console, atlas.smolevich.com, measured 2026-08-10'), false);
  assert.equal(isValidSource('Search Console, property x, measured 2026-08-10'), false);
});

test('негодный источник не открывает страницу числам', () => {
  const hits = findUnsourcedNumbers('Clicks grew to 1200.', { sources: ['my own data'] });
  assert.equal(hits.length, 1);
});

test('негодные записи в sources возвращаются отдельно', () => {
  assert.deepEqual(findInvalidSources({ sources: ['https://a.dev', PROVENANCE] }), []);
  assert.deepEqual(findInvalidSources({ sources: ['my own data'] }), ['my own data']);
  assert.deepEqual(findInvalidSources({ sources: [] }), []);
  assert.deepEqual(findInvalidSources({}), []);
});

// --- Группа G: у ссылки может быть заголовок ---

test('ссылка с заголовком остаётся годным источником', () => {
  assert.equal(isValidSource('Отчёт Performance — https://support.google.com/webmasters/answer/7576553'), true);
});

test('заголовок отделяется от адреса и обрезается', () => {
  assert.deepEqual(splitTitledSource('Отчёт Performance  —  https://example.dev/a'), {
    title: 'Отчёт Performance',
    url: 'https://example.dev/a',
  });
});

test('тире внутри заголовка не рвёт запись', () => {
  // Тире — часть голоса сайта, и в заголовке оно законно. Делим по
  // последнему разделителю, иначе адресом становится хвост заголовка.
  assert.deepEqual(splitTitledSource('Pay per crawl — что это такое — https://example.dev/a'), {
    title: 'Pay per crawl — что это такое',
    url: 'https://example.dev/a',
  });
});

test('запись без тире заголовка не получает', () => {
  assert.equal(splitTitledSource('https://example.dev/a'), null);
  assert.equal(splitTitledSource(PROVENANCE), null);
});

test('заголовок без годного адреса источником не считается', () => {
  assert.equal(isValidSource('Просто мысль — не адрес'), false);
  assert.equal(isValidSource('Почта — mailto:someone@example.com'), false);
  assert.equal(isValidSource(' — https://example.dev/a'), false);
});

test('заголовок не превращает выдуманный замер в источник', () => {
  // Регрессия: разбор заголовка не должен открывать обход проверки §4 —
  // строка происхождения по-прежнему обязана быть полной.
  assert.equal(isValidSource('Мои данные — my own data'), false);
  assert.equal(findInvalidSources({ sources: ['Мои данные — my own data'] }).length, 1);
});

test('строка происхождения разбирается на части', () => {
  assert.deepEqual(parseProvenance('Search Console API, property telegram-voice-bot, measured 2026-08-12'), {
    instrument: 'Search Console API',
    scope: 'property',
    identifier: 'telegram-voice-bot',
    measured: '2026-08-12',
  });
});

test('область замера приводится к нижнему регистру, идентификатор — нет', () => {
  assert.deepEqual(parseProvenance('psql, TABLE Usage_Events, measured 2026-01-31'), {
    instrument: 'psql',
    scope: 'table',
    identifier: 'Usage_Events',
    measured: '2026-01-31',
  });
});

test('негодная строка происхождения частей не даёт', () => {
  assert.equal(parseProvenance('Search Console, property atlas.smolevich.com'), null);
  assert.equal(parseProvenance('my own data, my own data, measured 2026-08-10'), null);
});

test('alt-текст картинки не проза и под длину не проверяется', () => {
  const md = '<Image src={x} alt="' + Array.from({length: 40}, (_, i) => `слово${i}`).join(' ') + '" />';
  assert.deepEqual(findLongSentences(md, 32), []);
});

test('текст рядом с картинкой проверяется как обычно', () => {
  const md = '<Image src={x} alt="короткий alt" />\n\n' + Array.from({length: 35}, (_, i) => `w${i}`).join(' ') + '.';
  assert.equal(findLongSentences(md, 32).length, 1);
});

test('ровные фразы одной длины дают низкий разброс', () => {
  const md = Array.from({length: 20}, (_, i) => `Слово одно два три ${i}.`).join(' ');
  const rhythm = sentenceRhythm(md);
  assert.ok(rhythm.spread < 1, `разброс ${rhythm.spread} должен быть около нуля`);
});

test('короткие вперемешку с длинными дают высокий разброс', () => {
  const short = 'Так оно вышло.';
  const long = Array.from({length: 30}, (_, i) => `слово${i}`).join(' ') + '.';
  const rhythm = sentenceRhythm(Array.from({length: 10}, () => `${short} ${long}`).join(' '));
  assert.ok(rhythm.spread > 7, `разброс ${rhythm.spread} должен быть заметным`);
});

test('на коротком тексте про ритм не судим', () => {
  assert.equal(sentenceRhythm('Одна фраза. И вторая.'), null);
});

test('пункты списка в разброс не идут — параллельный список не рванина', () => {
  const list = Array.from({length: 20}, (_, i) => `- Пункт списка номер ${i}.`).join('\n');
  const rhythm = sentenceRhythm(list);
  assert.equal(rhythm.spread, null, 'по одним пунктам разброс считать нечему');
  assert.ok(rhythm.sentences >= 15, 'сами предложения при этом посчитаны');
});

test('плотность «а не» считается на тысячу слов', () => {
  const filler = Array.from({ length: 500 }, (_, i) => `слово${i}`).join(' ');
  assert.equal(antithesisDensity(`${filler} а не ещё`).hits, 1);
  assert.equal(antithesisDensity('коротко, а не длинно'), null, 'на коротком тексте не судим');
});

test('«а не» внутри слова не считается', () => {
  const filler = Array.from({ length: 300 }, (_, i) => `w${i}`).join(' ');
  assert.equal(antithesisDensity(`${filler} панель`).hits, 0);
});

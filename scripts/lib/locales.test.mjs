import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  docUrlPath,
  dropUnwrittenAlternates,
  hasRussianVersion,
  isFallbackPath,
  originalPath,
  pointAtOriginal,
  readDocFiles,
  russianPath,
  writtenTranslations,
} from './locales.mjs';

const WRITTEN = new Set(['/ru/', '/ru/indexing/', '/ru/indexing/submit-and-verify/']);

const alternate = (hreflang, href) => ({ tag: 'link', attrs: { rel: 'alternate', hreflang, href } });

const headOf = (pathname) => [
  { tag: 'title', content: 'Unit economics' },
  { tag: 'link', attrs: { rel: 'canonical', href: `https://atlas.smolevich.com${pathname}` } },
  { tag: 'meta', attrs: { property: 'og:url', content: `https://atlas.smolevich.com${pathname}` } },
  alternate('en', 'https://atlas.smolevich.com/money/unit-economics/'),
  alternate('ru', 'https://atlas.smolevich.com/ru/money/unit-economics/'),
  alternate('x-default', 'https://atlas.smolevich.com/money/unit-economics/'),
];

const hreflangs = (head) =>
  head.filter((tag) => tag.attrs?.rel === 'alternate').map((tag) => tag.attrs.hreflang);

const attr = (head, find, key) => head.find(find)?.attrs[key];
const canonicalOf = (head) => attr(head, (tag) => tag.attrs?.rel === 'canonical', 'href');
const ogUrlOf = (head) => attr(head, (tag) => tag.attrs?.property === 'og:url', 'content');

test('адрес страницы считается по файлу, index сворачивается в каталог', () => {
  assert.equal(docUrlPath('index.mdx'), '/');
  assert.equal(docUrlPath('ru/index.mdx'), '/ru/');
  assert.equal(docUrlPath('ru/start/index.md'), '/ru/start/');
  assert.equal(docUrlPath('ru/start/checklist.md'), '/ru/start/checklist/');
  assert.equal(docUrlPath('money/unit-economics.md'), '/money/unit-economics/');
});

test('оригинал русского адреса — тот же путь без префикса локали', () => {
  assert.equal(originalPath('/ru/money/unit-economics/'), '/money/unit-economics/');
  assert.equal(originalPath('/ru/'), '/');
  assert.equal(originalPath('/ru'), '/');
  assert.equal(originalPath('/money/'), '/money/');
});

test('русский адрес строится из любой локали, а не только из английской', () => {
  assert.equal(russianPath('/money/'), '/ru/money/');
  assert.equal(russianPath('/ru/money/'), '/ru/money/');
  assert.equal(russianPath('/'), '/ru/');
});

test('fallback — русский адрес без написанной страницы', () => {
  assert.equal(isFallbackPath('/ru/money/unit-economics/', WRITTEN), true);
  assert.equal(isFallbackPath('/ru/indexing/', WRITTEN), false);
  assert.equal(isFallbackPath('/ru/', WRITTEN), false);
});

test('английский адрес не бывает fallback: его нельзя выкинуть из sitemap', () => {
  assert.equal(isFallbackPath('/money/unit-economics/', WRITTEN), false);
  assert.equal(isFallbackPath('/', WRITTEN), false);
});

test('перевод ищется по паре адресов, а не по локали текущего', () => {
  assert.equal(hasRussianVersion('/indexing/', WRITTEN), true);
  assert.equal(hasRussianVersion('/ru/indexing/', WRITTEN), true);
  assert.equal(hasRussianVersion('/money/unit-economics/', WRITTEN), false);
});

test('русская альтернатива снимается со страницы, которую не переводили', () => {
  const head = dropUnwrittenAlternates(headOf('/money/unit-economics/'), {
    isFallback: false,
    hasRussian: false,
  });
  assert.deepEqual(hreflangs(head), ['en', 'x-default']);
});

test('переведённая пара сохраняет оба hreflang', () => {
  const english = dropUnwrittenAlternates(headOf('/indexing/'), {
    isFallback: false,
    hasRussian: true,
  });
  const russian = dropUnwrittenAlternates(headOf('/ru/indexing/'), {
    isFallback: false,
    hasRussian: true,
  });
  assert.deepEqual(hreflangs(english), ['en', 'ru', 'x-default']);
  assert.deepEqual(hreflangs(russian), ['en', 'ru', 'x-default']);
});

test('fallback-страница не заявляет ни одного языка', () => {
  const head = dropUnwrittenAlternates(headOf('/ru/money/unit-economics/'), {
    isFallback: true,
    hasRussian: false,
  });
  assert.deepEqual(hreflangs(head), []);
});

test('из <head> убираются только альтернаты', () => {
  const head = dropUnwrittenAlternates(headOf('/money/unit-economics/'), {
    isFallback: true,
    hasRussian: false,
  });
  assert.deepEqual(
    head.map((tag) => tag.tag),
    ['title', 'link', 'meta'],
  );
});

test('canonical и og:url fallback-страницы указывают на английский оригинал', () => {
  const head = pointAtOriginal(headOf('/ru/money/unit-economics/'));
  assert.equal(canonicalOf(head), 'https://atlas.smolevich.com/money/unit-economics/');
  assert.equal(ogUrlOf(head), 'https://atlas.smolevich.com/money/unit-economics/');
});

test('английский canonical переписыванием не задевается', () => {
  const head = pointAtOriginal(headOf('/money/unit-economics/'));
  assert.equal(canonicalOf(head), 'https://atlas.smolevich.com/money/unit-economics/');
});

test('в переводы попадают только русские адреса', () => {
  const written = writtenTranslations(['index.mdx', 'ru/index.mdx', 'money/unit-economics.md']);
  assert.deepEqual([...written], ['/ru/']);
});

test('id коллекции и путь файла дают один и тот же адрес', () => {
  assert.deepEqual([...writtenTranslations(['ru/start/index.md'])], ['/ru/start/']);
  assert.deepEqual([...writtenTranslations(['ru/start'])], ['/ru/start/']);
});

// Список переведённых страниц меняется по мере перевода, поэтому проверяем
// правило, а не сегодняшний снимок: адрес попадает в набор тогда и только
// тогда, когда под ru/ лежит файл.
test('переводы, прочитанные с диска, совпадают с написанными страницами', () => {
  const root = new URL('../../src/content/docs/', import.meta.url);
  const files = readDocFiles(root);
  const written = writtenTranslations(files);

  for (const url of written) {
    assert.match(url, /^\/ru\//, `в набор попал нерусский адрес: ${url}`);
  }
  assert.equal(written.size, files.filter((f) => f.startsWith('ru/')).length);
  assert.equal(written.has('/ru/такой-страницы-нет/'), false);
});

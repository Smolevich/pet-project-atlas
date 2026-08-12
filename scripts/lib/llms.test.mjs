import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeAttribute,
  readPageMeta,
  isFallbackPage,
  localeOf,
  sectionOf,
  normalizeDescription,
  groupPages,
  renderLlmsTxt,
} from './llms.mjs';
import { SECTIONS } from './sections.mjs';

const page = ({ url, title, description, lang = 'en', contentLang = lang }) => `
<!DOCTYPE html><html lang="${lang}" dir="ltr"><head>
<title>${title} | Pet Project Atlas</title>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:site_name" content="Pet Project Atlas"/>
</head><body><main lang="${contentLang}" dir="ltr"><p>text</p></main></body></html>`;

test('со страницы снимаются заголовок, описание и канонический адрес', () => {
  const meta = readPageMeta(
    page({ url: 'https://atlas.smolevich.com/geo/', title: '3. AI search', description: 'Why AI answers cite someone else' }),
  );
  assert.equal(meta.url, 'https://atlas.smolevich.com/geo/');
  assert.equal(meta.title, '3. AI search');
  assert.equal(meta.description, 'Why AI answers cite someone else');
  assert.equal(meta.siteName, 'Pet Project Atlas');
});

test('страница без канонического адреса не попадает в список', () => {
  assert.equal(readPageMeta('<!DOCTYPE html><html lang="en"><head><title>404</title></head></html>'), null);
});

test('сущности в атрибутах разворачиваются обратно в символы', () => {
  assert.equal(decodeAttribute('Search &amp; AI &#39;quoted&#39;'), "Search & AI 'quoted'");
});

test('русский URL с английским текстом опознаётся как непереведённый', () => {
  const meta = readPageMeta(
    page({ url: 'https://atlas.smolevich.com/ru/geo/', title: '3. AI search', description: 'Desc', lang: 'ru', contentLang: 'en' }),
  );
  assert.equal(isFallbackPage(meta), true);
});

test('переведённая русская страница непереведённой не считается', () => {
  const meta = readPageMeta(
    page({ url: 'https://atlas.smolevich.com/ru/indexing/', title: '2. Индексация', description: 'Описание', lang: 'ru' }),
  );
  assert.equal(isFallbackPage(meta), false);
});

test('локаль читается из первого сегмента пути', () => {
  assert.equal(localeOf('https://atlas.smolevich.com/geo/'), 'en');
  assert.equal(localeOf('https://atlas.smolevich.com/ru/geo/'), 'ru');
  assert.equal(localeOf('https://atlas.smolevich.com/'), 'en');
});

test('раздел берётся после локали, главная попадает в home', () => {
  assert.equal(sectionOf('https://atlas.smolevich.com/geo/citable-pages/'), 'geo');
  assert.equal(sectionOf('https://atlas.smolevich.com/ru/geo/citable-pages/'), 'geo');
  assert.equal(sectionOf('https://atlas.smolevich.com/'), 'home');
  assert.equal(sectionOf('https://atlas.smolevich.com/ru/'), 'home');
});

test('описание приводится к одной строке с точкой на конце', () => {
  assert.equal(normalizeDescription('Two\n  lines about it'), 'Two lines about it.');
  assert.equal(normalizeDescription('Already ends well.'), 'Already ends well.');
  assert.equal(normalizeDescription('   '), '');
});

test('группы идут в порядке маршрута, английская ветка перед русской', () => {
  const pages = [
    { url: 'https://atlas.smolevich.com/money/', title: 'Money', description: 'd' },
    { url: 'https://atlas.smolevich.com/ru/', title: 'Атлас', description: 'd' },
    { url: 'https://atlas.smolevich.com/indexing/', title: 'Indexing', description: 'd' },
    { url: 'https://atlas.smolevich.com/', title: 'Atlas', description: 'd' },
  ];
  const labels = groupPages(pages, SECTIONS).map((group) => group.label);
  assert.deepEqual(labels, ['Home', '2. Indexing', '7. Money', 'Главная']);
});

test('русские разделы подписаны по-русски', () => {
  const pages = [{ url: 'https://atlas.smolevich.com/ru/indexing/', title: 'Индексация', description: 'd' }];
  assert.equal(groupPages(pages, SECTIONS)[0].label, '2. Индексация');
});

test('пустые разделы в файл не попадают', () => {
  const pages = [{ url: 'https://atlas.smolevich.com/tools/', title: 'Tools', description: 'd' }];
  assert.deepEqual(groupPages(pages, SECTIONS).map((group) => group.label), ['Tools']);
});

test('незнакомый раздел не теряется, а уходит в конец своей локали', () => {
  const pages = [
    { url: 'https://atlas.smolevich.com/newsletter/', title: 'Newsletter', description: 'd' },
    { url: 'https://atlas.smolevich.com/tools/', title: 'Tools', description: 'd' },
  ];
  assert.deepEqual(groupPages(pages, SECTIONS).map((group) => group.label), ['Tools', 'newsletter']);
});

test('внутри раздела индекс идёт первым', () => {
  const pages = [
    { url: 'https://atlas.smolevich.com/indexing/submit-and-verify/', title: 'Submit', description: 'd' },
    { url: 'https://atlas.smolevich.com/indexing/', title: 'Indexing', description: 'd' },
  ];
  const [group] = groupPages(pages, SECTIONS);
  assert.deepEqual(group.pages.map((entry) => entry.title), ['Indexing', 'Submit']);
});

test('файл начинается с H1 и цитаты в одну строку', () => {
  const text = renderLlmsTxt({ title: 'Pet Project Atlas', summary: 'A route out of zero traffic', groups: [] });
  assert.deepEqual(text.split('\n').slice(0, 3), ['# Pet Project Atlas', '', '> A route out of zero traffic.']);
});

test('у каждой ссылки абсолютный адрес и описание после двоеточия', () => {
  const text = renderLlmsTxt({
    title: 'Pet Project Atlas',
    summary: 'Summary.',
    groups: [
      {
        label: '1. Indexing',
        locale: 'en',
        pages: [{ url: 'https://atlas.smolevich.com/indexing/', title: 'Indexing', description: 'Why Google does not see you' }],
      },
    ],
  });
  assert.match(
    text,
    /^- \[Indexing\]\(https:\/\/atlas\.smolevich\.com\/indexing\/\): Why Google does not see you\.$/m,
  );
});

test('страница без описания даёт ссылку без висящего двоеточия', () => {
  const text = renderLlmsTxt({
    title: 'Atlas',
    summary: '',
    groups: [{ label: 'Tools', locale: 'en', pages: [{ url: 'https://atlas.smolevich.com/tools/', title: 'Tools', description: '' }] }],
  });
  assert.match(text, /^- \[Tools\]\(https:\/\/atlas\.smolevich\.com\/tools\/\)$/m);
});

test('файл кончается переводом строки и не копит пустые строки', () => {
  const text = renderLlmsTxt({
    title: 'Atlas',
    summary: 'Summary.',
    groups: [{ label: 'Tools', locale: 'en', pages: [{ url: 'https://atlas.smolevich.com/tools/', title: 'Tools', description: 'd' }] }],
  });
  assert.equal(text.endsWith('\n'), true);
  assert.equal(/\n\n\n/.test(text), false);
});

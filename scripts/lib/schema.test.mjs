import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUTHOR, articleNode, isoDate, pageGraph, personNode, websiteNode } from './schema.mjs';

const SITE = 'https://atlas.smolevich.com/';
const RU = 'https://atlas.smolevich.com/ru/';

const page = {
  url: 'https://atlas.smolevich.com/money/unit-economics/',
  headline: 'What one user costs when the product calls an AI',
  description: 'Variable cost per action, fixed cost per month.',
  inLanguage: 'en',
  dateModified: '2026-08-10',
};

const graphOf = (options) => pageGraph({ siteRoot: SITE, siteName: 'Pet Project Atlas', ...options });
const typed = (graph, type) => graph['@graph'].find((node) => node['@type'] === type);

test('профили автора — только настоящие адреса, без выдуманных сетей', () => {
  assert.deepEqual(AUTHOR.sameAs, [
    'https://github.com/Smolevich',
    'https://www.linkedin.com/in/stanislav-shupilkin-59482bb4/',
    'https://t.me/naturalists_notes_st',
    'https://getmentor.dev/mentor/stanislav-shupilkin-5321',
    'https://skills.sh/smolevich',
  ]);
});

test('автор — один узел на весь сайт, ссылаться на него можно по @id', () => {
  assert.equal(personNode(SITE)['@id'], 'https://atlas.smolevich.com/#person');
  assert.equal(personNode(SITE)['@type'], 'Person');
});

test('у языковых веток разные @id и разный inLanguage', () => {
  const en = websiteNode({ localeRoot: SITE, name: 'Atlas', inLanguage: 'en', siteRoot: SITE });
  const ru = websiteNode({ localeRoot: RU, name: 'Atlas', inLanguage: 'ru', siteRoot: SITE });
  assert.notEqual(en['@id'], ru['@id']);
  assert.deepEqual([en.inLanguage, ru.inLanguage], ['en', 'ru']);
});

test('корень локали без слеша не уводит @id на несуществующий адрес', () => {
  const node = websiteNode({
    localeRoot: 'https://atlas.smolevich.com/ru',
    name: 'Atlas',
    inLanguage: 'ru',
    siteRoot: SITE,
  });
  assert.equal(node['@id'], 'https://atlas.smolevich.com/ru/#website');
  assert.equal(node.url, RU);
});

test('статья ссылается на автора и на свою языковую ветку', () => {
  const node = articleNode({ ...page, localeRoot: SITE, siteRoot: SITE });
  assert.deepEqual(node.author, { '@id': 'https://atlas.smolevich.com/#person' });
  assert.deepEqual(node.isPartOf, { '@id': 'https://atlas.smolevich.com/#website' });
});

test('страница без updated не получает выдуманной даты', () => {
  const node = articleNode({ ...page, dateModified: undefined, localeRoot: SITE, siteRoot: SITE });
  assert.equal('dateModified' in node, false);
  assert.equal('datePublished' in node, false);
});

test('дата берётся из updated и остаётся тем же днём', () => {
  assert.equal(isoDate(new Date('2026-08-10')), '2026-08-10');
  assert.equal(isoDate(undefined), undefined);
});

test('страница с hero остаётся без статьи, но с сайтом и автором', () => {
  const graph = graphOf({ localeRoot: SITE, inLanguage: 'en', page: null });
  assert.deepEqual(
    graph['@graph'].map((node) => node['@type']),
    ['WebSite', 'Person'],
  );
});

test('обычная страница описана статьёй', () => {
  const graph = graphOf({ localeRoot: SITE, inLanguage: 'en', page });
  assert.equal(typed(graph, 'TechArticle').headline, page.headline);
});

test('контекст один на весь граф — блок в head остаётся одним', () => {
  const graph = graphOf({ localeRoot: RU, inLanguage: 'ru', page });
  assert.equal(graph['@context'], 'https://schema.org');
  assert.equal(JSON.stringify(graph).match(/@context/g).length, 1);
});

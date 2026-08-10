import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractHrefs, internalPath, candidateFiles, findBrokenLinks } from './links.mjs';

const ORIGIN = 'https://atlas.smolevich.com';
const at = (href, from = '/') => internalPath(href, { origin: ORIGIN, from });

test('ссылки вынимаются из всего документа, не только из тела', () => {
  const html = '<link rel="canonical" href="/geo/"/><a href="/tools/">Tools</a><a href=\'#top\'>up</a>';
  assert.deepEqual(extractHrefs(html), ['/geo/', '/tools/', '#top']);
});

test('сущности в адресе разворачиваются', () => {
  assert.deepEqual(extractHrefs('<a href="/issues/new?a=1&amp;b=2">x</a>'), ['/issues/new?a=1&b=2']);
});

test('внешние адреса и не-http схемы пропускаются', () => {
  assert.equal(at('https://github.com/Smolevich/pet-project-atlas'), null);
  assert.equal(at('mailto:smolevich90@gmail.com'), null);
  assert.equal(at('tel:+123'), null);
  assert.equal(at('//cdn.example.com/x.js'), null);
});

test('якорь на текущей странице не проверяется', () => {
  assert.equal(at('#what-we-are-solving'), null);
});

test('абсолютный адрес на собственный домен считается внутренним', () => {
  assert.equal(at('https://atlas.smolevich.com/ru/geo/'), '/ru/geo/');
});

test('относительная ссылка считается от страницы, на которой стоит', () => {
  assert.equal(at('../', '/geo/citable-pages/'), '/geo/');
  assert.equal(at('../../tools/', '/geo/citable-pages/'), '/tools/');
  assert.equal(at('checklist/', '/start/'), '/start/checklist/');
});

test('якорь и query отбрасываются, остаётся путь', () => {
  assert.equal(at('/geo/#steps'), '/geo/');
  assert.equal(at('/search/?q=sitemap'), '/search/');
});

test('каталог закрывается своим index.html', () => {
  assert.deepEqual(candidateFiles('/'), ['index.html']);
  assert.deepEqual(candidateFiles('/ru/geo/'), ['ru/geo/index.html']);
});

test('путь без слеша на конце может быть и файлом, и каталогом', () => {
  assert.deepEqual(candidateFiles('/favicon.svg'), ['favicon.svg', 'favicon.svg/index.html', 'favicon.svg.html']);
});

test('процентные последовательности в пути раскрываются', () => {
  assert.deepEqual(candidateFiles('/ru/%D1%81tart/'), ['ru/сtart/index.html']);
});

test('ссылка на существующий файл битой не считается', () => {
  const pages = [{ pathname: '/geo/', hrefs: ['/favicon.svg', '/tools/'] }];
  const files = new Set(['favicon.svg', 'tools/index.html']);
  assert.deepEqual(findBrokenLinks(pages, files, ORIGIN), []);
});

test('ссылка в никуда возвращается с адресом страницы, где она стоит', () => {
  const pages = [{ pathname: '/geo/', hrefs: ['/favicon.svg'] }];
  const broken = findBrokenLinks(pages, new Set(['index.html']), ORIGIN);
  assert.deepEqual(broken, [{ from: '/geo/', href: '/favicon.svg', target: '/favicon.svg' }]);
});

test('внешняя ссылка не считается битой, даже если файла такого нет', () => {
  const pages = [{ pathname: '/', hrefs: ['https://llmstxt.org/'] }];
  assert.deepEqual(findBrokenLinks(pages, new Set(['index.html']), ORIGIN), []);
});

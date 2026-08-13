import { test } from 'node:test';
import assert from 'node:assert/strict';

import { describeSource, orderSources } from './sources.mjs';

test('url source keeps the href and splits host from path', () => {
  assert.deepEqual(describeSource('https://llmstxt.org/spec#format'), {
    kind: 'url',
    href: 'https://llmstxt.org/spec#format',
    host: 'llmstxt.org',
    path: '/spec#format',
  });
});

test('www is dropped from the host', () => {
  assert.equal(describeSource('https://www.rfc-editor.org/rfc/rfc9309.html').host, 'rfc-editor.org');
});

test('a root url gets no path, so the entry is just the host', () => {
  assert.equal(describeSource('https://llmstxt.org/').path, '');
});

test('same host on two entries is told apart by the path', () => {
  const first = describeSource('https://support.google.com/webmasters/answer/7576553');
  const second = describeSource('https://support.google.com/webmasters/answer/7440203');
  assert.equal(first.host, second.host);
  assert.notEqual(first.path, second.path);
});

test('provenance line keeps its text and comes apart into parts', () => {
  const entry = 'Search Console API, property telegram-voice-bot, measured 2026-08-12';
  assert.deepEqual(describeSource(entry), {
    kind: 'provenance',
    text: entry,
    instrument: 'Search Console API',
    scope: 'property',
    identifier: 'telegram-voice-bot',
    measured: '2026-08-12',
  });
});

test('a title becomes the link text and the host stays beside it', () => {
  assert.deepEqual(describeSource('Use Keyword Planner — https://support.google.com/google-ads/answer/7337243'), {
    kind: 'url',
    href: 'https://support.google.com/google-ads/answer/7337243',
    host: 'support.google.com',
    path: '/google-ads/answer/7337243',
    title: 'Use Keyword Planner',
  });
});

test('a url with no title keeps working, so a half-migrated page still renders', () => {
  const described = describeSource('https://support.google.com/google-ads/answer/7337243');
  assert.equal(described.kind, 'url');
  assert.equal(described.title, undefined);
  assert.equal(`${described.host}${described.path}`, 'support.google.com/google-ads/answer/7337243');
});

test('a titled root url shows the title, not a lone slash', () => {
  // Регрессия: «wordstat.yandex.ru» и под ним одинокий «/» — то, с чего
  // заголовки и начались.
  const described = describeSource('Яндекс Вордстат — https://wordstat.yandex.ru/');
  assert.equal(described.title, 'Яндекс Вордстат');
  assert.equal(described.path, '');
});

test('provenance line never renders as a link', () => {
  // Регрессия: у замера нет публичного адреса, и битая ссылка на месте
  // источника — ровно то, против чего написан STYLE.md §4.
  const entry = 'nginx access log, dataset /var/log/nginx/access.log, measured 2026-08-12';
  assert.equal(describeSource(entry).kind, 'provenance');
  assert.equal(describeSource(entry).href, undefined);
});

test('a non-http scheme is text, not a link', () => {
  assert.equal(describeSource('mailto:someone@example.com').kind, 'provenance');
});

test('own measurements come before published links', () => {
  const ordered = orderSources([
    'https://schema.org/sameAs',
    'Search Console API, property telegram-voice-bot, measured 2026-08-12',
    'https://arxiv.org/abs/2311.09735',
  ]);
  assert.deepEqual(ordered.map((source) => source.kind), ['provenance', 'url', 'url']);
});

test('author order survives inside a group', () => {
  const ordered = orderSources(['https://llmstxt.org/', 'https://darkvisitors.com/']);
  assert.deepEqual(ordered.map((source) => source.host), ['llmstxt.org', 'darkvisitors.com']);
});

test('a page with no sources produces no entries', () => {
  assert.deepEqual(orderSources(undefined), []);
  assert.deepEqual(orderSources([]), []);
});

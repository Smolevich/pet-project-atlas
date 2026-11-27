import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontmatterDate, lastmodByPath } from './sitemap.mjs';

test('дата берётся только из frontmatter', () => {
  const source = `---\ntitle: Page\nupdated: 2026-11-26\n---\nText with 2025-01-01.`;
  assert.equal(frontmatterDate(source), '2026-11-26');
  assert.equal(frontmatterDate('Text with 2026-11-26.'), undefined);
});

test('карта дат использует тот же URL, что коллекция контента', () => {
  const dates = lastmodByPath(new URL('../../src/content/docs/', import.meta.url));
  assert.equal(dates.get('/analytics/attribution/'), '2026-11-26');
  assert.equal(dates.get('/ru/analytics/attribution/'), '2026-11-26');
  assert.equal(dates.has('/analytics/'), false);
});

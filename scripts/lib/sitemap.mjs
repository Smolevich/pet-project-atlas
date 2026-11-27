/**
 * Дата `updated:` из страницы становится <lastmod> того же URL в sitemap.
 * Конфиг Astro выполняется раньше коллекций, поэтому frontmatter читается с
 * диска. Страницы без честной даты остаются без lastmod.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { docUrlPath, readDocFiles } from './locales.mjs';

/** Значение YYYY-MM-DD из frontmatter или undefined. */
export function frontmatterDate(source, key = 'updated') {
  const head = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const match = head?.match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'));
  return match?.[1];
}

/** Путь страницы -> дата последнего содержательного обновления. */
export function lastmodByPath(docsDir) {
  const root = docsDir instanceof URL ? fileURLToPath(docsDir) : docsDir;
  const result = new Map();

  for (const file of readDocFiles(root)) {
    const updated = frontmatterDate(readFileSync(path.join(root, file), 'utf8'));
    if (updated) result.set(docUrlPath(file), updated);
  }
  return result;
}

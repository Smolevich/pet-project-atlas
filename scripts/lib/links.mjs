/**
 * Проверка внутренних ссылок по собранному сайту. Чистая часть: вытащить ссылки
 * из HTML, решить, какая внутренняя, и посчитать, какому файлу она соответствует.
 * Обход dist и чтение файлов — в scripts/check-links.mjs.
 *
 * Якоря (#heading) не проверяются: ссылка ведёт на существующую страницу, а есть
 * ли там такой заголовок — отдельная задача и отдельный проход.
 */

import { decodeAttribute } from './llms.mjs';

const NON_HTTP = /^(?:mailto|tel|javascript|data|ftp):/i;

/** Все href из документа, в порядке появления. */
export function extractHrefs(html) {
  return [...html.matchAll(/\bhref=["']([^"']*)["']/gi)].map((match) => decodeAttribute(match[1]));
}

/**
 * Путь внутри сайта или null, если ссылка ведёт наружу.
 * Абсолютный адрес на собственный домен считается внутренним: hreflang и canonical
 * пишутся именно так, и промахиваются они так же молча.
 */
export function internalPath(href, { origin, from = '/' }) {
  const value = href.trim();
  if (!value || value.startsWith('#')) return null;
  if (NON_HTTP.test(value)) return null;
  if (value.startsWith('//')) return null;

  const url = new URL(value, `${origin}${from}`);
  if (url.origin !== origin) return null;
  return url.pathname;
}

/**
 * Файлы, любой из которых закрывает ссылку. Статический хостинг отдаёт
 * `/tools/` из `tools/index.html`, а `/tools` — из него же или из `tools.html`.
 */
export function candidateFiles(pathname) {
  const path = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!path) return ['index.html'];
  if (path.endsWith('/')) return [`${path}index.html`];
  return [path, `${path}/index.html`, `${path}.html`];
}

/**
 * Битые ссылки: у какой страницы, какая ссылка, во что она должна была попасть.
 * `pages` — [{ pathname, hrefs }], `files` — множество путей относительно dist.
 */
export function findBrokenLinks(pages, files, origin) {
  const broken = [];
  for (const page of pages) {
    for (const href of page.hrefs) {
      const target = internalPath(href, { origin, from: page.pathname });
      if (target === null) continue;
      if (candidateFiles(target).some((file) => files.has(file))) continue;
      broken.push({ from: page.pathname, href, target });
    }
  }
  return broken;
}

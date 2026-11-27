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

/** Все id элементов документа. Нужны отдельно от href: ссылка на страницу
 * может существовать, а названный в ней заголовок — уже нет. */
export function extractIds(html) {
  return [...html.matchAll(/\bid=["']([^"']*)["']/gi)].map((match) => decodeAttribute(match[1]));
}

function internalUrl(href, { origin, from = '/' }) {
  const value = href.trim();
  if (!value || NON_HTTP.test(value) || value.startsWith('//')) return null;

  const url = new URL(value, `${origin}${from}`);
  return url.origin === origin ? url : null;
}

/**
 * Путь внутри сайта или null, если ссылка ведёт наружу.
 * Абсолютный адрес на собственный домен считается внутренним: hreflang и canonical
 * пишутся именно так, и промахиваются они так же молча.
 */
export function internalPath(href, { origin, from = '/' }) {
  const value = href.trim();
  if (!value || value.startsWith('#')) return null;
  return internalUrl(value, { origin, from })?.pathname ?? null;
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

function decodedHash(hash) {
  if (!hash || hash === '#') return '';
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function pageAt(pages, pathname) {
  return pages.get(pathname) ?? pages.get(pathname.endsWith('/') ? pathname.slice(0, -1) : `${pathname}/`);
}

/**
 * Битые якоря во внутренних ссылках. Якорь проверяется только у HTML-страниц:
 * fragment у PDF или другого файла имеет смысл для его собственного просмотрщика.
 */
export function findBrokenAnchors(pages, origin) {
  const byPath = new Map(pages.map((page) => [page.pathname, new Set(page.ids ?? [])]));
  const broken = [];

  for (const page of pages) {
    for (const href of page.hrefs) {
      const target = internalUrl(href, { origin, from: page.pathname });
      const id = target && decodedHash(target.hash);
      if (!target || !id) continue;

      const ids = pageAt(byPath, target.pathname);
      if (!ids || ids.has(id)) continue;
      broken.push({ from: page.pathname, href, target: `${target.pathname}#${id}` });
    }
  }
  return broken;
}

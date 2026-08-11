/**
 * Кто из русских адресов настоящий, а кто fallback, и что странице позволено
 * заявлять о языках.
 *
 * Starlight поднимает русский маршрут на каждую английскую страницу, даже когда
 * перевода нет: адрес отвечает 200 и отдаёт английский текст. Такой адрес нельзя
 * ни объявлять русской версией в hreflang, ни класть в sitemap — обе записи
 * обещают перевод, которого нет. Это ровно тот дубликат, про который написано на
 * /indexing/why-google-does-not-see-you/.
 *
 * Живёт в scripts/, потому что читают двое: astro.config.mjs фильтрует sitemap,
 * src/routeData.ts правит <head>. Две копии списка разъехались бы.
 */

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RU = 'ru';
const RU_ROOT = `/${RU}/`;

/**
 * Адрес страницы по её файлу в src/content/docs или по id в коллекции:
 * 'ru/start/index.md' и 'ru/start' одинаково дают '/ru/start/'. Обе формы нужны,
 * потому что список страниц читают из разных мест: конфиг — с диска, middleware —
 * из astro:content, коллекция ему доступна, а путь до src после сборки уже нет.
 */
export function docUrlPath(file) {
  const slug = file.replace(/\.mdx?$/, '').replace(/(?:^|\/)index$/, '');
  return slug ? `/${slug}/` : '/';
}

/** Адрес английского оригинала: '/ru/money/' -> '/money/', '/ru/' -> '/'. */
export function originalPath(pathname) {
  if (pathname === `/${RU}`) return '/';
  return pathname.startsWith(RU_ROOT) ? pathname.slice(RU_ROOT.length - 1) : pathname;
}

/** Адрес русской версии: '/money/' -> '/ru/money/'. */
export function russianPath(pathname) {
  return `/${RU}${originalPath(pathname)}`;
}

/**
 * Русский адрес, за которым не стоит перевода. `written` — множество адресов
 * страниц, которые действительно написаны по-русски.
 */
export function isFallbackPath(pathname, written) {
  const isRussian = pathname === `/${RU}` || pathname.startsWith(RU_ROOT);
  return isRussian && !written.has(russianPath(pathname));
}

/** Написан ли русский перевод этой страницы. Адрес принимается любой локали. */
export function hasRussianVersion(pathname, written) {
  return written.has(russianPath(pathname));
}

/** Адреса написанных русских страниц из списка файлов или id коллекции. */
export function writtenTranslations(entries) {
  const paths = new Set();
  for (const entry of entries) {
    const url = docUrlPath(entry);
    if (url.startsWith(RU_ROOT)) paths.add(url);
  }
  return paths;
}

/** Файлы страниц относительно src/content/docs. `docsDir` — путь или file-URL. */
export function readDocFiles(docsDir) {
  return markdownFiles(docsDir instanceof URL ? fileURLToPath(docsDir) : docsDir);
}

function markdownFiles(dir, prefix = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...markdownFiles(path.join(dir, entry.name), name));
    else if (/\.mdx?$/.test(entry.name)) files.push(name);
  }
  return files;
}

/**
 * <head> без ссылок на язык, которого на странице нет. На fallback-маршруте
 * снимаются все альтернаты: страница не часть языковой пары, она дубликат
 * английской. На английской странице без перевода снимается только русская.
 */
export function dropUnwrittenAlternates(head, { isFallback, hasRussian }) {
  return head.filter((tag) => {
    if (tag.tag !== 'link' || tag.attrs?.rel !== 'alternate') return true;
    if (isFallback) return false;
    return hasRussian || tag.attrs.hreflang !== RU;
  });
}

/**
 * canonical и og:url fallback-страницы переставленные на английский оригинал.
 * Правило четвёртого шага /indexing/why-google-does-not-see-you/: страница
 * указывает на себя или на настоящий оригинал, а тут текст ровно английский.
 */
export function pointAtOriginal(head) {
  return head.map((tag) => {
    const href = tag.tag === 'link' && tag.attrs?.rel === 'canonical' ? 'href' : null;
    const content = tag.tag === 'meta' && tag.attrs?.property === 'og:url' ? 'content' : null;
    const key = href ?? content;
    if (!key || typeof tag.attrs?.[key] !== 'string') return tag;

    const url = new URL(tag.attrs[key]);
    url.pathname = originalPath(url.pathname);
    return { ...tag, attrs: { ...tag.attrs, [key]: url.href } };
  });
}

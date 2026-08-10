#!/usr/bin/env node
/**
 * Проверяет, что каждая внутренняя ссылка собранного сайта во что-то попадает.
 * Внешняя сеть не нужна: dist лежит рядом и весь целиком помещается в память.
 *
 * Из-за отсутствия такой проверки favicon отдавал 404 на 47 страницах, а CI был
 * зелёный.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { extractHrefs, findBrokenLinks } from './lib/links.mjs';

async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, base)));
    } else {
      files.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return files;
}

/** Адрес страницы по её файлу: 'ru/geo/index.html' -> '/ru/geo/'. */
const pathnameOf = (file) => `/${file.replace(/index\.html$/, '')}`;

function originOf(html) {
  const canonical = html.match(/<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i);
  return canonical ? new URL(canonical[1]).origin : null;
}

async function main() {
  const dist = process.argv[2] ?? 'dist';
  const files = await walk(dist);

  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  const origin = originOf(home);
  if (!origin) {
    console.error(`${dist}/index.html: нет canonical, домен сайта взять неоткуда.`);
    process.exit(1);
  }

  // Страница 404 сама себя не проверяет: её canonical и hreflang указывают на
  // /404/, адрес, которого по смыслу не существует. Навигация у неё та же, что
  // на остальных 46 страницах, и там она проверяется.
  const scanned = files.filter((name) => name.endsWith('.html') && name !== '404.html');

  const pages = [];
  for (const file of scanned) {
    pages.push({
      pathname: pathnameOf(file),
      hrefs: extractHrefs(await readFile(path.join(dist, file), 'utf8')),
    });
  }

  const broken = findBrokenLinks(pages, new Set(files), origin);
  for (const link of broken) {
    console.error(`${link.from}: ссылка ${link.href} ведёт в никуда — нет ${link.target}`);
  }

  const total = pages.reduce((sum, page) => sum + page.hrefs.length, 0);
  console.log(`Страниц: ${pages.length}. Ссылок: ${total}. Битых: ${broken.length}.`);
  process.exit(broken.length ? 1 : 0);
}

await main();

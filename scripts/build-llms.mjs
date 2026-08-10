#!/usr/bin/env node
/**
 * Пишет dist/llms.txt по собранному HTML. Файл не редактируется руками: страница
 * появилась — строка появилась, страница уехала — строка ушла.
 *
 * Непереведённые русские URL пропускаются. Они возвращают 200, но отдают
 * английский текст, а строка в llms.txt — обещание, что страница написана.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readPageMeta, isFallbackPage, groupPages, renderLlmsTxt } from './lib/llms.mjs';
import { SECTIONS } from './lib/sections.mjs';

const OUT = 'llms.txt';

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(full)));
    } else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
      // 404 собирается как обычная страница и даже несёт canonical, но адреса,
      // по которому её читают, не существует.
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const dist = process.argv[2] ?? 'dist';

  const pages = [];
  for (const file of await htmlFiles(dist)) {
    const meta = readPageMeta(await readFile(file, 'utf8'));
    if (meta && !isFallbackPage(meta)) pages.push(meta);
  }

  const home = pages.find((page) => new URL(page.url).pathname === '/');
  if (!home) {
    console.error(`${OUT}: не нашлась главная страница в ${dist} — собери сайт заново.`);
    process.exit(1);
  }

  const text = renderLlmsTxt({
    title: home.siteName || home.title,
    summary: home.description,
    groups: groupPages(pages, SECTIONS),
  });

  await writeFile(path.join(dist, OUT), text, 'utf8');
  console.log(`${OUT}: ${pages.length} страниц.`);
}

await main();

#!/usr/bin/env node
/**
 * Собирает dist-mcp/: индекс атласа из src/content/docs и сам сервер с юнитом
 * systemd. Это и есть то, что деплой кладёт на хост: зависимостей из npm в
 * рантайме нет, нужен только node.
 *
 *   node scripts/build-mcp-index.mjs [папка-вывода]
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPage } from '../mcp/lib/content.mjs';
import { SECTIONS } from './lib/sections.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS = path.join(ROOT, 'src/content/docs');
const RUNTIME = ['server.mjs', 'lib/protocol.mjs', 'lib/search.mjs', 'atlas-mcp.service'];

async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sourceFiles(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out.sort();
}

export async function buildIndex() {
  const plugin = JSON.parse(await readFile(path.join(ROOT, 'plugin/.claude-plugin/plugin.json'), 'utf8'));
  const pages = [];
  for (const file of await sourceFiles(DOCS)) {
    pages.push(buildPage(path.relative(DOCS, file).split(path.sep).join('/'), await readFile(file, 'utf8')));
  }
  return { version: plugin.version, sections: SECTIONS, pages };
}

export async function buildMcp(outDir) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, 'lib'), { recursive: true });
  const index = await buildIndex();
  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index));
  for (const file of RUNTIME) await copyFile(path.join(ROOT, 'mcp', file), path.join(outDir, file));
  return index;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.resolve(process.argv[2] ?? path.join(ROOT, 'dist-mcp'));
  const index = await buildMcp(out);
  console.log(`${path.relative(process.cwd(), out)}: ${index.pages.length} pages, version ${index.version}`);
}

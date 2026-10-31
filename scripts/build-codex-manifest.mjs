#!/usr/bin/env node
/**
 * Пишет plugin/plugin.json — переносимый манифест, по которому Codex ставит
 * плагин из маркетплейса .agents/plugins/marketplace.json. Тот же объект, что
 * уходит в ZIP для ChatGPT: имя и версия — из манифеста Claude, листинг — из
 * chatgpt/manifest.json. Руками файл не правится, тест сверяет его со сборкой.
 *
 *   node scripts/build-codex-manifest.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './lib/chatgpt-plugin.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const CODEX_MANIFEST = path.join(ROOT, 'plugin/plugin.json');

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

export async function codexManifestText() {
  const claude = await readJson(path.join(ROOT, 'plugin/.claude-plugin/plugin.json'));
  const openai = await readJson(path.join(ROOT, 'chatgpt/manifest.json'));
  return `${JSON.stringify(buildManifest(claude, openai), null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(CODEX_MANIFEST, await codexManifestText());
  console.log(path.relative(process.cwd(), CODEX_MANIFEST));
}

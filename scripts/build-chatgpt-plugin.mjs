#!/usr/bin/env node
/**
 * Собирает ZIP плагина для портала OpenAI (platform.openai.com/plugins → Skills only)
 * из plugin/ и правок в chatgpt/. Руками ZIP не собирается: что в нём, решает
 * этот скрипт, а тесты проверяют результат.
 *
 *   node scripts/build-chatgpt-plugin.mjs [папка-вывода]   → <папка>/laviolab-atlas-<версия>.zip
 */
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyOverrides,
  buildManifest,
  forbiddenHits,
  listingProblems,
  neutralizeCommands,
  parseOverrides,
} from './lib/chatgpt-plugin.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PLUGIN = path.join(ROOT, 'plugin');
const CHATGPT = path.join(ROOT, 'chatgpt');
const DEFAULT_OUT = path.join(ROOT, 'dist-chatgpt');

// Одинаковое время у всех файлов — одинаковый ZIP из одинаковых исходников.
const FIXED_MTIME = new Date('2026-01-01T00:00:00Z');

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function readOverrides(skill) {
  try {
    return parseOverrides(await readFile(path.join(CHATGPT, 'skills', skill, 'overrides.md'), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return new Map();
    throw err;
  }
}

async function buildSkill(skill, pluginName) {
  const raw = await readFile(path.join(PLUGIN, 'skills', skill, 'SKILL.md'), 'utf8');
  const text = neutralizeCommands(applyOverrides(raw, await readOverrides(skill)), pluginName);
  const hits = forbiddenHits(text);
  if (hits.length) throw new Error(`${skill}: ${hits.join('; ')}`);
  return text;
}

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    out.push(full);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
  }
  return out;
}

export async function buildChatgptPlugin(outDir = DEFAULT_OUT) {
  const claude = await readJson(path.join(PLUGIN, '.claude-plugin/plugin.json'));
  const manifest = buildManifest(claude, await readJson(path.join(CHATGPT, 'manifest.json')));
  const problems = listingProblems(manifest);
  if (problems.length) throw new Error(`листинг не пройдёт подачу: ${problems.join('; ')}`);

  const root = path.join(outDir, claude.name);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(root, 'assets'), { recursive: true });

  await writeFile(path.join(root, 'plugin.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await copyFile(path.join(PLUGIN, 'LICENSE'), path.join(root, 'LICENSE'));
  await copyFile(path.join(PLUGIN, 'assets/icon.png'), path.join(root, 'assets/icon.png'));

  const skills = (await readdir(path.join(PLUGIN, 'skills'), { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const skill of skills) {
    await mkdir(path.join(root, 'skills', skill), { recursive: true });
    await writeFile(path.join(root, 'skills', skill, 'SKILL.md'), await buildSkill(skill, claude.name));
  }

  for (const file of [root, ...(await listFiles(root))]) await utimes(file, FIXED_MTIME, FIXED_MTIME);

  const zip = path.join(outDir, `${claude.name}-${claude.version}.zip`);
  const entries = (await listFiles(root)).map((f) => path.relative(outDir, f)).sort();
  // -X без лишних атрибутов, -D без записей каталогов: портал читает только файлы.
  execFileSync('zip', ['-X', '-D', '-q', zip, ...entries], { cwd: outDir });
  return { zip, root, manifest, skills };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT;
  const { zip, skills } = await buildChatgptPlugin(out);
  console.log(`${path.relative(process.cwd(), zip)}: ${skills.join(', ')}`);
}

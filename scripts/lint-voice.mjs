#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  findBannedPhrases,
  findMissingSections,
  findLongSentences,
  parseFrontmatter,
  findUnsourcedNumbers,
} from './lib/voice-rules.mjs';

const STYLE = {
  numbers: 'STYLE.md §4 Numbers',
  banned: 'STYLE.md §3 Ban list',
  shape: 'STYLE.md §2 Page shape',
  length: 'STYLE.md §5 Length',
};

async function walk(dir) {
  // Одиночный файл — чтобы «проверь эту страницу» работало без обхода каталога.
  if ((await stat(dir)).isFile()) return /\.mdx?$/.test(dir) ? [dir] : [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const isRuPage = (filePath) => filePath.split(path.sep).includes('ru');
const isIndexPage = (filePath) => /^index\.mdx?$/.test(path.basename(filePath));

async function lintFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const lang = isRuPage(filePath) ? 'ru' : 'en';
  const checkVoice = data.voice !== 'guest' && !isIndexPage(filePath);

  const errors = [];
  const warnings = [];

  for (const hit of findUnsourcedNumbers(body, data)) {
    errors.push(
      `${filePath}:${hit.line}: число без источника — "${hit.text}". Добавь дату в updated: и URL в sources:, либо убери число. (${STYLE.numbers})`,
    );
  }

  if (checkVoice) {
    for (const hit of findBannedPhrases(body)) {
      errors.push(
        `${filePath}:${hit.line}: запрещённая фраза "${hit.phrase}". Замени на конкретное утверждение. (${STYLE.banned})`,
      );
    }
    for (const title of findMissingSections(body, lang)) {
      errors.push(
        `${filePath}: отсутствует или пуст блок "## ${title}". Все четыре обязательных блока идут первыми, в этом порядке. (${STYLE.shape})`,
      );
    }
    for (const hit of findLongSentences(body, 20)) {
      warnings.push(
        `${filePath}:${hit.line}: предложение на ${hit.words} слов, порог 20. Раздели на два. (${STYLE.length})`,
      );
    }
  }

  return { errors, warnings };
}

async function main() {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    console.error('Usage: node scripts/lint-voice.mjs <dir> [<dir> ...]');
    process.exit(2);
  }

  const files = (await Promise.all(dirs.map(walk))).flat().sort();

  let errorCount = 0;
  let warningCount = 0;

  for (const file of files) {
    const { errors, warnings } = await lintFile(file);
    for (const message of errors) {
      console.error(message);
      errorCount++;
    }
    for (const message of warnings) {
      console.warn(message);
      warningCount++;
    }
  }

  console.log(`Файлов: ${files.length}. Ошибок: ${errorCount}. Предупреждений: ${warningCount}.`);
  process.exit(errorCount > 0 ? 1 : 0);
}

main();

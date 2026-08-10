#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  findBannedPhrases,
  findMissingSections,
  findSectionOrderProblems,
  countRequiredSections,
  findLongSentences,
  parseFrontmatter,
  findUnsourcedNumbers,
  findNumericClaims,
  findInvalidSources,
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
  const { data, body, bodyStartLine, error: frontmatterError } = parseFrontmatter(raw);
  if (frontmatterError) {
    return {
      errors: [`${filePath}:1: frontmatter не разобрался — ${frontmatterError}`],
      warnings: [],
    };
  }

  const lang = isRuPage(filePath) ? 'ru' : 'en';
  const checkVoice = data.voice !== 'guest';
  // Освобождена от формы только навигация: index-страница, которая не
  // объявила ни одного обязательного блока. Как только объявила хотя бы
  // один — это процедура, и блоки нужны все четыре, в порядке.
  const checkShape = checkVoice && (!isIndexPage(filePath) || countRequiredSections(body, lang) > 0);
  // Номера строк правил считаются от тела; читателю нужен номер в файле.
  const at = (line) => `${filePath}:${line + bodyStartLine - 1}`;

  const errors = [];
  const warnings = [];

  for (const entry of findInvalidSources(data)) {
    errors.push(
      `${filePath}: sources: "${entry}" — не источник. Нужен http(s)-URL либо строка происхождения "Инструмент, scope идентификатор, measured YYYY-MM-DD". (${STYLE.numbers})`,
    );
  }

  for (const hit of findUnsourcedNumbers(body, data)) {
    errors.push(
      `${at(hit.line)}: число без источника — "${hit.text}". Добавь источник в sources: либо убери число. (${STYLE.numbers})`,
    );
  }

  const numericClaims = findNumericClaims(body);
  if (numericClaims.length > 0 && !data.updated) {
    errors.push(
      `${at(numericClaims[0].line)}: на странице есть числа, но нет updated:. Поставь дату замера. (${STYLE.numbers})`,
    );
  }

  if (checkVoice) {
    for (const hit of findBannedPhrases(body)) {
      errors.push(
        `${at(hit.line)}: запрещённая фраза "${hit.phrase}". Замени на конкретное утверждение. (${STYLE.banned})`,
      );
    }
    for (const hit of findLongSentences(body, 20)) {
      warnings.push(
        `${at(hit.line)}: предложение на ${hit.words} слов, порог 20. Раздели на два. (${STYLE.length})`,
      );
    }
  }

  if (checkShape) {
    for (const title of findMissingSections(body, lang)) {
      errors.push(
        `${filePath}: отсутствует или пуст блок "## ${title}". (${STYLE.shape})`,
      );
    }
    for (const problem of findSectionOrderProblems(body, lang)) {
      errors.push(
        `${filePath}: блоки идут не в том порядке — ${problem.actual.join(' → ')}. Нужно: ${problem.expected.join(' → ')}, и раньше любого другого H2. (${STYLE.shape})`,
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

  // Молчаливый успех на пустом наборе — это опечатка в пути, которая в CI
  // читается как «всё в порядке».
  if (files.length === 0) {
    console.error(`Markdown не нашёлся: ${dirs.join(', ')}. Проверь путь.`);
    process.exit(2);
  }

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

main().catch((error) => {
  // Без этого несуществующий путь падал сырым стеком ENOENT.
  const reason = error?.code === 'ENOENT' ? `путь не найден: ${error.path}` : (error?.message ?? error);
  console.error(`lint-voice: ${reason}`);
  process.exit(2);
});

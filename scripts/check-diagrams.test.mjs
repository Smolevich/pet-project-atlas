// Подпись в три строки mermaid считает по двум: третья строка выпадает за
// фигуру и висит под ней. Ловилось это уже дважды, оба раза глазами на
// собранной странице, поэтому теперь ловится тестом.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DOCS = 'src/content/docs';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('подпись узла в mermaid не длиннее двух строк', async () => {
  const long = [];
  for (const file of await walk(DOCS)) {
    const text = await readFile(file, 'utf8');
    for (const [, block] of text.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
      for (const [, label] of block.matchAll(/[[{]"([^"]+)"[\]}]/g)) {
        const lines = label.split('<br/>').length;
        if (lines > 2) long.push(`${file}: «${label.replaceAll('<br/>', ' / ')}» — ${lines} строки`);
      }
    }
  }
  assert.deepEqual(long, [], `третья строка выпадет за фигуру:\n${long.join('\n')}`);
});

test('в mermaid-подписях нет обратных кавычек', async () => {
  // Внутри фигуры markdown не разбирается, кавычки печатаются как есть.
  const bad = [];
  for (const file of await walk(DOCS)) {
    const text = await readFile(file, 'utf8');
    for (const [, block] of text.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
      for (const [, label] of block.matchAll(/[[{]"([^"]+)"[\]}]/g)) {
        if (label.includes('`')) bad.push(`${file}: «${label}»`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

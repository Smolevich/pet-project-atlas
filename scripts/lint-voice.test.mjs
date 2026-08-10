import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const LINTER = fileURLToPath(new URL('./lint-voice.mjs', import.meta.url));

let root;

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'atlas-lint-'));
});

after(async () => {
  await rm(root, { recursive: true, force: true });
});

async function lint(...args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [LINTER, ...args]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

async function page(name, content) {
  const file = path.join(root, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
  return file;
}

test('каталог без markdown — не успех', async () => {
  const dir = path.join(root, 'empty');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'notes.txt'), 'not markdown', 'utf8');

  const { code, stderr } = await lint(dir);
  assert.notEqual(code, 0);
  assert.match(stderr, /не наш(лось|ёл)|Файлов: 0/i);
});

test('несуществующий путь — понятная ошибка, а не стек', async () => {
  const { code, stderr } = await lint(path.join(root, 'no-such-dir'));
  assert.equal(code, 2);
  assert.doesNotMatch(stderr, /at .*lint-voice\.mjs/);
  assert.match(stderr, /no-such-dir/);
});

test('номер строки в ошибке совпадает с номером строки в файле', async () => {
  const file = await page(
    'numbers.md',
    ['---', 'title: X', 'sources: []', '---', '', '## What we are solving', 'Traffic grew to 1200 visits.', ''].join('\n'),
  );
  const { code, stderr } = await lint(file);
  assert.notEqual(code, 0);
  assert.match(stderr, new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:7: число без источника`));
});

test('сломанный frontmatter отдельная ошибка, а не проза', async () => {
  const file = await page('broken.md', ['---', 'title: [unclosed', '---', '', 'text'].join('\n'));
  const { code, stderr } = await lint(file);
  assert.notEqual(code, 0);
  assert.match(stderr, /frontmatter/i);
});

test('чистая страница — нулевой код возврата', async () => {
  const file = await page(
    'clean.md',
    [
      '---',
      'title: X',
      '---',
      '',
      '## What we are solving',
      'A symptom.',
      '',
      '## Steps',
      'One step.',
      '',
      '## What did not work',
      'A dead end.',
      '',
      '## Verify',
      'A check.',
      '',
    ].join('\n'),
  );
  const { code, stdout } = await lint(file);
  assert.equal(code, 0);
  assert.match(stdout, /Ошибок: 0/);
});

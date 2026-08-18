// Плагин ломается тихо: манифест разъезжается со скиллами, страница обещает
// команду, которой нет, скилл ищет чужой аудит по пути, откуда установщик
// давно ушёл. Ничего из этого не видно ни в сборке, ни в линтере голоса —
// видно только у читателя, у которого команда не запустилась.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MARKETPLACE = path.join(ROOT, '.claude-plugin/marketplace.json');
const PLUGIN_DIR = path.join(ROOT, 'plugin');
const SKILLS_DIR = path.join(PLUGIN_DIR, 'skills');
const DOCS = path.join(ROOT, 'src/content/docs');

const json = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function skillNames() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function frontmatter(name) {
  const raw = await readFile(path.join(SKILLS_DIR, name, 'SKILL.md'), 'utf8');
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  assert.ok(match, `${name}/SKILL.md: нет frontmatter`);
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: raw.slice(match[0].length) };
}

async function walkDocs(dir = DOCS) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkDocs(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('маркетплейс указывает на существующий плагин', async () => {
  const market = await json(MARKETPLACE);
  assert.equal(market.plugins.length, 1);
  const [entry] = market.plugins;
  const manifest = await json(path.join(ROOT, entry.source, '.claude-plugin/plugin.json'));
  assert.equal(
    manifest.name,
    entry.name,
    'имя в plugin.json и в marketplace.json задают префикс команды, разъедутся — команда сменит имя',
  );
});

test('каждый скилл вызывается как /<плагин>:<папка>', async () => {
  for (const name of await skillNames()) {
    const { data } = await frontmatter(name);
    assert.equal(data.name, name, `${name}: имя в frontmatter не совпадает с папкой`);
    assert.equal(data['user-invocable'], 'true', `${name}: без user-invocable команды не будет`);
    assert.ok(data.description?.length > 40, `${name}: описание решает, когда скилл вообще вызовут`);
  }
});

test('атлас не обещает команду, которой нет в плагине', async () => {
  const manifest = await json(path.join(PLUGIN_DIR, '.claude-plugin/plugin.json'));
  const known = new Set(await skillNames());
  const files = [...(await walkDocs()), path.join(ROOT, 'README.md')];

  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const [, command] of text.matchAll(new RegExp(`/${manifest.name}:([a-z-]+)`, 'g'))) {
      assert.ok(known.has(command), `${path.relative(ROOT, file)}: обещает /${manifest.name}:${command}, такого скилла нет`);
    }
  }
});

test('страница инструментов ставит скиллы глобально', async () => {
  // Установщик по умолчанию кладёт скилл в текущий проект: без -g читатель
  // ставит его в одну папку, а запускает из другой.
  for (const page of ['tools/skills.md', 'ru/tools/skills.md']) {
    const text = await readFile(path.join(DOCS, page), 'utf8');
    for (const [line] of text.matchAll(/^npx skills add .*$/gm)) {
      assert.match(line, /^npx skills add -g /, `${page}: «${line}» поставит скилл только в текущий проект`);
    }
  }
});

test('скиллы ищут чужие аудиты во всех каталогах установщика', async () => {
  const { body } = await frontmatter('start');
  if (!body.includes('skills/')) return;
  for (const dir of ['~/.agents/skills', '~/.claude/skills', './.claude/skills']) {
    assert.ok(body.includes(dir), `start: не проверяет ${dir}, установленный туда аудит будет объявлен отсутствующим`);
  }
});

test('ссылки скиллов на атлас ведут на существующие страницы', async () => {
  const slugs = new Set(
    (await walkDocs()).map((file) => {
      const rel = path.relative(DOCS, file).replace(/\.mdx?$/, '').replace(/\/?index$/, '');
      return `/${rel}`.replace(/\/$/, '') || '/';
    }),
  );

  for (const name of await skillNames()) {
    const { body } = await frontmatter(name);
    for (const [, url] of body.matchAll(/https:\/\/atlas\.smolevich\.com(\/[^\s>)]*)/g)) {
      const slug = url.replace(/\/$/, '') || '/';
      assert.ok(slugs.has(slug), `${name}: ссылается на ${url}, такой страницы в атласе нет`);
    }
  }
});

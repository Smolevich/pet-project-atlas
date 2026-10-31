// Плагин ломается тихо: манифест разъезжается со скиллами, страница обещает
// команду, которой нет, скилл ищет чужой аудит по пути, откуда установщик
// давно ушёл. Ничего из этого не видно ни в сборке, ни в линтере голоса —
// видно только у читателя, у которого команда не запустилась.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CODEX_MANIFEST, codexManifestText } from './build-codex-manifest.mjs';

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

test('после переименования плагина атлас не обещает команду под старым именем', async () => {
  // Тест выше ищет только по текущему префиксу, поэтому `/atlas:start` после
  // переименования в laviolab-atlas проходил его молча.
  const manifest = await json(path.join(PLUGIN_DIR, '.claude-plugin/plugin.json'));
  const skills = (await skillNames()).join('|');
  const files = [...(await walkDocs()), path.join(ROOT, 'README.md'), path.join(PLUGIN_DIR, 'README.md')];

  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const [match, prefix] of text.matchAll(new RegExp(`/([a-z-]+):(?:${skills})\\b`, 'g'))) {
      assert.equal(prefix, manifest.name, `${path.relative(ROOT, file)}: «${match}» — плагин называется ${manifest.name}`);
    }
  }
});

test('строка установки ставит плагин под его настоящим именем', async () => {
  const manifest = await json(path.join(PLUGIN_DIR, '.claude-plugin/plugin.json'));
  const files = [...(await walkDocs()), path.join(ROOT, 'README.md'), path.join(PLUGIN_DIR, 'README.md')];

  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const [line, name] of text.matchAll(/^\/plugin install ([a-z0-9-]+).*$/gm)) {
      assert.equal(name, manifest.name, `${path.relative(ROOT, file)}: «${line}» ставит не тот плагин`);
    }
  }
});

test('скилл, который работает только в этом репозитории, в плагин не входит', async () => {
  // /voice читает STYLE.md и линтер этого репо: у читателя плагина их нет.
  assert.ok(!(await skillNames()).includes('voice'));
});

test('в папке плагина есть всё, без чего каталог не примет его', async () => {
  const readme = await readFile(path.join(PLUGIN_DIR, 'README.md'), 'utf8');
  const words = readme.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean);
  assert.ok(words.length >= 40, 'README короче 40 слов вне блоков кода — каталог блокирует подачу');
  await readFile(path.join(PLUGIN_DIR, 'LICENSE'), 'utf8');
  await readFile(path.join(PLUGIN_DIR, 'assets/icon.png'));
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

test('Codex ставит плагин по маркетплейсу из .agents/plugins', async () => {
  const market = await json(path.join(ROOT, '.agents/plugins/marketplace.json'));
  const claude = await json(MARKETPLACE);
  assert.equal(market.name, claude.name, 'имя маркетплейса стоит в команде установки: у Codex и Claude Code оно одно');
  assert.equal(market.plugins.length, 1);
  const [entry] = market.plugins;
  assert.ok(entry.category, 'category у записи маркетплейса Codex обязательна');
  const manifest = await json(path.join(ROOT, entry.source.path, 'plugin.json'));
  assert.equal(manifest.name, entry.name, 'имя записи и манифеста задают plugin@marketplace');
});

test('манифест Codex собран из манифеста Claude и листинга ChatGPT, а не правлен руками', async () => {
  assert.equal(
    await readFile(CODEX_MANIFEST, 'utf8'),
    await codexManifestText(),
    'plugin/plugin.json разошёлся с источниками: npm run build:codex',
  );
});

test('иконка, на которую ссылается манифест Codex, лежит в папке плагина', async () => {
  const ui = (await json(CODEX_MANIFEST)).extensions['com.openai'].interface;
  for (const icon of [ui.logo, ui.composerIcon]) await readFile(path.join(PLUGIN_DIR, icon));
});

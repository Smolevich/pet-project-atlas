// Сборка для портала OpenAI: проверяем то, что портал увидит в ZIP, а не
// промежуточные шаги. Коды ошибок в сообщениях — из
// developers.openai.com/plugins/deploy/submission-errors.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { buildChatgptPlugin } from './build-chatgpt-plugin.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let out;
let built;

const entries = (zip) => execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n');
const skillText = (name) => readFile(path.join(built.root, 'skills', name, 'SKILL.md'), 'utf8');

before(async () => {
  out = await mkdtemp(path.join(os.tmpdir(), 'atlas-chatgpt-'));
  built = await buildChatgptPlugin(out);
});

after(() => rm(out, { recursive: true, force: true }));

test('в ZIP один корень плагина и ничего рядом', () => {
  const roots = new Set(entries(built.zip).map((e) => e.split('/')[0]));
  assert.deepEqual([...roots], [built.manifest.name], 'plugin_root_ambiguous / plugin_root_has_siblings');
});

test('в ZIP все скиллы плагина Claude, манифест и иконка', async () => {
  const source = (await readdir(path.join(ROOT, 'plugin/skills'), { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => `${built.manifest.name}/skills/${e.name}/SKILL.md`);
  const list = entries(built.zip);
  for (const file of [...source, `${built.manifest.name}/plugin.json`, `${built.manifest.name}/assets/icon.png`]) {
    assert.ok(list.includes(file), `${file} нет в ZIP`);
  }
});

test('манифест Claude в ZIP не попадает: OpenAI читал бы его вместо нашего', () => {
  assert.ok(!entries(built.zip).some((e) => e.includes('.claude-plugin')));
});

test('иконка, на которую ссылается листинг, лежит в ZIP', () => {
  const ui = built.manifest.extensions['com.openai'].interface;
  const list = entries(built.zip);
  for (const icon of [ui.logo, ui.composerIcon]) {
    assert.ok(list.includes(`${built.manifest.name}/${icon.replace(/^\.\//, '')}`), `${icon} нет в ZIP`);
  }
});

test('frontmatter каждого скилла — валидный YAML с name и description', async () => {
  for (const name of built.skills) {
    const raw = await skillText(name);
    const data = yaml.load(/^---\n([\s\S]*?)\n---/.exec(raw)[1]);
    assert.deepEqual(Object.keys(data), ['name', 'description'], `${name}: лишние ключи`);
    assert.equal(data.name, name);
    assert.ok(data.description.length <= 1024, `${name}: skill_description_too_long`);
    assert.ok(`${built.manifest.name}:${name}`.length <= 64, `${name}: skill_identity_too_long`);
  }
});

test('report в ChatGPT не просит токен и не ходит в Google', async () => {
  const text = await skillText('report');
  assert.doesNotMatch(text, /gcloud|googleapis\.com|Bearer/);
  assert.match(text, /Never ask for a password, an API key or an access token/);
});

test('start в ChatGPT не ищет аудиты по локальным путям и ничего не ставит сам', async () => {
  const text = await skillText('start');
  assert.doesNotMatch(text, /~\/\.agents|^ls /m);
  assert.match(text, /Do not try to install anything/);
});

test('ссылки скиллов на атлас ведут на существующие страницы', async () => {
  const docs = path.join(ROOT, 'src/content/docs');
  for (const name of built.skills) {
    for (const [, slug] of (await skillText(name)).matchAll(/https:\/\/atlas\.smolevich\.com\/([^\s>)]*?)\/?[>)\s]/g)) {
      const candidates = [`${slug}.md`, `${slug}.mdx`, `${slug}/index.md`, `${slug}/index.mdx`];
      const found = await Promise.any(candidates.map((c) => readFile(path.join(docs, c)))).catch(() => null);
      assert.ok(slug === '' || found, `${name}: ссылка на /${slug}/, такой страницы нет`);
    }
  }
});

test('сборка воспроизводима: тот же исходник — тот же ZIP', async () => {
  const again = await mkdtemp(path.join(os.tmpdir(), 'atlas-chatgpt-'));
  try {
    const second = await buildChatgptPlugin(again);
    assert.deepEqual(await readFile(second.zip), await readFile(built.zip));
  } finally {
    await rm(again, { recursive: true, force: true });
  }
});

test('страны заданы явно: без поля портал оставляет прошлый выбор, пустой список — все страны', () => {
  assert.deepEqual(built.manifest.extensions['com.openai'].publication.countries, []);
});

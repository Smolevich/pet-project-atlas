#!/usr/bin/env node
// Чужие скиллы — единственное, на чём стоит /atlas:start, и меняются они без
// нас: репозиторий переезжает, папку переименовывают, лицензия становится
// другой. Страница инструментов при этом продолжает обещать старое.
//
// Скрипт сверяет таблицу на странице с тем, что сейчас лежит в самих
// репозиториях. Сеть нужна, поэтому в CI он живёт отдельной джобой.

import { readFile } from 'node:fs/promises';

const PAGE = 'src/content/docs/tools/skills.md';
const API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const headers = { accept: 'application/vnd.github+json', ...(token ? { authorization: `Bearer ${token}` } : {}) };

async function gh(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

/** Строки таблицы вида `| `skill` | … | Skill, `owner/repo` | MIT |`. */
function parseTable(markdown) {
  const rows = [];
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 5) continue;
    // Проверяем только скиллы: npm-пакеты и платные сервисы в этой же
    // таблице живут по другим правилам, и папки SKILL.md у них нет.
    if (!/^Skill,/.test(cells[3])) continue;
    const source = cells[3].match(/`([\w.-]+\/[\w.-]+)`/);
    if (!source) continue;
    const skill = cells[0].replace(/`/g, '').trim();
    rows.push({ skill, repo: source[1], licence: cells[4] });
  }
  return rows;
}

const rows = parseTable(await readFile(PAGE, 'utf8'));
const problems = [];
const repos = [...new Set(rows.map((r) => r.repo))];

for (const repo of repos) {
  const meta = await gh(`/repos/${repo}`);
  if (!meta) { problems.push(`${repo}: репозитория больше нет`); continue; }
  if (meta.archived) problems.push(`${repo}: репозиторий заархивирован, обновлений не будет`);

  const claimed = rows.find((r) => r.repo === repo).licence;
  const spdx = meta.license?.spdx_id ?? 'нет файла лицензии';
  if (claimed.toLowerCase().includes('paid')) {
    // Платный сервис лицензией не описывается, строку проверяем глазами.
  } else if (!claimed.toLowerCase().includes(spdx.toLowerCase())) {
    problems.push(`${repo}: в таблице «${claimed}», в репозитории «${spdx}»`);
  }

  const tree = await gh(`/repos/${repo}/git/trees/${meta.default_branch}?recursive=1`);
  const paths = (tree?.tree ?? []).map((n) => n.path);
  for (const { skill } of rows.filter((r) => r.repo === repo)) {
    const needle = new RegExp(`(^|/)${skill.toLowerCase()}/skill\\.md$`);
    const found = paths.some((p) => needle.test(p.toLowerCase()));
    if (!found) problems.push(`${repo}: скилла «${skill}» в репозитории нет — страница обещает несуществующее`);
  }
}

console.log(`Проверено репозиториев: ${repos.length}, скиллов: ${rows.length}.`);
if (problems.length === 0) {
  console.log('Расхождений нет.');
} else {
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\nРасхождений: ${problems.length}. Правь таблицу на ${PAGE} и её русскую пару.`);
  process.exitCode = 1;
}

/**
 * ChatGPT-версия плагина собирается из plugin/, а не живёт рядом второй копией.
 * Чистая часть: разбор SKILL.md, подмена разделов, манифест. Файлы и ZIP — в
 * scripts/build-chatgpt-plugin.mjs.
 *
 * Правки лежат в chatgpt/skills/<скилл>/overrides.md блоками `<!-- replace: ## Заголовок -->`.
 * Общие разделы остаются в одном месте, а переписан только тот кусок, который в
 * ChatGPT не может работать: локальные пути, gcloud, команды shell.
 */

/** Ключи frontmatter, которые понимает ChatGPT. Остальное — настройки Claude Code. */
const KEPT_FRONTMATTER = ['name', 'description'];

const PREAMBLE = 'preamble';
const DESCRIPTION = 'description';

/** `---\n…\n---` в начале файла → поля и тело. Значения — одна строка. */
export function parseSkill(raw) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) throw new Error('SKILL.md без frontmatter');
  const fields = {};
  let current = null;
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (kv) {
      current = kv[1];
      fields[current] = kv[2].trim();
    } else if (current) {
      fields[current] += `\n${line}`;
    }
  }
  return { fields, body: raw.slice(match[0].length) };
}

/**
 * Тело → преамбула и разделы второго уровня. `## ` внутри блока кода —
 * пример разметки, а не раздел.
 */
export function splitSections(body) {
  const sections = [{ heading: PREAMBLE, lines: [] }];
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    if (!fence && line.startsWith('## ')) sections.push({ heading: line, lines: [line] });
    else sections.at(-1).lines.push(line);
  }
  return sections.map(({ heading, lines }) => ({ heading, text: lines.join('\n') }));
}

/** Файл правок → Map «что заменить» → «чем». Пустая замена удаляет раздел. */
export function parseOverrides(raw) {
  const overrides = new Map();
  const parts = raw.split(/^<!-- replace: (.+?) -->\n/m);
  if (parts[0].trim()) throw new Error('текст до первого <!-- replace: … --> потеряется');
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i].trim();
    if (overrides.has(key)) throw new Error(`две правки для «${key}»`);
    overrides.set(key, parts[i + 1].trim());
  }
  return overrides;
}

/**
 * Применяет правки. Правка для раздела, которого в исходнике уже нет, — ошибка:
 * иначе после переименования заголовка ChatGPT молча получит старый текст.
 */
export function applyOverrides(raw, overrides) {
  const { fields, body } = parseSkill(raw);
  const sections = splitSections(body);
  const known = new Set([PREAMBLE, DESCRIPTION, ...sections.map((s) => s.heading)]);
  for (const key of overrides.keys()) {
    if (!known.has(key)) throw new Error(`правка для «${key}», а такого раздела в SKILL.md нет`);
  }

  const kept = Object.fromEntries(KEPT_FRONTMATTER.filter((k) => k in fields).map((k) => [k, fields[k]]));
  if (overrides.has(DESCRIPTION)) kept.description = overrides.get(DESCRIPTION).replace(/\s+/g, ' ');

  const parts = sections
    .map(({ heading, text }) => (overrides.has(heading) ? overrides.get(heading) : text.trim()))
    .filter(Boolean);
  const front = Object.entries(kept).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `---\n${front}\n---\n\n${parts.join('\n\n')}\n`;
}

/**
 * Команды Claude Code (`/laviolab-atlas:report`) в ChatGPT не набираются:
 * скилл зовут по имени. Остальной текст не трогаем.
 */
export function neutralizeCommands(text, plugin) {
  return text
    .replace(new RegExp(`^# /${plugin}:([a-z-]+)$`, 'gm'), (_, skill) => `# ${skill}`)
    .replace(new RegExp(`\`/${plugin}:([a-z-]+)\``, 'g'), (_, skill) => `the \`${skill}\` skill`);
}

/** Строки, которых не должно быть в ChatGPT-версии, и почему. */
export const FORBIDDEN = [
  // geo-seo-claude — имя чужого репозитория, а не обращение к модели.
  [/(?<![-\w])claude/i, 'ChatGPT просит нейтральный текст вместо упоминаний Claude'],
  [/gcloud|print-access-token|Authorization: Bearer/i, 'токен из локального gcloud в ChatGPT недоступен, а просить секреты запрещено'],
  [/~\/\.|\.\/\.claude/, 'локальных каталогов пользователя у ChatGPT нет'],
  [/mcp__|allowed-tools|user-invocable/, 'настройки инструментов Claude Code'],
];

export function forbiddenHits(text) {
  return FORBIDDEN.filter(([re]) => re.test(text)).map(([re, why]) => `${re}: ${why}`);
}

/**
 * Манифест в переносимом формате Agent Plugins: идентичность — из манифеста
 * Claude, листинг — из chatgpt/manifest.json. Двух источников имени и версии
 * быть не должно, иначе версии разъедутся.
 */
export function buildManifest(claude, openai) {
  return {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: claude.name,
    version: claude.version,
    description: claude.description,
    author: claude.author,
    homepage: claude.homepage,
    repository: claude.repository,
    license: claude.license,
    keywords: claude.keywords,
    extensions: { 'com.openai': openai },
  };
}

/** Лимиты финальной подачи в каталог (developers.openai.com/plugins/deploy/submission-errors). */
export function listingProblems(manifest) {
  const ui = manifest.extensions['com.openai'].interface;
  const problems = [];
  const max = (value, limit, field) => {
    if (!value || value.length > limit || /\n/.test(value)) problems.push(`${field}: пусто, длиннее ${limit} или в несколько строк`);
  };
  max(ui.displayName, 30, 'displayName');
  max(ui.shortDescription, 30, 'shortDescription');
  max(ui.developerName, 80, 'developerName');
  if (!ui.longDescription || ui.longDescription.length > 4000) problems.push('longDescription: пусто или длиннее 4000');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(manifest.name) || manifest.name.length > 64) problems.push('name: не kebab-case до 64');
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? '')) problems.push('version: не semver');
  const prompts = ui.defaultPrompt ?? [];
  if (prompts.length > 3) problems.push('defaultPrompt: больше трёх');
  for (const p of prompts) max(p, 128, `defaultPrompt «${p.slice(0, 20)}…»`);
  if (new Set(prompts).size !== prompts.length) problems.push('defaultPrompt: повторы');
  if ('screenshots' in ui) problems.push('screenshots: в skills-only ZIP запрещены');
  for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    if (key in ui && !/^https:\/\/[^\s@]+$/.test(ui[key])) problems.push(`${key}: не HTTPS`);
  }
  for (const [lang, t] of Object.entries(manifest.extensions['com.openai'].publication?.translations ?? {})) {
    if (t.subtitle) max(t.subtitle, 30, `translations.${lang}.subtitle`);
    if (t.description && t.description.length > 4000) problems.push(`translations.${lang}.description: длиннее 4000`);
  }
  return problems;
}

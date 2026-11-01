/**
 * Индекс для MCP-сервера из исходников атласа. Чистая часть: frontmatter, MDX
 * в читаемый markdown, нарезка на разделы, пункты чек-листа. Файлы читает
 * scripts/build-mcp-index.mjs.
 *
 * Индекс собирается из src/content/docs, а не из готового HTML: русская ветка там
 * содержит только переведённые страницы, и fallback-адреса с английским текстом
 * в поиск не попадают сами собой.
 */
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';

export const SITE = 'https://atlas.smolevich.com';

/** 'ru/geo/index.md' → { lang: 'ru', slug: 'geo' }; главная — slug ''. */
export function slugOf(relPath) {
  const parts = relPath.replace(/\.mdx?$/, '').split('/');
  const lang = parts[0] === 'ru' ? 'ru' : 'en';
  if (lang === 'ru') parts.shift();
  if (parts.at(-1) === 'index') parts.pop();
  return { lang, slug: parts.join('/') };
}

export function urlOf(lang, slug) {
  const path = [lang === 'ru' ? 'ru' : '', slug].filter(Boolean).join('/');
  return `${SITE}/${path}${path ? '/' : ''}`;
}

/** `---\n…\n---` → поля YAML и тело. */
export function splitFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  return { data: yaml.load(match[1]) ?? {}, body: raw.slice(match[0].length) };
}

const TEXT_ATTRS = ['title', 'alt', 'caption', 'does'];

/** Текстовые атрибуты JSX-компонента: подпись к картинке, заголовок графика. */
function componentText(tag) {
  const found = [];
  for (const attr of TEXT_ATTRS) {
    const match = new RegExp(`\\b${attr}=(?:"([^"]*)"|'([^']*)')`).exec(tag);
    if (match) found.push(match[1] ?? match[2]);
  }
  return found.length ? `(${found.join('. ')})` : '';
}

/**
 * MDX → markdown, который можно цитировать: без import, компоненты заменены их
 * подписями. Блоки кода не трогаем — там `<` бывает частью примера.
 */
export function mdxToMarkdown(body) {
  const out = [];
  let fence = false;
  let tag = null;
  for (const line of body.split('\n')) {
    if (tag !== null) {
      tag += `\n${line}`;
      if (/\/>\s*$|^\s*<\/[A-Z]\w*>\s*$/.test(line)) {
        const text = componentText(tag);
        if (text) out.push(text);
        tag = null;
      }
      continue;
    }
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^import\s.+from\s/.test(line)) continue;
    if (!fence && /^\s*<[A-Z]\w*/.test(line)) {
      if (/\/>\s*$/.test(line)) {
        const text = componentText(line);
        if (text) out.push(text);
      } else {
        tag = line;
      }
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Разделы по заголовкам ## и ###, с якорями как у Starlight (github-slugger,
 * один счётчик на страницу — повторный заголовок получает суффикс).
 */
export function splitChunks(markdown) {
  const slugger = new GithubSlugger();
  const chunks = [{ heading: '', anchor: '', lines: [] }];
  let fence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const heading = !fence && /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      const text = heading[2].replace(/`/g, '').trim();
      chunks.push({ heading: text, anchor: slugger.slug(text), lines: [] });
    } else {
      chunks.at(-1).lines.push(line);
    }
  }
  return chunks
    .map(({ heading, anchor, lines }) => ({ heading, anchor, text: lines.join('\n').trim() }))
    .filter((chunk) => chunk.text);
}

const CHECKBOX = /^- \[ \]\s+(.+)$/;
const ITEM_LINK = /\s+—\s+\[([^\]]+)\]\((\/[^)]*)\)\s*$/;

/** Пункты `- [ ] …` вместе со ссылкой на страницу, которая их объясняет. */
export function checklistItems(markdown, lang) {
  const items = [];
  for (const line of markdown.split('\n')) {
    const box = CHECKBOX.exec(line);
    if (!box) continue;
    const link = ITEM_LINK.exec(box[1]);
    items.push({
      text: link ? box[1].slice(0, link.index).trim() : box[1].trim(),
      page: link ? `${SITE}${link[2]}` : null,
      lang,
    });
  }
  return items;
}

const VERIFY_HEADINGS = new Set(['verify', 'проверить', 'проверка', 'как проверить']);

/** Пункты раздела «Verify»: что проверить, чтобы считать шаг сделанным. */
export function verifySteps(chunks) {
  const verify = chunks.find((chunk) => VERIFY_HEADINGS.has(chunk.heading.toLowerCase()));
  if (!verify) return [];
  return verify.text
    .split('\n')
    .map((line) => /^\s*(?:[-*]|\d+\.)\s+(.+)$/.exec(line)?.[1].trim())
    .filter(Boolean);
}

/** Одна страница индекса из пути и содержимого исходника. */
export function buildPage(relPath, raw) {
  const { data, body } = splitFrontmatter(raw);
  const { lang, slug } = slugOf(relPath);
  const markdown = mdxToMarkdown(body);
  const chunks = splitChunks(markdown);
  return {
    lang,
    slug,
    section: slug.split('/')[0] || 'home',
    url: urlOf(lang, slug),
    title: data.title ?? slug,
    description: data.description ?? '',
    updated: data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : (data.updated ?? null),
    sources: data.sources ?? [],
    markdown,
    chunks,
    checklist: checklistItems(markdown, lang),
    verify: verifySteps(chunks),
  };
}

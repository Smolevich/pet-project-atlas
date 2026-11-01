/**
 * Инструменты MCP-сервера поверх готового индекса. Всё чистое: индекс на входе,
 * объект ответа на выходе, сеть и файлы — в mcp/server.mjs.
 */

const STEM = 5;
const QUOTE_LIMIT = 420;
const STOPWORDS = new Set([
  'the', 'and', 'for', 'how', 'what', 'why', 'does', 'with', 'you', 'your', 'are', 'can', 'not', 'this',
  'that', 'from', 'about', 'into', 'have', 'should', 'when', 'which', 'who',
  'как', 'что', 'это', 'для', 'или', 'если', 'нет', 'надо', 'нужно', 'мне', 'мой', 'про', 'где', 'чем', 'зачем',
  'почему', 'не', 'на', 'по', 'за', 'из', 'от', 'до', 'же', 'ли', 'бы', 'то', 'мы', 'вы', 'он', 'мои', 'моих',
]);

// Как спрашивают и как написано на страницах: «гугл» в тексте атласа — Google,
// а schema-разметка на страницах называется JSON-LD и sameAs. Значения — уже основы.
const SYNONYMS = new Map([
  ['гугл', ['googl']],
  ['яндек', ['yande']],
  ['schem', ['json', 'samea', 'struc']],
  ['схема', ['json', 'samea']],
  ['разме', ['json', 'samea']],
  ['микро', ['json', 'samea']],
]);

/** Основы запроса вместе с тем, как то же самое написано на страницах. */
export function queryStems(text) {
  const base = stems(text);
  return [...new Set([...base, ...base.flatMap((stem) => SYNONYMS.get(stem) ?? [])])];
}

/**
 * Слова запроса → основы. Обрезка до пяти букв — грубый стемминг, но он один и
 * для английского, и для русского: crawler/crawlers, краулер/краулеры совпадают.
 */
export function stems(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map((word) => word.slice(0, STEM));
}

function counts(words) {
  const map = new Map();
  for (const word of words) map.set(word, (map.get(word) ?? 0) + 1);
  return map;
}

/** Разделы всех страниц одного языка — единицы поиска. */
function documents(index, lang) {
  return index.pages
    .filter((page) => page.lang === lang)
    .flatMap((page) => page.chunks.map((chunk) => ({ page, chunk })));
}

/**
 * BM25 по разделу. Заголовок раздела весит как два вхождения в текст, заголовок
 * страницы — как одно. Описание страницы добавлено только к первому разделу: общее
 * для всех разделов делает их одинаковыми, и выигрывает не тот.
 */
function scorer(docs, query) {
  const bags = docs.map(({ page, chunk }) => {
    const heading = stems(chunk.heading);
    const lead = chunk === page.chunks[0] ? stems(page.description) : [];
    return counts([...stems(chunk.text), ...stems(page.title), ...lead, ...heading, ...heading]);
  });
  const avg = bags.reduce((sum, bag) => sum + [...bag.values()].reduce((a, b) => a + b, 0), 0) / (bags.length || 1);
  const df = new Map(query.map((term) => [term, bags.filter((bag) => bag.has(term)).length]));
  return bags.map((bag) => {
    const length = [...bag.values()].reduce((a, b) => a + b, 0);
    return query.reduce((score, term) => {
      const tf = bag.get(term) ?? 0;
      if (!tf) return score;
      const idf = Math.log(1 + (docs.length - df.get(term) + 0.5) / (df.get(term) + 0.5));
      return score + (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (length / avg)));
    }, 0);
  });
}

/** Абзац раздела, где больше всего слов запроса, обрезанный по слову. */
export function bestQuote(text, query) {
  const wanted = new Set(query);
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^(```|~~~|\|)/.test(p));
  let best = paragraphs[0] ?? '';
  let bestHits = -1;
  for (const paragraph of paragraphs) {
    const hits = new Set(stems(paragraph).filter((word) => wanted.has(word))).size;
    if (hits > bestHits) [best, bestHits] = [paragraph, hits];
  }
  const flat = best.replace(/\s+/g, ' ');
  if (flat.length <= QUOTE_LIMIT) return flat;
  return `${flat.slice(0, flat.lastIndexOf(' ', QUOTE_LIMIT))} …`;
}

const anchorUrl = (page, chunk) => (chunk.anchor ? `${page.url}#${chunk.anchor}` : page.url);

/** search_playbook: лучшие разделы с цитатой и ссылкой, не больше двух на страницу. */
export function searchPlaybook(index, { query, lang = 'en', limit = 5 }) {
  const terms = queryStems(query ?? '');
  if (!terms.length) throw new ToolError('query must contain at least one word');
  const docs = documents(index, normalizeLang(lang));
  const scores = scorer(docs, terms);
  const perPage = new Map();
  const results = docs
    .map((doc, i) => ({ ...doc, score: scores[i] }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(({ page }) => {
      perPage.set(page.url, (perPage.get(page.url) ?? 0) + 1);
      return perPage.get(page.url) <= 2;
    })
    .slice(0, clamp(limit, 1, 10))
    .map(({ page, chunk, score }) => ({
      title: page.title,
      section: chunk.heading || null,
      url: anchorUrl(page, chunk),
      quote: bestQuote(chunk.text, terms),
      updated: page.updated,
      score: Math.round(score * 100) / 100,
    }));
  return { query, lang: normalizeLang(lang), results };
}

/** Слаг, путь или полный URL страницы → { lang, slug }. */
export function parseSlug(input) {
  const path = String(input ?? '')
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/[?#].*$/, '');
  const parts = path.split('/').filter(Boolean);
  const lang = parts[0] === 'ru' ? 'ru' : 'en';
  if (lang === 'ru') parts.shift();
  return { lang, slug: parts.join('/') };
}

/** get_page: страница целиком. Неизвестный слаг — ошибка с подсказкой ближайших. */
export function getPage(index, { slug, lang }) {
  const parsed = parseSlug(slug);
  const wantLang = lang ? normalizeLang(lang) : parsed.lang;
  const page =
    index.pages.find((p) => p.slug === parsed.slug && p.lang === wantLang) ??
    index.pages.find((p) => p.slug === parsed.slug && p.lang === 'en');
  if (!page) {
    const near = index.pages
      .filter((p) => p.lang === 'en' && parsed.slug && p.slug.includes(parsed.slug.split('/').at(-1)))
      .map((p) => p.slug);
    throw new ToolError(`No page "${slug}"${near.length ? `; similar: ${near.join(', ')}` : ''}. list_sections returns every slug.`);
  }
  return {
    title: page.title,
    url: page.url,
    lang: page.lang,
    description: page.description,
    updated: page.updated,
    sources: page.sources,
    markdown: page.markdown,
  };
}

/** list_sections: маршрут атласа по порядку, у каждого раздела — его страницы. */
export function listSections(index, { lang = 'en' } = {}) {
  const want = normalizeLang(lang);
  const sections = index.sections.map((section) => ({
    slug: section.slug,
    label: want === 'ru' ? section.ru : section.label,
    pages: index.pages
      .filter((page) => page.lang === want && page.section === section.slug)
      .sort((a, b) => a.slug.split('/').length - b.slug.split('/').length || a.slug.localeCompare(b.slug))
      .map((page) => ({ slug: page.slug, title: page.title, description: page.description, url: page.url })),
  }));
  return { lang: want, sections: sections.filter((section) => section.pages.length) };
}

/**
 * checklist: пункты сквозного чек-листа атласа по теме и шаги «Verify» самой
 * подходящей страницы. Без темы — весь чек-лист по порядку.
 */
export function checklist(index, { topic = '', lang = 'en' } = {}) {
  const want = normalizeLang(lang);
  const items = index.pages.filter((page) => page.lang === want).flatMap((page) => page.checklist);
  const asked = stems(topic);
  if (!asked.length) return { topic: null, lang: want, items, verify: null };

  const terms = new Set(queryStems(topic));
  // Короткая тема — все слова, длинная — половина: иначе «AI» из «robots.txt AI crawlers»
  // и «search» из «Search Console» тянут любой пункт.
  const size = new Set(asked).size;
  const needed = size <= 2 ? size : Math.ceil(size / 2);
  const titles = new Map(index.pages.map((page) => [page.url, `${page.title} ${page.slug}`]));
  const matched = items.filter((item) => {
    const words = new Set(stems(`${item.text} ${titles.get(item.page) ?? ''}`));
    return [...terms].filter((term) => words.has(term)).length >= needed;
  });
  const verify = verifyFor(index, topic, want, matched);
  if (!matched.length && !verify) {
    throw new ToolError(`The atlas has no checklist items on "${topic}". Call checklist without a topic for the full list.`);
  }
  return { topic, lang: want, items: matched, verify };
}

/**
 * Шаги «Verify» той страницы, на которую чаще всего ссылаются найденные пункты;
 * если пунктов нет — первой страницы из поиска, где такие шаги есть.
 */
function verifyFor(index, topic, lang, matched) {
  const withSteps = (url) => index.pages.find((page) => page.url === url && page.verify.length);
  const votes = counts(matched.map((item) => item.page).filter(withSteps));
  const linked = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const page =
    (linked && withSteps(linked)) ??
    searchPlaybook(index, { query: topic, lang, limit: 10 })
      .results.map((result) => withSteps(result.url.split('#')[0]))
      .find(Boolean);
  return page ? { page: page.title, url: page.url, steps: page.verify } : null;
}

export class ToolError extends Error {}

function normalizeLang(lang) {
  return String(lang ?? 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function clamp(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : max;
  return Math.min(max, Math.max(min, number));
}

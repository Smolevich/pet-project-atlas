import yaml from 'js-yaml';

// Обороты, которые не склоняются: сверяем целиком, с границами слова с обеих
// сторон.
export const BANNED_PHRASES = [
  'in the age of ai',
  'cannot be ignored',
  'в эпоху ai',
  'нельзя игнорировать',
];

// Основы, а не целые слова: граница проверяется только слева, окончание любое.
// "leverage" ловит и "leveraging", "экосистем" — и "экосистемы", "unlock" — и
// "unlocks". Сверка целого слова оставляла бы половину списка мёртвой: сайт
// двуязычный, а русские слова из списка склоняются в каждом падеже.
export const BANNED_STEMS = [
  'game-chang',
  'leverag',
  'unlock',
  'dive in',
  'dives in',
  'diving in',
  'synerg',
  'seamless',
  'синерг',
  'экосистем',
  'революционн',
];

// \b не понимает кириллицу как "словесный" символ, поэтому границу слова
// проверяем вручную по классам Unicode-букв и цифр.
const WORD_CHAR = /[\p{L}\p{N}]/u;

function isWordChar(char) {
  return char !== undefined && WORD_CHAR.test(char);
}

function findMatches(text, needle, { rightBoundary }) {
  const matches = [];
  let fromIndex = 0;
  while (true) {
    const index = text.indexOf(needle, fromIndex);
    if (index === -1) break;
    const before = text[index - 1];
    const after = text[index + needle.length];
    const leftOk = !isWordChar(before);
    const rightOk = !rightBoundary || !isWordChar(after);
    if (leftOk && rightOk) {
      // Основу дотягиваем до конца слова, чтобы в ошибке стояло то слово,
      // которое автор написал, а не обрубок из списка.
      let end = index + needle.length;
      while (!rightBoundary && isWordChar(text[end])) end++;
      matches.push({ index, phrase: text.slice(index, end) });
    }
    fromIndex = index + needle.length;
  }
  return matches;
}

// Заменяет символы пробелами, сохраняя длину и переводы строк: индексы
// совпадений остаются валидными для исходного текста.
const blankOut = (fragment) => fragment.replace(/[^\n]/g, ' ');

const INLINE_CODE = /`[^`]*`/g;
const LINK_TARGET = /\]\([^)]*\)/g;
const BARE_URL = /https?:\/\/\S+/g;

// Код и адреса — не проза. Слово в имени команды или в URL автор не выбирал
// как оборот речи, и заменить его на «конкретное утверждение» нельзя.
function blankCodeAndLinks(text) {
  return text.replace(INLINE_CODE, blankOut).replace(LINK_TARGET, blankOut).replace(BARE_URL, blankOut);
}

/** Ищет фразы и основы из бан-листа STYLE.md, регистронезависимо. */
export function findBannedPhrases(text) {
  const lower = blankCodeAndLinks(stripCode(text)).toLowerCase();
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') lineStarts.push(i + 1);
  }
  const lineOf = (index) => {
    let line = 1;
    for (let i = 1; i < lineStarts.length; i++) {
      if (lineStarts[i] > index) break;
      line = i + 1;
    }
    return line;
  };

  const hits = [];
  for (const phrase of BANNED_PHRASES) {
    for (const match of findMatches(lower, phrase, { rightBoundary: true })) {
      hits.push({ phrase: match.phrase, line: lineOf(match.index) });
    }
  }
  for (const stem of BANNED_STEMS) {
    for (const match of findMatches(lower, stem, { rightBoundary: false })) {
      hits.push({ phrase: match.phrase, line: lineOf(match.index) });
    }
  }
  return hits.sort((a, b) => a.line - b.line);
}

export const REQUIRED_SECTIONS = {
  en: ['What we are solving', 'Steps', 'What did not work', 'Verify'],
  ru: ['Что решаем', 'Шаги', 'Что не сработало', 'Проверить'],
};

/** Возвращает заголовки, которых нет или под которыми пусто. */
export function findMissingSections(markdown, lang = 'en') {
  const required = REQUIRED_SECTIONS[lang] ?? REQUIRED_SECTIONS.en;
  const blocks = new Map();
  let current = null;
  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1];
      blocks.set(current, '');
      continue;
    }
    if (current) blocks.set(current, blocks.get(current) + line.trim());
  }
  return required.filter((title) => !blocks.get(title));
}

/** Маска строк, лежащих внутри ``` ```-блока (включая сами маркеры). */
function fenceMask(markdown) {
  let inFence = false;
  return markdown.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return true;
    }
    return inFence;
  });
}

// Забивает ``` ```-блоки пробелами, а не убирает их: и номера строк, и
// смещения символов у остального текста остаются прежними.
function stripCode(markdown) {
  const mask = fenceMask(markdown);
  return markdown
    .split('\n')
    .map((line, i) => (mask[i] ? blankOut(line) : line))
    .join('\n');
}

/** Ищет предложения длиннее maxWords слов вне кода, таблиц и отступов. */
export function findLongSentences(markdown, maxWords = 20) {
  const stripped = stripCode(markdown);
  const hits = [];
  stripped.split('\n').forEach((line, i) => {
    if (line.startsWith('|') || line.startsWith('    ')) return;
    const trimmed = line.trim();
    if (!trimmed) return;
    for (const sentence of trimmed.split(/(?<=[.!?])\s+/).filter(Boolean)) {
      const words = sentence.split(/\s+/).filter(Boolean);
      if (words.length > maxWords) hits.push({ line: i + 1, words: words.length });
    }
  });
  return hits;
}

const FRONTMATTER = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/;

/**
 * Разбирает frontmatter настоящим YAML-парсером.
 *
 * Возвращает { data, body, bodyStartLine, error }. bodyStartLine — номер
 * первой строки тела в файле: линтер прибавляет его к своим номерам, иначе
 * автор открывает не ту строку. error заполняется, если YAML не разобрался.
 */
export function parseFrontmatter(raw) {
  // CRLF: без нормализации regexp не находил frontmatter вовсе, и весь
  // frontmatter уходил в тело как проза.
  const text = raw.replace(/\r\n/g, '\n');
  const match = text.match(FRONTMATTER);
  if (!match) return { data: {}, body: text, bodyStartLine: 1 };

  const consumed = match[0];
  const body = text.slice(consumed.length);
  const bodyStartLine = consumed.split('\n').length;

  try {
    const data = yaml.load(match[1]);
    return { data: data && typeof data === 'object' ? data : {}, body, bodyStartLine };
  } catch (error) {
    return { data: {}, body, bodyStartLine, error: error.message };
  }
}

const NUMBER_PATTERN = /\d/;

// Слова инструментов/версий, за которыми номер — идентификатор, а не измерение:
// "Node 24", "Astro 7", "HTTP/2", "Starlight 0.41.7".
const TOOL_WORDS = [
  'node', 'astro', 'starlight', 'http', 'https', 'python', 'npm',
  'react', 'vue', 'typescript', 'chrome', 'firefox', 'ios', 'macos',
  'windows', 'ubuntu', 'docker', 'postgresql', 'postgres', 'mysql',
  'redis', 'nginx', 'ssh', 'tls', 'ssl',
  // Номера стандартов: "RFC 9309", "ISO 8601", "PEP 695".
  'rfc', 'iso', 'pep', 'ecma',
];
const TOOL_VERSION_PATTERN = new RegExp(
  `\\b(?:${TOOL_WORDS.join('|')})[/\\s]?v?\\d+(?:\\.\\d+)*\\b`,
  'gi',
);

// Версия по форме, без имени инструмента рядом: либо с префиксом "v" ("v1.2"),
// либо из трёх и более частей ("7.0.2"). Голое "9.99" — десятичная дробь, то
// есть измерение; раньше оно проходило как версия и уносило с собой цены и
// проценты. Валюта или процент рядом снимают версию однозначно.
const DOTTED_VERSION_PATTERN = /(?<![$€£₽¥])\b(?:v\d+(?:\.\d+)+|\d+\.\d+\.\d+(?:\.\d+)*)\b(?!\s*%)/gi;

// Цифра, приклеенная к концу слова, — часть имени: GA4, GPT-4, IPv6, H2,
// Apache-2.0. Цифра перед словом — измерение: "200ms", "40%". Граница слова
// проверяется вручную: \b не считает кириллицу словесным символом.
const NAMED_IDENTIFIER_PATTERN = /(?<![\p{L}\p{N}])\p{L}+[-/]?\d+(?:\.\d+)*(?![\p{L}\p{N}])/gu;

// Дата и год — не измерения. Год ограничен диапазоном, чтобы "1200 кликов"
// осталось числом; рядом с валютой или процентом это уже не год.
const ISO_DATE_PATTERN = /(?<![\p{L}\p{N}])\d{4}-\d{2}-\d{2}(?![\p{L}\p{N}])/gu;
const YEAR_PATTERN = /(?<![\p{L}\p{N}$€£₽¥.])(?:19|20)\d{2}(?![\p{L}\p{N}%]|\.\d)/gu;

const EMAIL_PATTERN = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu;
const HANDLE_PATTERN = /(?<![\p{L}\p{N}])@[\p{L}\p{N}_-]+/gu;

// "1. ", "2) ", "- 1. ", "**1. ", "## 1. " — порядок шагов, а не измерение.
const ORDINAL_PREFIX = /^(\s*(?:[-*+]\s+)?(?:#{1,6}\s+)?(?:\*\*|__|\*|_)?\s*)\d+[.)](?=\s|\*|_|$)/;

// Убирает из строки то, что несёт цифры, но не является утверждением:
// порядковый номер, inline-код, цель markdown-ссылки, URL, почту, никнейм.
function stripNonClaimNoise(line) {
  return line
    .replace(ORDINAL_PREFIX, '$1')
    .replace(INLINE_CODE, ' ')
    .replace(LINK_TARGET, ']')
    .replace(BARE_URL, ' ')
    .replace(EMAIL_PATTERN, ' ')
    .replace(HANDLE_PATTERN, ' ');
}

/** Строки прозы (вне кода) с числом-утверждением, когда data.sources пуст. */
export function findUnsourcedNumbers(markdown, data) {
  if (Array.isArray(data?.sources) && data.sources.length > 0) return [];

  const stripped = stripCode(markdown);
  const hits = [];
  stripped.split('\n').forEach((line, i) => {
    // Таблицы и заголовки не освобождены от источника: STYLE.md §5 выводит из
    // подсчёта только длину. В таблицах числа как раз и живут.
    if (line.startsWith('    ')) return;

    const withoutNoise = stripNonClaimNoise(line);
    const withoutIdentifiers = withoutNoise
      .replace(ISO_DATE_PATTERN, '')
      .replace(TOOL_VERSION_PATTERN, '')
      .replace(NAMED_IDENTIFIER_PATTERN, '')
      .replace(DOTTED_VERSION_PATTERN, '')
      .replace(YEAR_PATTERN, '');

    if (NUMBER_PATTERN.test(withoutIdentifiers)) hits.push({ line: i + 1, text: line.trim() });
  });
  return hits;
}

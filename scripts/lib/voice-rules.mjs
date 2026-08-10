export const BANNED_PHRASES = [
  'game-changer',
  'leverage',
  'unlock',
  'dive in',
  'synergy',
  'seamless',
  'in the age of ai',
  'cannot be ignored',
  'в эпоху ai',
  'нельзя игнорировать',
  'синергия',
  'экосистема',
];

// "революционн" — падежная основа, а не целое слово: "революционный",
// "революционная", "революционные" и т.д. Проверка границы с обеих сторон
// сделала бы этот пункт списка мёртвым.
export const BANNED_STEMS = ['революционн'];

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
    if (leftOk && rightOk) matches.push(index);
    fromIndex = index + needle.length;
  }
  return matches;
}

/** Ищет фразы и основы из бан-листа STYLE.md, регистронезависимо. */
export function findBannedPhrases(text) {
  const lower = text.toLowerCase();
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
    for (const index of findMatches(lower, phrase, { rightBoundary: true })) {
      hits.push({ phrase, line: lineOf(index) });
    }
  }
  for (const stem of BANNED_STEMS) {
    for (const index of findMatches(lower, stem, { rightBoundary: false })) {
      hits.push({ phrase: stem, line: lineOf(index) });
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

// Заменяет содержимое ``` ``` -блоков пустыми строками, а не убирает их,
// чтобы номера строк у остального текста не съезжали.
function stripCode(markdown) {
  const lines = markdown.split('\n');
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return '';
      }
      return inFence ? '' : line;
    })
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

// Минимальный YAML: скалярные "key: value" и простые списки через "  - item".
// Полноценный парсер не нужен — frontmatter атласа заведомо плоский.
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const [, frontmatter, body] = match;
  const data = {};
  let currentListKey = null;

  for (const line of frontmatter.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+?)\s*$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(listItem[1]);
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*$/);
    if (!pair) continue;
    const [, key, value] = pair;
    if (value === '') {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = value;
      currentListKey = null;
    }
  }

  return { data, body };
}

const NUMBER_PATTERN = /\d/;

// Слова инструментов/версий, за которыми номер — идентификатор, а не измерение:
// "Node 24", "Astro 7", "HTTP/2", "Starlight 0.41.7".
const TOOL_WORDS = [
  'node', 'astro', 'starlight', 'http', 'https', 'python', 'npm',
  'react', 'vue', 'typescript', 'chrome', 'firefox', 'ios', 'macos',
  'windows', 'ubuntu', 'docker', 'postgresql', 'postgres', 'mysql',
  'redis', 'nginx', 'ssh', 'tls', 'ssl', 'es',
];
const TOOL_VERSION_PATTERN = new RegExp(
  `\\b(?:${TOOL_WORDS.join('|')})[/\\s]?v?\\d+(?:\\.\\d+)*\\b`,
  'gi',
);

// "7.0.2", "v1.2" — версия по форме, даже без имени инструмента рядом.
const DOTTED_VERSION_PATTERN = /\bv?\d+\.\d+(?:\.\d+)*\b/gi;

// Убирает из строки то, что несёт цифры, но не является утверждением:
// inline-код, цель markdown-ссылки, голый URL.
function stripNonClaimNoise(line) {
  return line
    // Маркер нумерованного списка — порядок шагов, а не измерение.
    .replace(/^\s*\d+[.)]\s+/, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, '');
}

/** Строки прозы (вне кода) с числом-утверждением, когда data.sources пуст. */
export function findUnsourcedNumbers(markdown, data) {
  if (Array.isArray(data?.sources) && data.sources.length > 0) return [];

  const stripped = stripCode(markdown);
  const hits = [];
  stripped.split('\n').forEach((line, i) => {
    if (line.startsWith('|') || line.startsWith('    ') || line.trimStart().startsWith('#')) return;

    const withoutNoise = stripNonClaimNoise(line);
    const withoutIdentifiers = withoutNoise
      .replace(TOOL_VERSION_PATTERN, '')
      .replace(DOTTED_VERSION_PATTERN, '');

    if (NUMBER_PATTERN.test(withoutIdentifiers)) hits.push({ line: i + 1, text: line.trim() });
  });
  return hits;
}

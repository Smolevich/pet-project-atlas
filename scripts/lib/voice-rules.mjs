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

const H2 = /^##\s+(.+?)\s*$/;

/** Заголовки второго уровня в порядке появления, без тех, что внутри кода. */
function collectH2(markdown) {
  const mask = fenceMask(markdown);
  const headings = [];
  markdown.split('\n').forEach((line, i) => {
    if (mask[i]) return;
    const match = line.match(H2);
    if (match) headings.push({ title: match[1], line: i + 1 });
  });
  return headings;
}

/** Возвращает заголовки, которых нет или под которыми пусто. */
export function findMissingSections(markdown, lang = 'en') {
  const required = REQUIRED_SECTIONS[lang] ?? REQUIRED_SECTIONS.en;
  const mask = fenceMask(markdown);
  const blocks = new Map();
  let current = null;
  markdown.split('\n').forEach((line, i) => {
    // Заголовок внутри ``` ```-блока — это пример разметки, а не раздел
    // страницы. Иначе страница с одним шаблоном в блоке кода проходила
    // проверку формы, не имея ни одного настоящего раздела.
    if (!mask[i]) {
      const heading = line.match(H2);
      if (heading) {
        current = heading[1];
        blocks.set(current, '');
        return;
      }
    }
    // Тело считается по исходным строкам, включая код: раздел, под которым
    // только команда, не пустой.
    if (current) blocks.set(current, blocks.get(current) + line.trim());
  });
  return required.filter((title) => !blocks.get(title));
}

/** Сколько обязательных блоков страница вообще объявила. */
export function countRequiredSections(markdown, lang = 'en') {
  const required = REQUIRED_SECTIONS[lang] ?? REQUIRED_SECTIONS.en;
  const declared = new Set(collectH2(markdown).map((heading) => heading.title));
  return required.filter((title) => declared.has(title)).length;
}

/**
 * Проверяет то, что STYLE.md §2 обещает словами: четыре блока идут в этом
 * порядке и раньше любого другого H2. Возвращает [] или один объект
 * { expected, actual }.
 */
export function findSectionOrderProblems(markdown, lang = 'en') {
  const required = REQUIRED_SECTIONS[lang] ?? REQUIRED_SECTIONS.en;
  const headings = collectH2(markdown).map((heading) => heading.title);
  // Отсутствующий блок — забота findMissingSections. Две ошибки на одну
  // причину автору ничего не добавляют.
  if (required.some((title) => !headings.includes(title))) return [];

  const actual = headings.slice(0, required.length);
  if (actual.every((title, i) => title === required[i])) return [];
  return [{ expected: required, actual }];
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

const LIST_MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;
const HEADING_LINE = /^\s*#{1,6}\s+/;
const BLOCKQUOTE = /^\s*>/;

/**
 * Собирает соседние строки прозы в один блок. Предложение живёт в абзаце, а
 * не в строке: при жёстком переносе построчная проверка не видела ничего
 * длинного, а переносы никто не запрещал.
 *
 * Пункт списка, заголовок и цитата начинают новый блок — их склейка дала бы
 * предложение-химеру. Код, таблицы и отступы по STYLE.md §5 не считаются.
 */
function paragraphUnits(markdown) {
  const mask = fenceMask(markdown);
  const units = [];
  let current = null;
  const flush = () => {
    if (current) units.push(current);
    current = null;
  };

  markdown.split('\n').forEach((line, i) => {
    if (mask[i] || !line.trim() || line.startsWith('|') || line.startsWith('    ')) {
      flush();
      return;
    }
    const trimmed = line.trim();
    const startsUnit = LIST_MARKER.test(line) || HEADING_LINE.test(line) || BLOCKQUOTE.test(line);
    if (!current || startsUnit) {
      flush();
      current = { text: trimmed, starts: [{ offset: 0, line: i + 1 }] };
      return;
    }
    current.starts.push({ offset: current.text.length + 1, line: i + 1 });
    current.text += ` ${trimmed}`;
  });
  flush();
  return units;
}

function splitSentences(text) {
  const sentences = [];
  const boundary = /(?<=[.!?])\s+/g;
  let start = 0;
  let match;
  while ((match = boundary.exec(text)) !== null) {
    sentences.push({ text: text.slice(start, match.index), offset: start });
    start = match.index + match[0].length;
  }
  if (start < text.length) sentences.push({ text: text.slice(start), offset: start });
  return sentences;
}

function lineAt(unit, offset) {
  let line = unit.starts[0].line;
  for (const start of unit.starts) {
    if (start.offset > offset) break;
    line = start.line;
  }
  return line;
}

/** Ищет предложения длиннее maxWords слов вне кода, таблиц и отступов. */
export function findLongSentences(markdown, maxWords = 20) {
  const hits = [];
  for (const unit of paragraphUnits(markdown)) {
    for (const sentence of splitSentences(unit.text)) {
      const words = sentence.text.split(/\s+/).filter(Boolean);
      if (words.length > maxWords) hits.push({ line: lineAt(unit, sentence.offset), words: words.length });
    }
  }
  return hits.sort((a, b) => a.line - b.line);
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

/** Строки прозы (вне кода) с числом-утверждением, независимо от frontmatter. */
export function findNumericClaims(markdown) {
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

// Область замера: ключевое слово из закрытого списка плюс один
// идентификатор. Домен, репозиторий, хэндл бота, номер счёта — что угодно,
// по чему замер можно повторить. Именно это и не даёт записи выродиться в
// «мои данные»: назвать область словами общего смысла нельзя.
const PROVENANCE_SCOPES = [
  'property', 'account', 'project', 'site', 'repo',
  'workspace', 'dataset', 'instance', 'channel', 'bot', 'table',
];
const PROVENANCE_SCOPE_PATTERN = new RegExp(`^(?:${PROVENANCE_SCOPES.join('|')})\\s+\\S{3,}$`, 'i');
const PROVENANCE_DATE_PATTERN = /^measured (\d{4})-(\d{2})-(\d{2})$/;
// Прибор нельзя назвать «своими данными»: это не прибор, а отказ отвечать.
const VAGUE_INSTRUMENT = /^(?:my|our|own|personal|internal|свои|своя|мои|наши|собственн)/i;

function isRealDate(year, month, day) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

function isHttpUrl(entry) {
  try {
    return /^https?:$/.test(new URL(entry).protocol);
  } catch {
    return false;
  }
}

/**
 * Строка происхождения для замера, у которого нет публичного URL:
 * "Search Console, property atlas.smolevich.com, measured 2026-08-10".
 * Ровно три части: прибор, область с идентификатором, дата замера.
 */
export function isProvenanceSource(entry) {
  if (typeof entry !== 'string') return false;
  const parts = entry.split(',').map((part) => part.trim());
  if (parts.length !== 3) return false;

  const [instrument, scope, measured] = parts;
  if (instrument.length < 3 || VAGUE_INSTRUMENT.test(instrument)) return false;
  if (!/^[\p{L}\p{N}]/u.test(instrument)) return false;
  if (!PROVENANCE_SCOPE_PATTERN.test(scope)) return false;

  const date = measured.match(PROVENANCE_DATE_PATTERN);
  return date !== null && isRealDate(date[1], date[2], date[3]);
}

/** Годный источник — http(s)-URL либо строка происхождения. */
export function isValidSource(entry) {
  return isHttpUrl(entry) || isProvenanceSource(entry);
}

/** Записи из sources:, которые источником не являются. */
export function findInvalidSources(data) {
  const sources = Array.isArray(data?.sources) ? data.sources : [];
  return sources.filter((entry) => !isValidSource(entry));
}

/** То же, но только когда в sources: нет ни одного годного источника. */
export function findUnsourcedNumbers(markdown, data) {
  const sources = Array.isArray(data?.sources) ? data.sources : [];
  if (sources.some(isValidSource)) return [];
  return findNumericClaims(markdown);
}

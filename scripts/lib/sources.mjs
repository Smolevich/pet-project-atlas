/**
 * Записи sources: в виде, готовом к показу читателю. Чистая часть: решить,
 * ссылка это или собственный замер, и разобрать запись на части. Слова и
 * разметка — в src/components/Sources.astro.
 *
 * В сеть здесь не ходят: на сборке заголовок чужой страницы взять неоткуда,
 * поэтому его пишет автор рядом со ссылкой. Без заголовка остаётся хост с
 * путём — читаемо ровно настолько, насколько читается сам адрес.
 */

import { parseProvenance, splitTitledSource } from './voice-rules.mjs';

/**
 * Типы нужны разметке: по kind она выбирает ветку, а по наличию instrument —
 * собрать замер по частям или показать строку как есть.
 *
 * @typedef {{ kind: 'url', href: string, host: string, path: string, title?: string }} UrlSource
 * @typedef {{ kind: 'provenance', text: string, instrument: string, scope: string, identifier: string, measured: string }} MeasuredSource
 * @typedef {{ kind: 'provenance', text: string, instrument?: undefined }} UnparsedSource
 * @typedef {UrlSource | MeasuredSource | UnparsedSource} Source
 * @typedef {MeasuredSource & { identifiers: string[] }} GroupedSource
 * @typedef {UrlSource | UnparsedSource | GroupedSource} ShownSource
 */

/**
 * Одна запись sources:. URL превращается в
 * { kind: 'url', href, host, path, title? }, строка происхождения — в
 * { kind: 'provenance', text, instrument, scope, identifier, measured }.
 *
 * Всё, что не разобралось как http(s)-адрес, уходит в текст: у замера
 * публичной ссылки нет, и рисовать её битой хуже, чем не рисовать вовсе.
 *
 * @param {unknown} entry
 * @returns {Source}
 */
export function describeSource(entry) {
  const text = String(entry).trim();

  const provenance = parseProvenance(text);
  if (provenance) return { kind: 'provenance', text, ...provenance };

  const titled = splitTitledSource(text);
  const target = titled ? titled.url : text;

  let url;
  try {
    url = new URL(target);
  } catch {
    return { kind: 'provenance', text };
  }
  if (!/^https?:$/.test(url.protocol)) return { kind: 'provenance', text };

  /** @type {UrlSource} */
  const described = {
    kind: 'url',
    href: target,
    host: url.host.replace(/^www\./, ''),
    // Голый слеш пути ничего не добавляет к хосту, остальной путь различает
    // соседние ссылки на один и тот же домен.
    path: `${url.pathname}${url.search}${url.hash}`.replace(/^\/$/, ''),
  };
  return titled ? { ...described, title: titled.title } : described;
}

/**
 * Записи в порядке показа: сначала собственные замеры, потом публикации.
 * Замер — это «я это измерил сам», и он важнее чужой ссылки, поэтому стоит
 * первым. Внутри группы порядок автора сохраняется.
 *
 * @param {unknown} entries
 * @returns {Source[]}
 */
export function orderSources(entries) {
  const described = (Array.isArray(entries) ? entries : []).map(describeSource);
  return [
    ...described.filter((source) => source.kind === 'provenance'),
    ...described.filter((source) => source.kind === 'url'),
  ];
}

/**
 * Склеивает свои замеры, у которых совпадают инструмент, область и дата.
 *
 * Шесть таблиц одной базы за один день стояли шестью почти одинаковыми
 * строками: различался только идентификатор, а читалось это как свалка.
 * Во frontmatter они остаются по одной — так их проверяет линтер и так видно,
 * что именно снято, — а склейка живёт на показе.
 *
 * @param {Source[]} sources
 * @returns {ShownSource[]}
 */
export function groupOwnMeasurements(sources) {
  /** @type {ShownSource[]} */
  const out = [];
  const seen = new Map();
  for (const source of sources) {
    if (source.kind !== 'provenance' || !source.instrument) {
      out.push(source);
      continue;
    }
    const key = `${source.instrument}|${source.scope}|${source.measured}`;
    const at = seen.get(key);
    if (at === undefined) {
      seen.set(key, out.length);
      out.push({ ...source, identifiers: [source.identifier] });
    } else {
      // По ключу в seen лежит только запись, прошедшая ветку выше, то есть
      // уже склеенная — у неё identifiers есть.
      const grouped = /** @type {GroupedSource} */ (out[at]);
      grouped.identifiers.push(source.identifier);
    }
  }
  return out;
}

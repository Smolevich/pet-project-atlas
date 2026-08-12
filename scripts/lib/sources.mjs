/**
 * Записи sources: в виде, готовом к показу читателю. Чистая часть: решить,
 * ссылка это или собственный замер, и из чего собрать текст ссылки. Разметка —
 * в src/components/Sources.astro.
 *
 * В сеть здесь не ходят: на сборке заголовок чужой страницы взять неоткуда,
 * поэтому текстом ссылки служит хост, а путь идёт вторым планом.
 */

import { isProvenanceSource } from './voice-rules.mjs';

/**
 * Одна запись sources:. URL превращается в { kind: 'url', href, host, path },
 * строка происхождения — в { kind: 'provenance', text }.
 *
 * Всё, что не разобралось как http(s)-адрес, уходит в текст: у замера
 * публичной ссылки нет, и рисовать её битой хуже, чем не рисовать вовсе.
 */
export function describeSource(entry) {
  const text = String(entry).trim();
  if (isProvenanceSource(text)) return { kind: 'provenance', text };

  let url;
  try {
    url = new URL(text);
  } catch {
    return { kind: 'provenance', text };
  }
  if (!/^https?:$/.test(url.protocol)) return { kind: 'provenance', text };

  return {
    kind: 'url',
    href: text,
    host: url.host.replace(/^www\./, ''),
    // Голый слеш пути ничего не добавляет к хосту, остальной путь различает
    // соседние ссылки на один и тот же домен.
    path: `${url.pathname}${url.search}${url.hash}`.replace(/^\/$/, ''),
  };
}

/**
 * Записи в порядке показа: сначала собственные замеры, потом публикации.
 * Замер — это «я это измерил сам», и он важнее чужой ссылки, поэтому стоит
 * первым. Внутри группы порядок автора сохраняется.
 */
export function orderSources(entries) {
  const described = (Array.isArray(entries) ? entries : []).map(describeSource);
  return [
    ...described.filter((source) => source.kind === 'provenance'),
    ...described.filter((source) => source.kind === 'url'),
  ];
}

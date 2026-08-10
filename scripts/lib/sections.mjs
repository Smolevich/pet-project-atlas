/**
 * Разделы атласа. Порядок и есть маршрут «0 -> первый трафик».
 *
 * Живёт в scripts/, потому что список читают двое: astro.config.mjs строит по нему
 * сайдбар, а генератор llms.txt — заголовки разделов. Две копии разъехались бы.
 */
export const SECTIONS = [
  { slug: 'start', label: 'Start here', ru: 'Начать здесь' },
  { slug: 'indexing', label: '1. Indexing', ru: '1. Индексация' },
  { slug: 'geo', label: '2. AI search', ru: '2. AI-поиск' },
  { slug: 'content', label: '3. Content', ru: '3. Контент' },
  { slug: 'distribution', label: '4. Distribution', ru: '4. Дистрибуция' },
  { slug: 'analytics', label: '5. Analytics', ru: '5. Аналитика' },
  { slug: 'money', label: '6. Money', ru: '6. Деньги' },
  { slug: 'tools', label: 'Tools', ru: 'Инструменты' },
  { slug: 'cases', label: 'Cases', ru: 'Кейсы' },
];

/**
 * Разделы атласа. Порядок и есть маршрут «0 -> первый трафик».
 *
 * Живёт в scripts/, потому что список читают двое: astro.config.mjs строит по нему
 * сайдбар, а генератор llms.txt — заголовки разделов. Две копии разъехались бы.
 */
export const SECTIONS = [
  { slug: 'start', label: 'Start here', ru: 'Начать здесь' },
  { slug: 'demand', label: '1. Demand', ru: '1. Спрос' },
  { slug: 'indexing', label: '2. Indexing', ru: '2. Индексация' },
  { slug: 'geo', label: '3. AI search', ru: '3. AI-поиск' },
  { slug: 'content', label: '4. Content', ru: '4. Контент' },
  { slug: 'distribution', label: '5. Distribution', ru: '5. Дистрибуция' },
  { slug: 'analytics', label: '6. Analytics', ru: '6. Аналитика' },
  { slug: 'money', label: '7. Money', ru: '7. Деньги' },
  { slug: 'tools', label: 'Tools', ru: 'Инструменты' },
  { slug: 'cases', label: 'Cases', ru: 'Кейсы' },
];

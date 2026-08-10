/**
 * Маршрут атласа: шесть разделов в порядке, в котором приходят проблемы.
 * Слаги и подписи должны совпадать с SECTIONS в astro.config.mjs.
 */
export type RouteSection = {
  num: number;
  slug: string;
  label: string;
  /** Симптом читателя, а не описание раздела. */
  symptom: string;
};

export const ROUTE: RouteSection[] = [
  {
    num: 1,
    slug: 'indexing',
    label: 'Indexing',
    symptom: 'Search engines know your home page and none of the others.',
  },
  {
    num: 2,
    slug: 'geo',
    label: 'AI search',
    symptom: 'People ask ChatGPT for a tool like yours and get a competitor.',
  },
  {
    num: 3,
    slug: 'content',
    label: 'Content',
    symptom: 'Nobody searches your product by name yet, and you have nothing else to publish.',
  },
  {
    num: 4,
    slug: 'distribution',
    label: 'Distribution',
    symptom: 'You posted the launch once, and the next day the graph was flat again.',
  },
  {
    num: 5,
    slug: 'analytics',
    label: 'Analytics',
    symptom: 'Signups arrive and you cannot say which channel sent them.',
  },
  {
    num: 6,
    slug: 'money',
    label: 'Money',
    symptom: 'People use it for free and you do not know what to charge.',
  },
];

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

// Подписи для локали ru. Номера и слаги общие, поэтому здесь только текст.
const ROUTE_RU: Record<string, Pick<RouteSection, 'label' | 'symptom'>> = {
  indexing: {
    label: 'Индексация',
    symptom: 'Поиск знает главную и больше ни одной страницы.',
  },
  geo: {
    label: 'AI-поиск',
    symptom: 'У ChatGPT спрашивают инструмент вроде вашего и получают конкурента.',
  },
  content: {
    label: 'Контент',
    symptom: 'По имени продукта ещё никто не ищет, а публиковать больше нечего.',
  },
  distribution: {
    label: 'Дистрибуция',
    symptom: 'Про запуск написали один раз, на следующий день график снова ровный.',
  },
  analytics: {
    label: 'Аналитика',
    symptom: 'Регистрации идут, а из какого канала — сказать нечем.',
  },
  money: {
    label: 'Деньги',
    symptom: 'Пользуются бесплатно, а сколько просить — непонятно.',
  },
};

const MAP_TITLE = {
  en: 'The route: indexing, AI search, content, distribution, analytics, money.',
  ru: 'Маршрут: индексация, AI-поиск, контент, дистрибуция, аналитика, деньги.',
};

/**
 * Разделы с подписями и ссылками под локаль страницы.
 * Корневая локаль (undefined) и любая незнакомая читают английский набор.
 */
export function routeFor(locale?: string): (RouteSection & { href: string })[] {
  const ru = locale === 'ru';
  return ROUTE.map((section) => ({
    ...section,
    ...(ru ? ROUTE_RU[section.slug] : null),
    href: ru ? `/ru/${section.slug}/` : `/${section.slug}/`,
  }));
}

/** Текстовая альтернатива карты маршрута — её читает скринридер. */
export function mapTitleFor(locale?: string): string {
  return locale === 'ru' ? MAP_TITLE.ru : MAP_TITLE.en;
}

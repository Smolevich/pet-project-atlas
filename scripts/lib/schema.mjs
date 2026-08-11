/**
 * JSON-LD атласа одним графом: сайт, автор, страница. Чистая часть — на вход
 * данные страницы, на выход объект. Рендер — в src/components/Head.astro.
 *
 * Зачем вообще: на /geo/citable-pages/ восьмым шагом стоит `sameAs` — список
 * профилей, который сшивает разрозненные упоминания в одну сущность. У самого
 * атласа разметки не было ни строчки.
 *
 * Живёт в scripts/, потому что npm test запускает только scripts/**\/*.test.mjs,
 * а разметка ломается молча: сломанный @id никто не заметит до следующего аудита.
 */

const CONTEXT = 'https://schema.org';

/**
 * Автор. Список профилей повторяет разметку smolevich.com — сущность у них одна,
 * и разойтись эти два списка не должны. Каждый адрес открывается: неверный
 * sameAs ломает ровно то склеивание, ради которого его и пишут.
 */
export const AUTHOR = {
  name: 'Stanislav Shupilkin',
  url: 'https://smolevich.com',
  sameAs: [
    'https://github.com/Smolevich',
    'https://www.linkedin.com/in/stanislav-shupilkin-59482bb4/',
    'https://t.me/naturalists_notes_st',
    'https://getmentor.dev/mentor/stanislav-shupilkin-5321',
    'https://skills.sh/smolevich',
  ],
};

const idAt = (base, fragment) => new URL(`#${fragment}`, base).href;

// Корень локали Starlight отдаёт как '/ru', а страница лежит по '/ru/'. Без
// слеша и @id, и url узла указали бы на адрес, которого на сайте нет.
const directoryUrl = (url) => (url.endsWith('/') ? url : `${url}/`);

/** Автор как отдельный узел графа, на который ссылаются страницы. */
export function personNode(siteRoot) {
  return { '@type': 'Person', '@id': idAt(siteRoot, 'person'), ...AUTHOR };
}

/**
 * Языковая ветка сайта. У каждой свой @id и свой inLanguage: одна сущность с
 * двумя значениями языка — это противоречие, а не двуязычие.
 */
export function websiteNode({ localeRoot, name, inLanguage, siteRoot }) {
  const root = directoryUrl(localeRoot);
  return {
    '@type': 'WebSite',
    '@id': idAt(root, 'website'),
    url: root,
    name,
    inLanguage,
    author: { '@id': idAt(siteRoot, 'person') },
  };
}

/**
 * Страница атласа — TechArticle: не заметка и не новость, а процедура с шагами
 * и проверкой. dateModified ставится только из `updated:` во frontmatter.
 * Даты публикации у страниц нет, и подставлять вместо неё дату сборки нельзя:
 * выдуманная свежесть хуже отсутствующей.
 */
export function articleNode({ url, headline, description, inLanguage, dateModified, localeRoot, siteRoot }) {
  return {
    '@type': 'TechArticle',
    '@id': idAt(url, 'article'),
    url,
    headline,
    ...(description ? { description } : {}),
    inLanguage,
    ...(dateModified ? { dateModified } : {}),
    author: { '@id': idAt(siteRoot, 'person') },
    isPartOf: { '@id': idAt(directoryUrl(localeRoot), 'website') },
  };
}

/**
 * Граф одной страницы. `page` опускается там, где статьи нет, — на главной с
 * hero и на 404: у них нет ни текста процедуры, ни даты.
 */
export function pageGraph({ siteRoot, localeRoot, siteName, inLanguage, page }) {
  const graph = [
    websiteNode({ localeRoot, name: siteName, inLanguage, siteRoot }),
    personNode(siteRoot),
  ];
  if (page) graph.push(articleNode({ ...page, localeRoot, siteRoot }));
  return { '@context': CONTEXT, '@graph': graph };
}

/** Дата в ISO без времени: у `updated:` время не замеряют. */
export function isoDate(date) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

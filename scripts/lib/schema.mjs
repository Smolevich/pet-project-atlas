/**
 * JSON-LD атласа одним графом: сайт, автор, статья, хлебные крошки и процедура.
 * Чистая часть — на вход данные страницы, на выход объект. Рендер — в
 * src/components/Head.astro.
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
  // Узел laviolab.com/#stanislav в sameAs не кладём: там только адреса профилей,
  // а свойства «тот же человек, что узел X» у schema.org нет. Связь идёт через
  // студию, которую он основал, — она и указывает на #stanislav как на основателя.
  affiliation: { '@id': 'https://laviolab.com/#organization' },
  sameAs: [
    'https://www.linkedin.com/in/stanislav-shupilkin-59482bb4/',
    'https://github.com/Smolevich',
    'https://smolevich.com',
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
 * Хлебные крошки повторяют реальный маршрут: корень локали, раздел, страница.
 * Раздел на своей index-странице не дублируется вторым пунктом.
 */
export function breadcrumbNode({ url, headline, localeRoot, siteName, section }) {
  const root = directoryUrl(localeRoot);
  const items = [{ name: siteName, item: root }];

  if (section && section.url !== url) items.push({ name: section.name, item: section.url });
  if (url !== root) items.push({ name: headline, item: url });

  return {
    '@type': 'BreadcrumbList',
    '@id': idAt(url, 'breadcrumbs'),
    itemListElement: items.map(({ name, item }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item,
    })),
  };
}

/**
 * HowTo появляется только там, где внутри обязательного блока Steps/Шаги есть
 * настоящие H3-подшаги. Текст шага остаётся на странице; разметка ведёт к его
 * устойчивому якорю и не выдумывает время, цену или результат.
 */
export function howToNode({ url, headline, description, inLanguage, steps }) {
  if (!steps?.length) return null;

  return {
    '@type': 'HowTo',
    '@id': idAt(url, 'how-to'),
    name: headline,
    ...(description ? { description } : {}),
    inLanguage,
    step: steps.map(({ name, url: stepUrl }, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name,
      text: name,
      url: stepUrl,
    })),
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
  if (page) {
    graph.push(articleNode({ ...page, localeRoot, siteRoot }));
    graph.push(breadcrumbNode({
      url: page.url,
      headline: page.headline,
      localeRoot,
      siteName,
      section: page.section,
    }));
    const howTo = howToNode(page);
    if (howTo) graph.push(howTo);
  }
  return { '@context': CONTEXT, '@graph': graph };
}

/** Дата в ISO без времени: у `updated:` время не замеряют. */
export function isoDate(date) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

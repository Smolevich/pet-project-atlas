/**
 * Подписи футера по локали. Всё остальное на русских страницах локализовано,
 * а две ссылки на GitHub оставались английскими.
 */
export type FooterStrings = {
  /** Ссылка на редактирование страницы в репозитории. */
  edit: string;
  /** Ссылка на issue «страница не помогла». */
  didNotHelp: string;
  /** Заголовок этого issue: получает адрес страницы, которую читатель видел. */
  issueTitle: (page: string) => string;
};

const EN: FooterStrings = {
  edit: 'Suggest an edit',
  didNotHelp: 'This did not help',
  issueTitle: (page) => `Did not help: ${page}`,
};

const RU: FooterStrings = {
  edit: 'Предложить правку',
  didNotHelp: 'Страница не помогла',
  issueTitle: (page) => `Страница не помогла: ${page}`,
};

/** Корневая локаль (undefined) и любая незнакомая читают английский набор. */
export function footerStringsFor(locale?: string): FooterStrings {
  return locale === 'ru' ? RU : EN;
}

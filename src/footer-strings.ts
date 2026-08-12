/**
 * Подписи под текстом страницы, по локали. Всё остальное на русских страницах
 * локализовано, а две ссылки на GitHub оставались английскими; блок источников
 * пришёл сюда же, чтобы наборов подписей не стало два.
 */
export type FooterStrings = {
  /** Ссылка на редактирование страницы в репозитории. */
  edit: string;
  /** Ссылка на issue «страница не помогла». */
  didNotHelp: string;
  /** Заголовок этого issue: получает адрес страницы, которую читатель видел. */
  issueTitle: (page: string) => string;
  /** Заголовок блока источников. */
  sources: string;
  /** Пометка у собственного замера: публичной ссылки у него нет. */
  ownMeasurement: string;
  /** Начало строки с датой замера, дальше идёт сама дата. */
  figuresRead: string;
  /** Дата из updated: словами. UTC, иначе день уезжает на местном поясе. */
  formatDate: (date: Date) => string;
};

function dateFormatter(tag: string): (date: Date) => string {
  const formatter = new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return (date) => formatter.format(date);
}

const EN: FooterStrings = {
  edit: 'Suggest an edit',
  didNotHelp: 'This did not help',
  issueTitle: (page) => `Did not help: ${page}`,
  sources: 'Sources',
  ownMeasurement: 'own measurement',
  figuresRead: 'Figures on this page were read on',
  formatDate: dateFormatter('en-GB'),
};

const RU: FooterStrings = {
  edit: 'Предложить правку',
  didNotHelp: 'Страница не помогла',
  issueTitle: (page) => `Страница не помогла: ${page}`,
  sources: 'Источники',
  ownMeasurement: 'свой замер',
  figuresRead: 'Цифры на странице сняты',
  formatDate: dateFormatter('ru-RU'),
};

/** Корневая локаль (undefined) и любая незнакомая читают английский набор. */
export function footerStringsFor(locale?: string): FooterStrings {
  return locale === 'ru' ? RU : EN;
}

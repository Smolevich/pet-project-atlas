// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { SECTIONS } from './scripts/lib/sections.mjs';
import { isFallbackPath, readDocFiles, writtenTranslations } from './scripts/lib/locales.mjs';
import rehypeMermaid from '@beoe/rehype-mermaid';

const DOCS = new URL('./src/content/docs/', import.meta.url);
const WRITTEN_TRANSLATIONS = writtenTranslations(readDocFiles(DOCS));

export default defineConfig({
  site: 'https://atlas.smolevich.com',
  // Схемы рисуются в сборке и уезжают в HTML готовым SVG: читателю ноль
  // килобайт скриптов, и диаграмма видна без JavaScript. Плата — chromium в
  // CI, он там кешируется между запусками.
  markdown: {
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'inline',
          // Цвета mermaid вшивает в SVG инлайновыми стилями, а сборка одна на
          // обе темы. Поэтому здесь только нейтральная заготовка, а настоящие
          // цвета навешивает CSS в atlas.css по переменным Starlight.
          mermaidConfig: {
            theme: 'base',
            fontFamily: 'inherit',
            themeVariables: {
              primaryColor: 'transparent',
              primaryBorderColor: '#888',
              primaryTextColor: '#888',
              lineColor: '#888',
              secondaryColor: 'transparent',
              tertiaryColor: 'transparent',
              background: 'transparent',
            },
          },
        },
      ],
    ],
  },
  integrations: [
    starlight({
      title: 'Pet Project Atlas',
      description: 'How to get your pet project found: demand, search, AI search, content, distribution, analytics, money.',
      editLink: { baseUrl: 'https://github.com/Smolevich/pet-project-atlas/edit/main/' },
      lastUpdated: true,
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ru: { label: 'Русский', lang: 'ru' },
      },
      components: {
        Head: './src/components/Head.astro',
        Footer: './src/components/Footer.astro',
        FallbackContentNotice: './src/components/FallbackContentNotice.astro',
      },
      routeMiddleware: './src/routeData.ts',
      customCss: ['./src/styles/atlas.css'],
      sidebar: SECTIONS.map(({ slug, label, ru }) => ({
        label,
        translations: { ru },
        items: [{ autogenerate: { directory: slug } }],
      })),
    }),
    // Свой sitemap вместо starlight-овского: тот кладёт в карту все русские
    // адреса, включая непереведённые. Starlight подключает интеграцию только
    // если её нет в конфиге, так что этот вызов её и заменяет — i18n повторяет
    // его настройку, filter добавляет отсев. Альтернат в карте столько же,
    // сколько адресов дожило до фильтра, так что пары чинятся заодно.
    sitemap({
      i18n: { defaultLocale: 'root', locales: { root: 'en', ru: 'ru' } },
      filter: (url) => !isFallbackPath(new URL(url).pathname, WRITTEN_TRANSLATIONS),
    }),
  ],
});

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// Разделы атласа. Порядок и есть маршрут «0 -> первый трафик».
const SECTIONS = [
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

export default defineConfig({
  site: 'https://atlas.smolevich.com',
  integrations: [
    // Строго до starlight: интеграция перехватывает ```mermaid раньше, чем Starlight
    // отдаст блок подсветке синтаксиса.
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'Pet Project Atlas',
      description: 'How to get your pet project found: search, AI search, content, distribution, analytics, money.',
      editLink: { baseUrl: 'https://github.com/Smolevich/pet-project-atlas/edit/main/' },
      lastUpdated: true,
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ru: { label: 'Русский', lang: 'ru' },
      },
      components: { Footer: './src/components/Footer.astro' },
      customCss: ['./src/styles/atlas.css'],
      sidebar: SECTIONS.map(({ slug, label, ru }) => ({
        label,
        translations: { ru },
        items: [{ autogenerate: { directory: slug } }],
      })),
    }),
  ],
});

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// Разделы атласа. Порядок и есть маршрут «0 -> первый трафик».
const SECTIONS = [
  { slug: 'start', label: 'Start here' },
  { slug: 'indexing', label: '1. Indexing' },
  { slug: 'geo', label: '2. AI search' },
  { slug: 'content', label: '3. Content' },
  { slug: 'distribution', label: '4. Distribution' },
  { slug: 'analytics', label: '5. Analytics' },
  { slug: 'money', label: '6. Money' },
  { slug: 'tools', label: 'Tools' },
  { slug: 'cases', label: 'Cases' },
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
      sidebar: SECTIONS.map(({ slug, label }) => ({
        label,
        items: [{ autogenerate: { directory: slug } }],
      })),
    }),
  ],
});

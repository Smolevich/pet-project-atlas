// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { SECTIONS } from './scripts/lib/sections.mjs';

export default defineConfig({
  site: 'https://atlas.smolevich.com',
  integrations: [
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
      components: {
        Footer: './src/components/Footer.astro',
        FallbackContentNotice: './src/components/FallbackContentNotice.astro',
      },
      customCss: ['./src/styles/atlas.css'],
      sidebar: SECTIONS.map(({ slug, label, ru }) => ({
        label,
        translations: { ru },
        items: [{ autogenerate: { directory: slug } }],
      })),
    }),
  ],
});

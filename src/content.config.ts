import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Дата последнего замера. Ничем не enforced: STYLE.md §4 требует её на
        // страницах с числами, но линтер смотрит только на sources:.
        updated: z.date().optional(),
        // guest — чужой кейс, проверку голоса не проходит, только проверку фактов.
        voice: z.enum(['house', 'guest']).default('house'),
        sources: z.array(z.string().url()).optional(),
      }),
    }),
  }),
};

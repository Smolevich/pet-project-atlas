import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Дата замера. Обязательна на странице с числами — это проверяет
        // lint-voice, схема оставляет поле необязательным для страниц без чисел.
        updated: z.date().optional(),
        // guest — чужой кейс, проверку голоса не проходит, только проверку фактов.
        voice: z.enum(['house', 'guest']).default('house'),
        sources: z.array(z.string().url()).optional(),
      }),
    }),
  }),
};

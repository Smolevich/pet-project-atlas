import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';
import { isValidSource } from '../scripts/lib/voice-rules.mjs';

const SOURCE_HINT =
  'sources: — либо http(s)-URL, либо строка происхождения вида ' +
  '"Search Console, property atlas.smolevich.com, measured 2026-08-10".';

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
        // Замер из собственной консоли публичного URL не имеет, а атлас
        // построен именно на них. Одного z.string().url() хватало только
        // на то, чтобы гнать автора к выдуманной ссылке.
        sources: z.array(z.string().refine(isValidSource, { message: SOURCE_HINT })).optional(),
      }),
    }),
  }),
};

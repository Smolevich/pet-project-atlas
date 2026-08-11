/**
 * Правит <head> перед рендером: страница не должна обещать перевода, которого
 * нет. Starlight собирает hreflang по списку локалей, не спрашивая, написана ли
 * страница на этом языке, — поэтому каждый непереведённый адрес уходил в выдачу
 * как русская версия с английским текстом.
 *
 * Почему middleware, а не переопределённый Head.astro: head — часть route data,
 * а официальный способ её менять — routeMiddleware. Компонент получает уже
 * собранный массив и может только нарисовать его целиком.
 */

import { getCollection } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import {
  dropUnwrittenAlternates,
  hasRussianVersion,
  pointAtOriginal,
  writtenTranslations,
} from '../scripts/lib/locales.mjs';

const WRITTEN = writtenTranslations((await getCollection('docs')).map((entry) => entry.id));

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const isFallback = Boolean(route.isFallback);

  route.head = dropUnwrittenAlternates(route.head, {
    isFallback,
    hasRussian: hasRussianVersion(context.url.pathname, WRITTEN),
  });

  if (isFallback) route.head = pointAtOriginal(route.head);
});

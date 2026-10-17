---
title: Настоящий краулер или подделка
sidebar:
  order: 4
description: Имя бота в User-Agent ничего не доказывает. Как Cloudflare подтверждает краулер, что видно на бесплатном тарифе, запрос GraphQL, который отделяет настоящих от подделок, и одно правило WAF — с цифрами за тридцать дней по моей зоне.
updated: 2026-10-18
sources:
  - Cloudflare GraphQL Analytics, site voice.smolevich.com, measured 2026-10-18
  - Cloudflare GraphQL Analytics, site smolevich.com, measured 2026-10-17
  - Как Cloudflare подтверждает бота — https://developers.cloudflare.com/bots/concepts/bot/verified-bots/
  - Обратный DNS и опубликованные списки IP — https://developers.cloudflare.com/bots/reference/bot-verification/ip-validation/
  - Какие категории получает подтверждённый бот — https://developers.cloudflare.com/bots/concepts/bot/verified-bots/categories/
  - Поле правил cf.client.bot — https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.client.bot/
  - Поле правил cf.verified_bot_category — https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.verified_bot_category/
  - Операторы правил и на каких тарифах regex — https://developers.cloudflare.com/ruleset-engine/rules-language/operators/
  - Функция lower() в правилах — https://developers.cloudflare.com/ruleset-engine/rules-language/functions/
  - Custom rules и лимиты бесплатного тарифа — https://developers.cloudflare.com/waf/custom-rules/
  - Правило с not cf.client.bot — https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-verified-bots/
  - Bot score и группы ботов по тарифам — https://developers.cloudflare.com/bots/concepts/bot-score/
  - Что есть против ботов на бесплатном тарифе — https://developers.cloudflare.com/bots/plans/free/
  - Сколько хранит Security Analytics на каждом тарифе — https://developers.cloudflare.com/waf/analytics/security-analytics/
  - Адрес GraphQL Analytics — https://developers.cloudflare.com/analytics/graphql-api/
  - Насколько глубоко хранятся adaptive-данные — https://developers.cloudflare.com/analytics/graphql-api/limits/
  - Почему Perplexity больше не подтверждённый бот — https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/
---

## Что решаем

В User-Agent запроса написано `GPTBot`. User-Agent — это свободный заголовок, в котором клиент сам себя называет, и вписать туда можно что угодно. Мой [лог nginx](/ru/geo/who-actually-crawls-you/) не отличал настоящий краулер от сканера под его именем, и я считал их вместе.

Поэтому я снял тридцать дней из Cloudflare, который стоит перед всеми сайтами моего домена. По зоне целиком неподтверждённых имён краулеров оказалось почти в пять раз больше, чем подтверждённых. На одном сайте, voice.smolevich.com, картина вышла обратная.

## Шаги

### 1. Почему имени в заголовке нельзя верить

User-Agent — это то, что клиент решил отправить, так что `curl -A "GPTBot/1.1" https://example.com/` кладёт в ваш лог ровно ту же строку, что и настоящий краулер, и по самой строке их не различить.

За 30 дней, с 17 сентября по 16 октября 2026, моя зона приняла 245 883 запроса. 8 249 из них пришли под именами GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot или ChatGPT-User без подтверждения Cloudflare. Подтверждённых под этими пятью именами было 1 689.

Что это за запросы, видно по тому, куда они шли. Запросов с `.env` в пути — это файл, где приложения держат пароли и ключи, — по зоне набралось 19 398. Из 1 996 неподтверждённых запросов PerplexityBot только 60 попали на страницы, которые у меня есть.

### 2. Как Cloudflare решает, что бот настоящий

У Cloudflare есть список verified bots — подтверждённых ботов. Владелец бота регистрирует шаблон User-Agent и способ доказать, откуда идут его запросы.

Способов три: опубликованный список диапазонов IP, который Cloudflare забирает сам, обратный DNS — IP резолвится обратно в домен, названный владельцем, например `googlebot.com`, — или криптографическая подпись на каждом запросе, она называется Web Bot Auth.

Запрос, прошедший проверку, получает категорию: `Search Engine Crawler`, `AI Crawler`, `AI Assistant`, `AI Search` и ещё с десяток. Запрос, который проверку не прошёл или пришёл от незарегистрированного бота, получает пустую категорию, и это пустое поле — весь мой тест.

Один бот не проходит его нарочно: в августе 2025 Cloudflare убрал Perplexity из подтверждённых ботов, после того как поймал его на обходе сайтов под необъявленными именами. Так что любой запрос PerplexityBot неподтверждённый, настоящий тоже.

### 3. Что видно на бесплатном тарифе, а что нет

На бесплатном тарифе есть категория подтверждённого бота, и ничего тоньше.

| Что | Free | Платно |
|---|---|---|
| Категория подтверждённого бота — в правилах, GraphQL и дашборде | да | да |
| `cf.client.bot`, true для подтверждённого бота | да | да |
| Группы вроде «likely automated» | нет | от Pro |
| Bot score, оценка 1–99 на каждый запрос | нет | Enterprise Bot Management |
| Regex в правилах | нет | от Business |
| ASN как поле GraphQL | нет | не проверял |

ASN — номер сети, которой принадлежит IP, например облачного провайдера, — стоил мне вечера. GraphQL моей зоны ответил `does not have access to the field 'clientasn'`. В дашборде ASN всё равно печатается у каждого запроса из выборки, по одной строке.

На бесплатном тарифе есть и Bot Fight Mode, который показывает челлендж простым ботам с облачных хостингов и headless-браузерам, но не говорит, кого поймал.

### 4. Разделить в дашборде

1. Откройте зону, затем **Security** → **Analytics**, вкладка **Traffic**.
2. Нажмите **Filter** и наберите `bot`. На моей бесплатной зоне из ботовых полей было только **Verified Bot Category**.
3. Выберите категорию, например `AI Crawler`, и смотрите график: это подтверждённый трафик.
4. Пролистайте до **Sampled logs** и раскройте строку. У подтверждённого запроса рядом с IP, страной, ASN и User-Agent стоит **Verified Bot Category: AI Crawler**. У подделки имя бота есть в User-Agent, а строки с категорией нет.

Фильтра по User-Agent в бесплатном дашборде нет, так что спросить его «всё, что называет себя GPTBot и не подтверждено» нельзя — для этого нужен GraphQL.

### 5. Разделить через GraphQL

GraphQL Analytics — API запросов Cloudflare по адресу `https://api.cloudflare.com/client/v4/graphql`. Нужен API-токен с правом **Zone → Analytics → Read**.

Один день на запрос держит вас ниже лимита строк. Adaptive-данные — выборочный датасет по запросам, который читает этот запрос, — хранятся не меньше 31 дня на любом тарифе, поэтому тридцать дней — самое длинное окно, которое я смог взять.

```bash
curl -s https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data @- <<'EOF'
{"query": "{ viewer { zones(filter:{zoneTag:\"YOUR_ZONE_ID\"}) { rows: httpRequestsAdaptiveGroups(limit:10000, filter:{datetime_geq:\"2026-10-17T00:00:00Z\", datetime_lt:\"2026-10-18T00:00:00Z\", clientRequestHTTPHost:\"example.com\"}, orderBy:[count_DESC]) { count dimensions { userAgent verifiedBotCategory clientRequestPath clientCountryName edgeResponseStatus } } } } }"}
EOF
```

Дальше каждую строку разбирайте по двум вопросам: есть ли в `userAgent` имя бота и пустая ли строка в `verifiedBotCategory`. Имя есть, а категория пустая — такой запрос я называю неподтверждённым.

```bash
jq -r '.data.viewer.zones[0].rows[]
  | select(.dimensions.userAgent | test("gptbot|claudebot|perplexitybot|oai-searchbot|chatgpt-user|googlebot|bingbot"; "i"))
  | [(if .dimensions.verifiedBotCategory == "" then "unconfirmed" else "verified" end), .count, .dimensions.clientRequestPath]
  | @tsv' day.json | sort | head -40
```

`count` здесь оценка. Adaptive-группы выборочные, и итог по моей зоне вышел на 1.6% выше собственного суточного счётчика Cloudflare.

### 6. Одно правило, которое режет подделки

WAF custom rule — фильтр, который Cloudflare прогоняет на каждом запросе до вашего сервера, — состоит из выражения и действия. На бесплатном тарифе таких правил пять.

Откройте **Security** → **Security rules**, создайте custom rule, переключитесь на **Edit expression** и вставьте:

```txt
(lower(http.user_agent) contains "gptbot"
 or lower(http.user_agent) contains "claudebot"
 or lower(http.user_agent) contains "oai-searchbot"
 or lower(http.user_agent) contains "chatgpt-user"
 or lower(http.user_agent) contains "googlebot"
 or lower(http.user_agent) contains "bingbot")
and not cf.client.bot
```

Действие — **Block**. `lower()` и `contains` заменяют regex, которого на бесплатном тарифе нет, а `not cf.client.bot` значит «Cloudflare этот запрос не подтвердил». Та же проверка через поле категории — `cf.verified_bot_category eq ""`.

PerplexityBot я в правило не включил нарочно. Под этим именем не подтверждено ничего, и правило заблокировало бы настоящий краулер вместе с подделками. На моём voice-сайте это 141 запрос, и выглядели они настоящими.

### 7. Цифры по voice.smolevich.com

Свежая выгрузка, с 18 сентября по 17 октября 2026, только хост `voice.smolevich.com`: 45 219 запросов.

| Имя бота в User-Agent | Подтверждён | Без подтверждения |
|---|---|---|
| Googlebot | 673 | 7 |
| Bingbot | 568 | 0 |
| ChatGPT-User | 498 | 0 |
| OAI-SearchBot | 283 | 0 |
| ClaudeBot | 121 | 1 |
| GPTBot | 106 | 0 |
| PerplexityBot | 0 | 141 |
| Итого | 2 249 | 149 |

Куда шли эти 149:

| Куда | Запросов |
|---|---|
| Настоящие страницы из sitemap | 83 |
| `/robots.txt` | 45 |
| Картинки и аудиопримеры с этих страниц | 13 |
| Собственный скрипт Cloudflare для защиты почты | 8 |
| `/.env`, `wp-*` и прочие зонды | 0 |

148 из 149 пришли из США и один из Сербии. Тот один запросил главную как Googlebot, а в Сербии работаю я сам, так что считаю его, скорее всего, своим.

Сканеры на этом сайте именем бота не прикрываются. На пути с `.env` пришло 39 запросов и на `wp-*` ещё 3, и ни один не назвался ботом. У всех запросов к `.env` была обычная строка браузера.

В общем, на этом сайте правило выше заблокировало бы 8 запросов за месяц. Шесть из них — запрос скрипта Cloudflare под именем Googlebot, и это вполне может быть собственный рендерер Google. По всей зоне то же правило бьёт по тысячам.

## Что не сработало

- **API-токен Cloudflare, который у меня уже был**. Он выпущен под аналитику и ответил `Authentication error`: дата начала действия у него стоит в 2027 году. Тот же GraphQL я выполнил из вкладки дашборда, где уже был вход, через его собственный `/api/v4/graphql`.
- **Топ ASN у подделок**. На моей бесплатной зоне GraphQL отказал в `clientAsn`, поэтому даю страны. ASN есть только в дашборде, построчно.
- **Проверка правила через API до публикации**. Старый эндпоинт `filters/validate-expr` ответил 404. Синтаксис я взял из примеров документации и правило не разворачивал, так что на бесплатной зоне оно пока не проверено.
- **Перенос цифр по зоне на каждый сайт**. История зоны — подделки повсюду и охота за `.env` — на voice.smolevich.com не подтвердилась. Там почти все неподтверждённые запросы оказались PerplexityBot на настоящих страницах.
- **Считать `.png` и `.mp3` зондами**. Мой первый фильтр путей ловил всё с расширением файла. Тринадцать «зондов» оказались картинками и аудио с моих же страниц.

## Проверить

- Выполните запрос GraphQL выше за вчера по своему хосту и посчитайте неподтверждённые строки. Потом посмотрите, на какие пути они шли, и сравните со своим sitemap.
- Отправьте подделку сами: `curl -A "GPTBot/1.1" https://your-site/`. В следующей выгрузке она должна появиться с пустой `verifiedBotCategory`.
- После того как развернёте правило, повторите тот же `curl`. Cloudflare должен ответить 403, а блок появится в **Security** → **Analytics** → **Events**.
- Проверьте, что подтверждённые боты проходят. Их категории по-прежнему видны в фильтре вкладки **Traffic**.
- Строки PerplexityBot прочитайте отдельно, прежде чем решать, блокировать ли его. Мои выглядели как настоящий краулер.

Настройки доступа и кому принадлежит какой агент: [AI-crawler и llms.txt](/ru/geo/llms-txt-and-crawlers/). Тот же вопрос к логу nginx: [кто к вам на самом деле ходит](/ru/geo/who-actually-crawls-you/).

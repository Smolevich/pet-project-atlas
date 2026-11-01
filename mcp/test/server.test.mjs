import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createAtlasServer } from '../server.mjs';
import { PROTOCOL_VERSIONS, TOOLS } from '../lib/protocol.mjs';
import { INDEX } from './fixture.mjs';

let server;
let endpoint;

before(async () => {
  server = createAtlasServer(INDEX);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  endpoint = `http://127.0.0.1:${server.address().port}/mcp`;
});

after(() => server.close());

const post = (body, headers = {}) =>
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const rpc = async (method, params, id = 1) => (await post({ jsonrpc: '2.0', id, method, params })).json();

const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).result;

test('initialize повторяет поддерживаемую версию протокола клиента', async () => {
  const { result } = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });
  assert.equal(result.protocolVersion, '2025-06-18');
});

test('на незнакомую версию сервер предлагает свою последнюю', async () => {
  const { result } = await rpc('initialize', { protocolVersion: '1999-01-01' });
  assert.equal(result.protocolVersion, PROTOCOL_VERSIONS[0]);
});

test('сервер называет себя версией плагина из индекса', async () => {
  const { result } = await rpc('initialize', { protocolVersion: '2025-06-18' });
  assert.equal(result.serverInfo.version, '9.9.9');
});

test('уведомление initialized принимается без тела ответа', async () => {
  const res = await post({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.deepEqual([res.status, await res.text()], [202, '']);
});

test('tools/list отдаёт четыре инструмента', async () => {
  const { result } = await rpc('tools/list', {});
  assert.deepEqual(result.tools.map((t) => t.name), ['search_playbook', 'get_page', 'list_sections', 'checklist']);
});

test('каждый инструмент помечен только читающим, без разрушений и внешнего мира', () => {
  for (const tool of TOOLS) {
    const { readOnlyHint, destructiveHint, openWorldHint } = tool.annotations;
    assert.deepEqual([tool.name, readOnlyHint, destructiveHint, openWorldHint], [tool.name, true, false, false]);
  }
});

test('search_playbook отвечает и текстом, и структурой', async () => {
  const result = await call('search_playbook', { query: 'llms.txt' });
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
});

test('get_page возвращает markdown страницы', async () => {
  const result = await call('get_page', { slug: 'geo/crawlers' });
  assert.match(result.structuredContent.markdown, /## Verify/);
});

test('list_sections возвращает маршрут', async () => {
  const result = await call('list_sections', { lang: 'ru' });
  assert.deepEqual(result.structuredContent.sections.map((s) => s.label), ['3. AI-поиск']);
});

test('checklist по теме возвращает пункты', async () => {
  const result = await call('checklist', { topic: 'robots.txt' });
  assert.ok(result.structuredContent.items.length > 0);
});

test('ошибка в аргументах инструмента — isError с объяснением, а не сбой протокола', async () => {
  const result = await call('get_page', { slug: 'nope' });
  assert.deepEqual([result.isError, /list_sections/.test(result.content[0].text)], [true, true]);
});

test('неизвестный инструмент — ошибка JSON-RPC', async () => {
  const body = await rpc('tools/call', { name: 'delete_everything', arguments: {} });
  assert.equal(body.error.code, -32602);
});

test('неизвестный метод — method not found', async () => {
  assert.equal((await rpc('resources/list', {})).error.code, -32601);
});

test('битый JSON — parse error с кодом 400', async () => {
  const res = await post('{not json');
  assert.deepEqual([res.status, (await res.json()).error.code], [400, -32700]);
});

test('GET потока не открывает', async () => {
  assert.equal((await fetch(endpoint)).status, 405);
});

test('тело больше лимита отклоняется', async () => {
  const res = await post({ jsonrpc: '2.0', id: 1, method: 'ping', params: { pad: 'x'.repeat(70_000) } });
  assert.equal(res.status, 413);
});

test('чужой путь — 404', async () => {
  assert.equal((await fetch(endpoint.replace('/mcp', '/other'), { method: 'POST' })).status, 404);
});

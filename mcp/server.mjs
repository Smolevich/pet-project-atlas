#!/usr/bin/env node
/**
 * MCP-сервер атласа: Streamable HTTP без сессий, только POST и только JSON-ответы.
 * Данных пользователя нет, поэтому нет ни авторизации, ни состояния между запросами.
 *
 *   ATLAS_MCP_INDEX=dist-mcp/index.json ATLAS_MCP_PORT=8770 node mcp/server.mjs
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMessage, parseError } from './lib/protocol.mjs';

const MAX_BODY = 64 * 1024;
const ENDPOINT = '/mcp';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
};

function send(res, status, body, headers = {}) {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...CORS,
    ...(text ? { 'Content-Type': 'application/json' } : {}),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(text);
}

async function readBody(req) {
  let size = 0;
  const parts = [];
  for await (const part of req) {
    size += part.length;
    if (size > MAX_BODY) throw new RangeError('body too large');
    parts.push(part);
  }
  return Buffer.concat(parts).toString('utf8');
}

/** Пачка или одно сообщение → ответы; только уведомления — 202 без тела. */
function respond(payload, index, info) {
  const batch = Array.isArray(payload);
  const replies = (batch ? payload : [payload]).map((m) => handleMessage(m, index, info)).filter(Boolean);
  if (!replies.length) return { status: 202 };
  return { status: 200, body: batch ? replies : replies[0] };
}

export function createAtlasServer(index) {
  const info = { version: index.version };
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== ENDPOINT) return send(res, 404, { error: 'not found' });
    if (req.method === 'OPTIONS') return send(res, 204);
    // GET открыл бы SSE-поток для сообщений от сервера, а их у нас не бывает.
    if (req.method !== 'POST') return send(res, 405, { error: 'POST only' }, { Allow: 'POST, OPTIONS' });

    let payload;
    try {
      payload = JSON.parse(await readBody(req));
    } catch (err) {
      return send(res, err instanceof RangeError ? 413 : 400, parseError());
    }
    try {
      const { status, body } = respond(payload, index, info);
      return send(res, status, body);
    } catch (err) {
      console.error(err);
      return send(res, 500, { jsonrpc: '2.0', id: payload?.id ?? null, error: { code: -32603, message: 'Internal error' } });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const indexPath = process.env.ATLAS_MCP_INDEX ?? path.join(here, 'index.json');
  const port = Number(process.env.ATLAS_MCP_PORT ?? 8770);
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  createAtlasServer(index).listen(port, '127.0.0.1', () => {
    console.log(`atlas mcp ${index.version}: ${index.pages.length} pages on 127.0.0.1:${port}${ENDPOINT}`);
  });
}

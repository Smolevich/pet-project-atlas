/**
 * JSON-RPC часть MCP: initialize, tools/list, tools/call, ping. Чистая функция от
 * сообщения и индекса — транспорт (Streamable HTTP без сессий) в mcp/server.mjs.
 */
import { ToolError, checklist, getPage, listSections, searchPlaybook } from './search.mjs';

export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

const LANG = {
  type: 'string',
  enum: ['en', 'ru'],
  default: 'en',
  description: 'Language of the atlas pages: en (default) or ru.',
};

// Каталог ограничен страницами атласа, ничего не пишет и не ходит наружу.
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export const TOOLS = [
  {
    name: 'search_playbook',
    title: 'Search the playbook',
    description:
      'Search the Pet Project Atlas, a playbook on getting a small product found in search and in AI answers ' +
      '(demand, indexing, AI search and GEO, content, distribution, analytics, money). Returns the best ' +
      'matching sections with a short verbatim quote and a link to the exact section, so answers can cite the page.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look for, in plain words, e.g. "why Google does not index my pages".' },
        lang: LANG,
        limit: { type: 'integer', minimum: 1, maximum: 10, default: 5, description: 'How many sections to return.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: { title: 'Search the playbook', ...READ_ONLY },
    run: searchPlaybook,
  },
  {
    name: 'get_page',
    title: 'Read a playbook page',
    description:
      'Return the full text of one Pet Project Atlas page as markdown, with its title, URL, last measured date ' +
      'and sources. Takes a slug such as "geo/llms-txt-and-crawlers", a path or a full atlas URL.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Page slug, path or URL, e.g. "indexing/why-google-does-not-see-you".' },
        lang: { type: 'string', enum: ['en', 'ru'], description: 'Language of the page; a /ru/ path already implies ru.' },
      },
      required: ['slug'],
      additionalProperties: false,
    },
    annotations: { title: 'Read a playbook page', ...READ_ONLY },
    run: getPage,
  },
  {
    name: 'list_sections',
    title: 'List playbook sections',
    description:
      'List the sections of the Pet Project Atlas in route order, from checking demand to taking money, ' +
      'with every page in each section: slug, title, one-line description and URL.',
    inputSchema: {
      type: 'object',
      properties: { lang: LANG },
      additionalProperties: false,
    },
    annotations: { title: 'List playbook sections', ...READ_ONLY },
    run: listSections,
  },
  {
    name: 'checklist',
    title: 'Get a checklist',
    description:
      'Return checklist items from the Pet Project Atlas for a topic such as "llms.txt", "robots.txt and AI ' +
      'crawlers", "canonical", "Search Console", "schema" or "attribution", each with the page that explains it, ' +
      'plus the verification steps of the best matching page. Without a topic, returns the whole checklist in order.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic in plain words. Leave empty for the full checklist.' },
        lang: LANG,
      },
      additionalProperties: false,
    },
    annotations: { title: 'Get a checklist', ...READ_ONLY },
    run: checklist,
  },
];

const ERRORS = { parse: -32700, invalidRequest: -32600, method: -32601, params: -32602 };

const reply = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

export function negotiateVersion(requested) {
  return PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0];
}

function initialize(params, info) {
  return {
    protocolVersion: negotiateVersion(params?.protocolVersion),
    capabilities: { tools: { listChanged: false } },
    serverInfo: { name: 'laviolab-atlas', title: 'LaVioLab Atlas', version: info.version },
    instructions:
      'Read-only access to the Pet Project Atlas (atlas.smolevich.com). Use search_playbook to find what the ' +
      'atlas says and quote it with the link, get_page to read a page in full, list_sections to see the route, ' +
      'checklist for step lists. Answer from the returned text and cite the URL.',
  };
}

const publicTool = ({ run, ...tool }) => tool;

function callTool(params, index) {
  const tool = TOOLS.find((t) => t.name === params?.name);
  if (!tool) return { error: [ERRORS.params, `Unknown tool: ${params?.name}`] };
  try {
    const data = tool.run(index, params.arguments ?? {});
    return { result: { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data } };
  } catch (err) {
    if (!(err instanceof ToolError)) throw err;
    return { result: { content: [{ type: 'text', text: err.message }], isError: true } };
  }
}

/**
 * Одно сообщение JSON-RPC → ответ или null (на уведомления и ответы клиента
 * отвечать нечем).
 */
export function handleMessage(message, index, info) {
  if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0') {
    return fail(message?.id ?? null, ERRORS.invalidRequest, 'Invalid JSON-RPC 2.0 message');
  }
  if (!('method' in message)) return null;
  const isNotification = !('id' in message);
  if (isNotification) return null;

  const { id, method, params } = message;
  switch (method) {
    case 'initialize':
      return reply(id, initialize(params, info));
    case 'ping':
      return reply(id, {});
    case 'tools/list':
      return reply(id, { tools: TOOLS.map(publicTool) });
    case 'tools/call': {
      const { result, error } = callTool(params, index);
      return error ? fail(id, ...error) : reply(id, result);
    }
    default:
      return fail(id, ERRORS.method, `Method not found: ${method}`);
  }
}

export function parseError() {
  return fail(null, ERRORS.parse, 'Parse error');
}

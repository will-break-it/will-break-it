// Runs the Pages Functions in Node with a stand-in for the static assets and
// for Brevo. No network, no email. `node --test tests/`

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { onRequest as middleware } from '../functions/_middleware.js';
import { onRequest as enquiry } from '../functions/api/enquiry.js';
import { onRequest as mcp } from '../functions/mcp.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = name => readFileSync(join(root, name), 'utf8');

// Serves repository files the way Pages serves the deployed site.
const ASSETS = {
    async fetch(request) {
        const path = new URL(request.url).pathname;
        try {
            return new Response(file(path === '/' ? 'index.html' : path.slice(1)));
        } catch {
            return new Response('not found', { status: 404 });
        }
    },
};

const realFetch = globalThis.fetch;
let sent;
beforeEach(() => {
    sent = [];
    globalThis.fetch = async (url, init) => {
        sent.push({ url: String(url), body: JSON.parse(init.body), headers: init.headers });
        return new Response(JSON.stringify({ messageId: '<test@brevo>' }), { status: 201 });
    };
});
afterEach(() => { globalThis.fetch = realFetch; });

const env = { ASSETS, BREVO_API_KEY: 'test-key' };
const brief = { email: 'ada@example.com', summary: 'Extract figures from supplier PDFs into our ERP, with review.' };
const post = (url, body, headers = {}) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });

// --- home page: HTML for people, Markdown for agents --------------------------

const home = (headers = {}, url = 'https://williwolff.com/') =>
    middleware({ request: new Request(url, { headers }), env, next: () => ASSETS.fetch(new Request(url)) });

test('a browser gets the HTML page', async () => {
    const response = await home({ accept: 'text/html,application/xhtml+xml', 'user-agent': 'Mozilla/5.0 Safari/605.1.15' });
    assert.match(await response.text(), /<!DOCTYPE html>/i);
    assert.match(response.headers.get('vary'), /Accept/);
});

test('asking for Markdown gets the agent version', async () => {
    const response = await home({ accept: 'text/markdown, text/html;q=0.8' });
    assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    const text = await response.text();
    assert.match(text, /^# Willi Wolff/);
    assert.ok(text.indexOf('## How to work with him') < text.indexOf('## About'), 'terms come before the biography');
});

test('an assistant fetching for a user gets Markdown, a search crawler gets HTML', async () => {
    const assistant = await home({ 'user-agent': 'Mozilla/5.0 AppleWebKit/537.36; compatible; ChatGPT-User/1.0; +https://openai.com/bot' });
    assert.equal(assistant.headers.get('content-type'), 'text/markdown; charset=utf-8');
    for (const crawler of ['Googlebot/2.1 (+http://www.google.com/bot.html)', 'GPTBot/1.2', 'ClaudeBot/1.0', 'OAI-SearchBot/1.0']) {
        const response = await home({ 'user-agent': crawler });
        assert.match(await response.text(), /<!DOCTYPE html>/i, crawler);
    }
});

test('?format=md and ?format=html override the guess', async () => {
    const md = await home({}, 'https://williwolff.com/?format=md');
    assert.equal(md.headers.get('content-type'), 'text/markdown; charset=utf-8');
    const html = await home({ accept: 'text/markdown' }, 'https://williwolff.com/?format=html');
    assert.match(await html.text(), /<!DOCTYPE html>/i);
});

test('other paths and the old host behave as before', async () => {
    const other = await middleware({ request: new Request('https://williwolff.com/cv.md', { headers: { accept: 'text/markdown' } }), env, next: () => new Response('passed through') });
    assert.equal(await other.text(), 'passed through');
    const old = await middleware({ request: new Request('https://wwolff.pages.dev/cv.md?x=1'), env, next: () => new Response('no') });
    assert.equal(old.status, 301);
    assert.equal(old.headers.get('location'), 'https://williwolff.com/cv.md?x=1');
});

// --- POST /api/enquiry ----------------------------------------------------------

test('a valid brief is emailed to Will and never to the sender', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, name: 'Ada', company: 'Example GmbH', submitted_by: 'agent', agent: 'Scout' }), env });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.reference, /^WW-[0-9A-F]{8}$/);
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].body.to, [{ email: 'contact@williwolff.com' }]);
    assert.equal(sent[0].body.replyTo.email, 'ada@example.com');
    assert.match(sent[0].body.subject, /via agent/);
    assert.match(sent[0].body.textContent, /Sent by an agent \(Scout\)/);
});

test('missing fields are named and nothing is sent', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { email: 'not-an-address', summary: 'hi', project_type: 'nonsense' }), env });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.deepEqual(Object.keys(body.fields).sort(), ['email', 'project_type', 'summary']);
    assert.equal(sent.length, 0);
});

test('markup and header injection in a brief stay inert', async () => {
    await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, name: 'Eve\r\nBcc: victim@example.com', summary: '<img src=x onerror=alert(1)> please build this for us' }), env });
    assert.doesNotMatch(sent[0].body.replyTo.name, /[\r\n]/);
    assert.doesNotMatch(sent[0].body.subject, /[\r\n]/);
    assert.doesNotMatch(sent[0].body.htmlContent, /<img/);
});

test('a filled trap field is answered but not sent', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, website: 'https://spam.example' }), env });
    assert.equal((await response.json()).ok, true);
    assert.equal(sent.length, 0);
});

test('without a mail key the form says so and names the fallback', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', brief), env: { ASSETS } });
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.code, 'unavailable');
    assert.equal(body.fallback.email, 'contact@williwolff.com');
});

test('bad JSON, oversized bodies and GET are handled', async () => {
    assert.equal((await enquiry({ request: post('https://williwolff.com/api/enquiry', '{nope'), env })).status, 400);
    assert.equal((await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, summary: 'x'.repeat(40000) }), env })).status, 413);
    const described = await (await enquiry({ request: new Request('https://williwolff.com/api/enquiry'), env })).json();
    assert.deepEqual(described.required, ['email', 'summary']);
});

// --- /mcp -------------------------------------------------------------------------

const rpc = async (method, params, id = 1) => {
    const response = await mcp({ request: post('https://williwolff.com/mcp', { jsonrpc: '2.0', id, method, params }), env });
    return { response, body: response.status === 202 ? null : await response.json() };
};

test('MCP handshake and tool list', async () => {
    const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
    assert.equal(init.body.result.protocolVersion, '2025-06-18');
    assert.equal(init.body.result.serverInfo.name, 'williwolff.com');
    const note = await mcp({ request: post('https://williwolff.com/mcp', { jsonrpc: '2.0', method: 'notifications/initialized' }), env });
    assert.equal(note.status, 202);
    const list = await rpc('tools/list');
    assert.deepEqual(list.body.result.tools.map(t => t.name), ['get_profile', 'get_terms', 'get_cv', 'submit_enquiry']);
});

test('MCP read tools return the published files', async () => {
    const terms = await rpc('tools/call', { name: 'get_terms', arguments: {} });
    assert.equal(JSON.parse(terms.body.result.content[0].text).rate.currency, 'EUR');
    const cv = await rpc('tools/call', { name: 'get_cv', arguments: { language: 'de', format: 'markdown' } });
    assert.match(cv.body.result.content[0].text, /## Berufserfahrung/);
    const pdf = await rpc('tools/call', { name: 'get_cv', arguments: { format: 'pdf' } });
    assert.equal(pdf.body.result.content[0].text, 'https://williwolff.com/willi-wolff-cv-en.pdf');
    const profile = await rpc('tools/call', { name: 'get_profile', arguments: {} });
    assert.match(profile.body.result.content[0].text, /^# Willi Wolff/);
});

test('MCP submit_enquiry sends a brief marked as from an agent', async () => {
    const result = await rpc('tools/call', { name: 'submit_enquiry', arguments: { ...brief, submitted_by: 'human' } });
    assert.equal(result.body.result.isError, false);
    assert.match(sent[0].body.textContent, /Sent by an agent/);
    assert.match(sent[0].body.textContent, /Route: mcp/);
    const bad = await rpc('tools/call', { name: 'submit_enquiry', arguments: { summary: 'no address given here' } });
    assert.equal(bad.body.result.isError, true);
});

test('MCP errors: unknown method, unknown tool, GET', async () => {
    assert.equal((await rpc('resources/list')).body.error.code, -32601);
    assert.equal((await rpc('tools/call', { name: 'delete_everything' })).body.error.code, -32602);
    const get = await mcp({ request: new Request('https://williwolff.com/mcp'), env });
    assert.equal(get.status, 405);
});

// --- published facts agree --------------------------------------------------------

test('the rate is the same on the page, in llms.txt and in hire.json', () => {
    const terms = JSON.parse(file('hire.json'));
    const { from, to } = terms.rate;
    assert.match(file('llms.txt'), new RegExp(from + ' to ' + to + ' EUR per hour'));
    const page = file('index.html');
    assert.match(page, new RegExp(from + ' to ' + to + ' EUR per hour'));
    assert.match(page, new RegExp(from + ' bis ' + to + ' EUR pro Stunde'));
    assert.match(page, new RegExp('"minPrice": ' + from + '\\b'));
    assert.match(page, new RegExp('"maxPrice": ' + to + '\\b'));
    assert.doesNotMatch(page, /From \d+ EUR per hour|Ab \d+ EUR pro Stunde/);
});

test('the generated CV files match their Typst sources', async () => {
    const { execFileSync } = await import('node:child_process');
    execFileSync('node', ['scripts/build-cv-data.mjs', '--check'], { cwd: root });
});

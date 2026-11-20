// /mcp: the site as a Model Context Protocol server (Streamable HTTP).
//
// An agent that speaks MCP connects here and gets the same things a person
// gets from the page: who Will is, his terms, the CV in either language, and
// a way to send a brief. The server keeps no session: every POST is answered
// with plain JSON, and there is no server-to-client stream.

import { submitEnquiry, PROJECT_TYPES, ENGAGEMENTS, readJsonBody } from '../lib/enquiry.js';

const VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

const CV_FILES = {
    en: { markdown: '/cv.md', json: '/cv.json', pdf: '/willi-wolff-cv-en.pdf' },
    de: { markdown: '/cv.de.md', json: '/cv.de.json', pdf: '/willi-wolff-cv-de.pdf' },
};

const TOOLS = [
    {
        name: 'get_profile',
        title: 'Profile',
        description: 'Who Willi Wolff (Will) is and what he takes on: freelance software engineer and architect in Berlin. Returns the site summary as Markdown, with experience, projects, technologies and how to work with him.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, openWorldHint: false },
    },
    {
        name: 'get_terms',
        title: 'Terms and availability',
        description: 'Current availability, hourly rate, engagement type, location, languages and contact routes, as JSON.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, openWorldHint: false },
    },
    {
        name: 'get_cv',
        title: 'CV',
        description: 'The CV in English or German. "markdown" and "json" (JSON Resume schema) return the document itself; "pdf" returns the download link.',
        inputSchema: {
            type: 'object',
            properties: {
                language: { type: 'string', enum: ['en', 'de'], default: 'en' },
                format: { type: 'string', enum: ['markdown', 'json', 'pdf'], default: 'markdown' },
            },
            additionalProperties: false,
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
    },
    {
        name: 'submit_enquiry',
        title: 'Send a project brief',
        description: 'Sends a project brief to Will by email. Call it only when the person you act for has asked you to contact him, and give an email address they can be reached at. A person reads the brief and replies by email with fit, scope, an estimate and a start date. Nothing is booked automatically.',
        inputSchema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Where the reply should go: the address of the person or company asking.' },
                summary: { type: 'string', description: 'What is needed: the problem, what exists today, what done looks like.' },
                name: { type: 'string' },
                company: { type: 'string' },
                project_type: { type: 'string', enum: PROJECT_TYPES },
                timeline: { type: 'string', description: 'For example "start in January, about 8 weeks".' },
                budget_eur: { type: 'string', description: 'A figure or a range in EUR, for example "10000-40000".' },
                engagement: { type: 'string', enum: ENGAGEMENTS },
                agent: { type: 'string', description: 'The name of the agent or product sending this.' },
                locale: { type: 'string', enum: ['en', 'de'] },
            },
            required: ['email', 'summary'],
            additionalProperties: false,
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
];

const text = (value, isError = false) => ({ content: [{ type: 'text', text: value }], isError });

async function asset(path, { request, env }) {
    const response = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
    if (!response.ok) throw new Error('Could not read ' + path);
    return response.text();
}

async function callTool(name, args, context) {
    const origin = new URL(context.request.url).origin;
    switch (name) {
        case 'get_profile':
            return text(await asset('/llms.txt', context));
        case 'get_terms':
            return text(await asset('/hire.json', context));
        case 'get_cv': {
            const language = args.language || 'en';
            const format = args.format || 'markdown';
            const path = Object.hasOwn(CV_FILES, language) && Object.hasOwn(CV_FILES[language], format) ? CV_FILES[language][format] : null;
            if (!path) return text('language must be "en" or "de", and format one of "markdown", "json", "pdf".', true);
            if (path.endsWith('.pdf')) return text(origin + path);
            return text(await asset(path, context));
        }
        case 'submit_enquiry': {
            // One brief per HTTP request, so a rate limit on requests is a limit on emails.
            if (context.briefs >= 1) return text('One brief per request. Send further briefs in separate requests.', true);
            context.briefs += 1;
            const result = await submitEnquiry({ ...args, submitted_by: 'agent' }, context.env, 'mcp');
            return text(JSON.stringify(result.body), !result.body.ok);
        }
        default:
            return null;
    }
}

async function handle(message, context) {
    const reply = result => ({ jsonrpc: '2.0', id: message.id, result });
    const fail = (code, error) => ({ jsonrpc: '2.0', id: message?.id ?? null, error: { code, message: error } });

    if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0' || typeof message.method !== 'string') return fail(-32600, 'Invalid request');
    // Notifications carry no id and get no answer.
    if (message.id === undefined || message.id === null) return null;

    const params = message.params && typeof message.params === 'object' ? message.params : {};
    switch (message.method) {
        case 'initialize':
            return reply({
                protocolVersion: VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0],
                capabilities: { tools: { listChanged: false } },
                serverInfo: { name: 'williwolff.com', title: 'Willi Wolff, freelance software engineer and architect', version: '1.0.0' },
                instructions: 'Read-only tools describe Will, his terms and his CV. submit_enquiry emails him a project brief; use it only when the person you act for asked you to get in touch.',
            });
        case 'ping':
            return reply({});
        case 'tools/list':
            return reply({ tools: TOOLS });
        case 'tools/call': {
            const args = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};
            try {
                const result = await callTool(params.name, args, context);
                return result ? reply(result) : fail(-32602, 'Unknown tool: ' + String(params.name));
            } catch {
                return reply(text('The site could not answer that just now. Try again, or read https://williwolff.com/llms.txt.', true));
            }
        }
        default:
            return fail(-32601, 'Method not found: ' + message.method);
    }
}

// Tool calls are small. Anything larger is not one.
const MAX_BYTES = 32 * 1024;
const MAX_BATCH = 20;
const rpcError = (code, message, status) => new Response(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code, message } }), { status, headers: HEADERS });

export async function onRequest({ request, env }) {
    const context = { request, env, briefs: 0 };

    if (request.method !== 'POST') {
        // No server-to-client stream and no sessions, so GET and DELETE have nothing to do.
        return new Response(JSON.stringify({
            error: 'This is an MCP endpoint (Streamable HTTP). Send JSON-RPC with POST.',
            tools: TOOLS.map(tool => tool.name),
            more: 'https://williwolff.com/llms.txt',
        }), { status: 405, headers: { ...HEADERS, Allow: 'POST' } });
    }

    const read = await readJsonBody(request, MAX_BYTES);
    if (read.tooLarge) return rpcError(-32600, 'Request too large', 413);
    if (read.invalid) return rpcError(-32700, 'Parse error', 400);
    const body = read.value;

    if (Array.isArray(body)) {
        // Refused whole, so no message of a batch goes unanswered.
        if (body.length > MAX_BATCH) return rpcError(-32600, 'A batch may hold at most ' + MAX_BATCH + ' messages', 400);
        // In order, not in parallel: the one-brief limit above counts as it goes.
        const answers = [];
        for (const message of body) {
            const answer = await handle(message, context);
            if (answer) answers.push(answer);
        }
        return answers.length ? new Response(JSON.stringify(answers), { headers: HEADERS }) : new Response(null, { status: 202 });
    }

    const answer = await handle(body, context);
    return answer ? new Response(JSON.stringify(answer), { headers: HEADERS }) : new Response(null, { status: 202 });
}

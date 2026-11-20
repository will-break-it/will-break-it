// POST /api/enquiry: a project brief as JSON, from the form or from an agent.
// The contract is in /openapi.json. GET describes the endpoint so an agent
// that lands here can find out what to send.

import { submitEnquiry, readJsonBody, PROJECT_TYPES, ENGAGEMENTS } from '../../lib/enquiry.js';

const HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });

// Briefs are short. Anything larger is not a brief.
const MAX_BYTES = 32 * 1024;

export async function onRequest({ request, env }) {
    if (request.method === 'GET' || request.method === 'HEAD') {
        return json({
            endpoint: 'POST https://williwolff.com/api/enquiry',
            content_type: 'application/json',
            required: ['email', 'summary'],
            optional: ['name', 'company', 'project_type', 'timeline', 'budget_eur', 'engagement', 'submitted_by', 'agent', 'locale'],
            project_type: PROJECT_TYPES,
            engagement: ENGAGEMENTS,
            submitted_by: ['human', 'agent'],
            answered_by: 'A person reads and answers every request.',
            schema: 'https://williwolff.com/openapi.json',
        });
    }

    if (request.method !== 'POST') return json({ ok: false, error: 'Use POST with a JSON body.' }, 405, { Allow: 'GET, POST' });

    // A browser may send text/plain to another site without asking first. JSON
    // needs a preflight, which this endpoint does not answer, so insisting on it
    // keeps other websites from posting briefs through their visitors.
    if (!/^application\/json\b/i.test(request.headers.get('content-type') || '')) {
        return json({ ok: false, error: 'Send the brief as JSON with Content-Type: application/json.' }, 415);
    }

    const body = await readJsonBody(request, MAX_BYTES);
    if (body.tooLarge) return json({ ok: false, error: 'The brief is too large.' }, 413);
    if (body.invalid) return json({ ok: false, error: 'The body must be JSON.' }, 400);
    const payload = body.value;

    const sameOrigin = (request.headers.get('origin') || '') === new URL(request.url).origin;
    const result = await submitEnquiry(payload, env, sameOrigin ? 'form' : 'api', request.headers.get('cf-connecting-ip'));
    return json(result.body, result.status, result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {});
}

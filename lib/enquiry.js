// A project brief, from the form on the page, a JSON POST or the MCP tool.
// All three end here: validate, then email it to Will.
//
// Everything in a brief is untrusted text. It is escaped before it reaches
// HTML, stripped of line breaks before it reaches a mail header, and no mail
// is ever sent to an address taken from the brief, so the endpoint cannot be
// used to send mail to third parties.

export const PROJECT_TYPES = ['ai_automation', 'backend_architecture', 'blockchain_distributed', 'web_mobile', 'other'];
export const ENGAGEMENTS = ['hourly', 'fixed_price', 'unsure'];

// The address the site shows, and where briefs go unless CONTACT_TO_EMAIL names
// another inbox. Brief emails are marked by their subject, "[williwolff.com]".
export const SITE_ADDRESS = 'contact@williwolff.com';

export const TRAP_FIELD = 'hp_confirm';

const LIMITS = { name: 120, email: 254, company: 160, summary: 6000, timeline: 300, budget_eur: 80, agent: 120 };

const TEXT = {
    en: {
        email: 'Give an email address a person can reply to.',
        summary: 'Describe what you need in a sentence or more.',
        summaryLong: 'Keep the description under 6,000 characters. Send the rest once we are in touch.',
        project_type: 'project_type must be one of: ' + PROJECT_TYPES.join(', ') + '.',
        engagement: 'engagement must be one of: ' + ENGAGEMENTS.join(', ') + '.',
        invalid: 'Some fields need another look.',
        unavailable: 'The form cannot send right now. Please email contact@williwolff.com instead.',
        failed: 'Sending could not be confirmed. Your brief was not lost on your side; try again or email contact@williwolff.com.',
        sent: 'Brief received. Will reads every request himself and replies by email.',
        limited: 'Too many briefs for now. Please try again later, or email contact@williwolff.com.',
    },
    de: {
        email: 'Bitte eine E-Mail-Adresse angeben, auf die ein Mensch antworten kann.',
        summary: 'Bitte in mindestens einem Satz beschreiben, worum es geht.',
        summaryLong: 'Bitte die Beschreibung unter 6.000 Zeichen halten. Der Rest folgt, sobald wir im Gespräch sind.',
        project_type: 'project_type muss einer dieser Werte sein: ' + PROJECT_TYPES.join(', ') + '.',
        engagement: 'engagement muss einer dieser Werte sein: ' + ENGAGEMENTS.join(', ') + '.',
        invalid: 'Einige Felder brauchen noch einen Blick.',
        unavailable: 'Das Formular kann gerade nicht senden. Bitte stattdessen an contact@williwolff.com schreiben.',
        failed: 'Der Versand konnte nicht bestätigt werden. Bitte erneut versuchen oder an contact@williwolff.com schreiben.',
        sent: 'Anfrage erhalten. Will liest jede Anfrage selbst und antwortet per E-Mail.',
        limited: 'Im Moment sind es zu viele Anfragen. Bitte später erneut versuchen oder an contact@williwolff.com schreiben.',
    },
};

const str = v => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const oneLine = v => str(v).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
// Apostrophes are allowed (o'brien@example.com); the text is escaped before it reaches HTML.
// The domain is checked label by label, so "ada@example..com" and "a@b.c." are a
// field error here and not a refused send later.
const isEmail = v => /^[^\s@<>",;]+@[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?(?:\.[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?)+$/u.test(v)
    && !/^\.|\.\.|\.@/.test(v);
const escapeHtml = v => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function normalise(raw) {
    const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const locale = str(input.locale).toLowerCase().startsWith('de') ? 'de' : 'en';
    return {
        name: oneLine(input.name).slice(0, LIMITS.name),
        email: oneLine(input.email).toLowerCase().slice(0, LIMITS.email),
        company: oneLine(input.company).slice(0, LIMITS.company),
        project_type: oneLine(input.project_type).toLowerCase() || 'other',
        // Not cut to the limit: a brief that loses its end must be refused, not shortened.
        summary: str(input.summary),
        timeline: oneLine(input.timeline).slice(0, LIMITS.timeline),
        budget_eur: oneLine(input.budget_eur).slice(0, LIMITS.budget_eur),
        engagement: oneLine(input.engagement).toLowerCase() || 'unsure',
        submitted_by: oneLine(input.submitted_by).toLowerCase() === 'agent' ? 'agent' : 'human',
        agent: oneLine(input.agent).slice(0, LIMITS.agent),
        locale,
        // Hidden on the page; a person never fills it. The name is one no
        // client or autofill would send, so a real brief cannot trip it.
        trap: str(input[TRAP_FIELD]),
    };
}

export function validate(brief) {
    const t = TEXT[brief.locale];
    const fields = {};
    if (!isEmail(brief.email)) fields.email = t.email;
    if (brief.summary.length < 10) fields.summary = t.summary;
    else if (brief.summary.length > LIMITS.summary) fields.summary = t.summaryLong;
    if (!PROJECT_TYPES.includes(brief.project_type)) fields.project_type = t.project_type;
    if (!ENGAGEMENTS.includes(brief.engagement)) fields.engagement = t.engagement;
    return fields;
}

function reference() {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    return 'WW-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function messageText(brief, ref, via) {
    const from = brief.submitted_by === 'agent'
        ? 'Sent by an agent' + (brief.agent ? ' (' + brief.agent + ')' : '') + ' on behalf of the person below.'
        : 'Sent by a person.';
    const row = (label, value) => (value ? label + ': ' + value : null);
    return [
        'New brief from williwolff.com · ' + ref,
        from + ' Route: ' + via + '.',
        '',
        row('Name', brief.name),
        row('Email', brief.email),
        row('Company', brief.company),
        row('Kind of project', brief.project_type),
        row('Timeline', brief.timeline),
        row('Budget (EUR)', brief.budget_eur),
        row('Engagement', brief.engagement),
        row('Language', brief.locale),
        '',
        'What they need:',
        brief.summary,
    ].filter(line => line !== null).join('\n');
}

// --- how many briefs --------------------------------------------------------
//
// Every valid brief becomes an email, and the routes need no sign-in because
// agents use them. So the number is capped: per visitor and hour, and in total
// per day.
//
// The counters are plain variables in the memory of the running Function. That
// needs no store, no binding and no setup, and it costs nothing. It is also
// approximate: Cloudflare may run several copies of the Function, each with
// its own counters, and starts a fresh copy now and then. So this stops a
// script that hammers the endpoint, which is the case that matters, but it is
// not an exact quota. The mail provider's own daily quota is the hard stop.
//
// Nothing is written anywhere: an address is held only for the current hour.

const LIMITS_DEFAULT = { perVisitorPerHour: 5, perDay: 100 };
const HOUR = 3600;
const DAY = 24 * HOUR;
const counts = { hour: -1, day: -1, visitors: new Map(), total: 0 };

// For tests: start counting from zero.
export function forgetBriefCounts() {
    counts.hour = -1;
    counts.day = -1;
    counts.visitors.clear();
    counts.total = 0;
}

// Counts this brief. Returns 0 when it may be sent, otherwise the seconds to wait.
export function overLimit(env, ip, now = Date.now()) {
    const perVisitor = Number(env && env.BRIEF_LIMIT_PER_VISITOR_HOUR) || LIMITS_DEFAULT.perVisitorPerHour;
    const perDay = Number(env && env.BRIEF_LIMIT_PER_DAY) || LIMITS_DEFAULT.perDay;
    const seconds = Math.floor(now / 1000);
    const hour = Math.floor(seconds / HOUR);
    const day = Math.floor(seconds / DAY);
    if (hour !== counts.hour) { counts.hour = hour; counts.visitors.clear(); }
    if (day !== counts.day) { counts.day = day; counts.total = 0; }

    if (counts.total >= perDay) return (day + 1) * DAY - seconds;
    const visitor = ip || 'unknown';
    const sent = counts.visitors.get(visitor) || 0;
    if (sent >= perVisitor) return (hour + 1) * HOUR - seconds;
    // The map cannot grow past the daily cap: every entry added also adds to the total.
    counts.visitors.set(visitor, sent + 1);
    counts.total += 1;
    return 0;
}

// --- who delivers the email ---------------------------------------------------
//
// Two services can deliver a brief, and the secrets set for the Pages project
// decide which: Cloudflare Email Service when its token and account id are
// there, otherwise Brevo when its key is. Each returns a function that sends
// one message and throws unless the service confirms it.
//
// Cloudflare sends for free to a verified destination address of the account,
// so with it CONTACT_TO_EMAIL has to be that inbox. Sending to any other
// address needs the paid Workers plan.

function sender(env) {
    if (env && env.CLOUDFLARE_EMAIL_TOKEN && env.CLOUDFLARE_ACCOUNT_ID) return message => viaCloudflare(env, message);
    if (env && env.BREVO_API_KEY) return message => viaBrevo(env, message);
    return null;
}

async function postJson(url, headers, body) {
    const response = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(8000),
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        // Status only: no visitor content and no credentials in the log.
        console.error('enquiry-send-failed', { status: response.status });
        throw new Error('send-failed');
    }
    return response.json();
}

async function viaCloudflare(env, message) {
    const answer = await postJson(
        'https://api.cloudflare.com/client/v4/accounts/' + encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID) + '/email/sending/send',
        { Authorization: 'Bearer ' + env.CLOUDFLARE_EMAIL_TOKEN },
        {
            from: { address: message.from.email, name: message.from.name },
            to: message.to,
            reply_to: message.replyTo.email,
            subject: message.subject,
            text: message.text,
            html: message.html,
        },
    );
    const result = (answer && answer.success && answer.result) || {};
    const accepted = [...(result.delivered || []), ...(result.queued || [])];
    if (!accepted.length) throw new Error('no-confirmation');
}

async function viaBrevo(env, message) {
    const answer = await postJson('https://api.brevo.com/v3/smtp/email', { 'api-key': env.BREVO_API_KEY }, {
        sender: message.from,
        to: [{ email: message.to }],
        replyTo: message.replyTo,
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html,
    });
    if (!answer || !answer.messageId) throw new Error('no-confirmation');
}

// Returns { status, body, retryAfter? }. `via` names the route: "form", "api" or
// "mcp"; `ip` is the caller's address, used only to count briefs per visitor.
export async function submitEnquiry(raw, env, via, ip) {
    const brief = normalise(raw);
    const t = TEXT[brief.locale];

    // A filled trap field means a form-filling bot. Answer as if it worked.
    if (brief.trap) return { status: 200, body: { ok: true, message: t.sent } };

    const fields = validate(brief);
    if (Object.keys(fields).length) return { status: 400, body: { ok: false, code: 'invalid', error: t.invalid, fields } };

    const fallback = { email: SITE_ADDRESS };
    const send = sender(env);
    if (!send) {
        console.error('enquiry-not-configured: set CLOUDFLARE_EMAIL_TOKEN and CLOUDFLARE_ACCOUNT_ID, or BREVO_API_KEY');
        return { status: 503, body: { ok: false, code: 'unavailable', error: t.unavailable, fallback } };
    }

    const wait = overLimit(env, ip);
    if (wait) return { status: 429, retryAfter: wait, body: { ok: false, code: 'rate_limited', error: t.limited, retry_after_seconds: wait, fallback } };

    const ref = reference();
    const text = messageText(brief, ref, via);
    const who = brief.company || brief.name || brief.email;
    const tag = brief.submitted_by === 'agent' ? ' (via agent)' : '';

    try {
        await send({
            from: { name: env.CONTACT_SENDER_NAME || 'williwolff.com', email: env.CONTACT_FROM_EMAIL || 'contact@williwolff.com' },
            to: env.CONTACT_TO_EMAIL || SITE_ADDRESS,
            replyTo: { email: brief.email, name: brief.name || brief.email },
            subject: ('[williwolff.com] Brief ' + ref + ': ' + brief.project_type + ' from ' + who + tag).slice(0, 200),
            text,
            html: '<pre style="font:14px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:pre-wrap">' + escapeHtml(text) + '</pre>',
        });
    } catch (error) {
        // The kind of failure only (timeout, network, no confirmation): no visitor content.
        console.error('enquiry-send-error', { name: error && error.name, message: error && error.message });
        return { status: 503, body: { ok: false, code: 'delivery_failed', error: t.failed, fallback } };
    }

    return { status: 200, body: { ok: true, reference: ref, message: t.sent } };
}

// Reads a JSON request body of at most `maxBytes`, counted in bytes while it
// streams, so a large body is refused without being read to the end.
// Returns { value }, { tooLarge: true } or { invalid: true }.
export async function readJsonBody(request, maxBytes) {
    if (Number(request.headers.get('content-length') || 0) > maxBytes) return { tooLarge: true };
    const chunks = [];
    let size = 0;
    if (request.body) {
        const reader = request.body.getReader();
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) {
                await reader.cancel();
                return { tooLarge: true };
            }
            chunks.push(value);
        }
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    try {
        return { value: JSON.parse(new TextDecoder().decode(bytes)) };
    } catch {
        return { invalid: true };
    }
}

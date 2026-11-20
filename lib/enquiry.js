// A project brief, from the form on the page, a JSON POST or the MCP tool.
// All three end here: validate, then email it to Will through Brevo.
//
// Everything in a brief is untrusted text. It is escaped before it reaches
// HTML, stripped of line breaks before it reaches a mail header, and no mail
// is ever sent to an address taken from the brief, so the endpoint cannot be
// used to send mail to third parties.

export const PROJECT_TYPES = ['ai_automation', 'backend_architecture', 'blockchain_distributed', 'web_mobile', 'other'];
export const ENGAGEMENTS = ['hourly', 'fixed_price', 'unsure'];

const LIMITS = { name: 120, email: 254, company: 160, summary: 6000, timeline: 300, budget_eur: 80, agent: 120 };

const TEXT = {
    en: {
        email: 'Give an email address a person can reply to.',
        summary: 'Describe what you need in a sentence or more.',
        project_type: 'project_type must be one of: ' + PROJECT_TYPES.join(', ') + '.',
        engagement: 'engagement must be one of: ' + ENGAGEMENTS.join(', ') + '.',
        invalid: 'Some fields need another look.',
        unavailable: 'The form cannot send right now. Please email contact@williwolff.com instead.',
        failed: 'Sending could not be confirmed. Your brief was not lost on your side; try again or email contact@williwolff.com.',
        sent: 'Brief received. Will reads every request himself and replies by email.',
    },
    de: {
        email: 'Bitte eine E-Mail-Adresse angeben, auf die ein Mensch antworten kann.',
        summary: 'Bitte in mindestens einem Satz beschreiben, worum es geht.',
        project_type: 'project_type muss einer dieser Werte sein: ' + PROJECT_TYPES.join(', ') + '.',
        engagement: 'engagement muss einer dieser Werte sein: ' + ENGAGEMENTS.join(', ') + '.',
        invalid: 'Einige Felder brauchen noch einen Blick.',
        unavailable: 'Das Formular kann gerade nicht senden. Bitte stattdessen an contact@williwolff.com schreiben.',
        failed: 'Der Versand konnte nicht bestätigt werden. Bitte erneut versuchen oder an contact@williwolff.com schreiben.',
        sent: 'Anfrage erhalten. Will liest jede Anfrage selbst und antwortet per E-Mail.',
    },
};

const str = v => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const oneLine = v => str(v).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
const isEmail = v => /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/.test(v);
const escapeHtml = v => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function normalise(raw) {
    const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const locale = str(input.locale).toLowerCase().startsWith('de') ? 'de' : 'en';
    return {
        name: oneLine(input.name).slice(0, LIMITS.name),
        email: oneLine(input.email).toLowerCase().slice(0, LIMITS.email),
        company: oneLine(input.company).slice(0, LIMITS.company),
        project_type: oneLine(input.project_type).toLowerCase() || 'other',
        summary: str(input.summary).slice(0, LIMITS.summary),
        timeline: oneLine(input.timeline).slice(0, LIMITS.timeline),
        budget_eur: oneLine(input.budget_eur).slice(0, LIMITS.budget_eur),
        engagement: oneLine(input.engagement).toLowerCase() || 'unsure',
        submitted_by: oneLine(input.submitted_by).toLowerCase() === 'agent' ? 'agent' : 'human',
        agent: oneLine(input.agent).slice(0, LIMITS.agent),
        locale,
        // Hidden on the page; a person never fills it.
        trap: str(input.website),
    };
}

export function validate(brief) {
    const t = TEXT[brief.locale];
    const fields = {};
    if (!isEmail(brief.email)) fields.email = t.email;
    if (brief.summary.length < 10) fields.summary = t.summary;
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

// Returns { status, body }. `via` names the route: "form", "api" or "mcp".
export async function submitEnquiry(raw, env, via) {
    const brief = normalise(raw);
    const t = TEXT[brief.locale];

    // A filled trap field means a form-filling bot. Answer as if it worked.
    if (brief.trap) return { status: 200, body: { ok: true, message: t.sent } };

    const fields = validate(brief);
    if (Object.keys(fields).length) return { status: 400, body: { ok: false, code: 'invalid', error: t.invalid, fields } };

    const fallback = { email: 'contact@williwolff.com' };
    if (!env || !env.BREVO_API_KEY) {
        console.error('enquiry-not-configured: missing BREVO_API_KEY');
        return { status: 503, body: { ok: false, code: 'unavailable', error: t.unavailable, fallback } };
    }

    const ref = reference();
    const text = messageText(brief, ref, via);
    const who = brief.company || brief.name || brief.email;
    const tag = brief.submitted_by === 'agent' ? ' (via agent)' : '';

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            signal: AbortSignal.timeout(8000),
            headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: {
                    name: env.CONTACT_SENDER_NAME || 'williwolff.com',
                    email: env.CONTACT_FROM_EMAIL || 'contact@williwolff.com',
                },
                to: [{ email: env.CONTACT_TO_EMAIL || 'contact@williwolff.com' }],
                replyTo: { email: brief.email, name: brief.name || brief.email },
                subject: ('[williwolff.com] Brief ' + ref + ': ' + brief.project_type + ' from ' + who + tag).slice(0, 200),
                textContent: text,
                htmlContent: '<pre style="font:14px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:pre-wrap">' + escapeHtml(text) + '</pre>',
            }),
        });
        if (!response.ok) {
            // Status only: no visitor content and no credentials in the log.
            console.error('enquiry-send-failed', { status: response.status });
            throw new Error('send-failed');
        }
        const confirmation = await response.json();
        if (!confirmation || !confirmation.messageId) throw new Error('no-confirmation');
    } catch {
        return { status: 503, body: { ok: false, code: 'delivery_failed', error: t.failed, fallback } };
    }

    return { status: 200, body: { ok: true, reference: ref, message: t.sent } };
}

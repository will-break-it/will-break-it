// The email Will receives for a brief, as HTML. Its plain-text twin is
// messageText() in enquiry.js; a mail program shows one or the other.
//
// Will chose this design from four (November 2026): a white card with a few
// dots of confetti and "A new brief came in.", then the three facts that decide
// (budget, timeline, kind of project) as big figures, what the visitor needs,
// and a button that starts a reply.
//
// Written for Gmail: tables and inline styles, no images, no web fonts. The
// <style> block only adds what a mail program may ignore without harm: narrower
// padding on a phone and the dark palette of the site where a program follows
// the device.
//
// Everything from the brief is untrusted text and goes through escapeHtml().
// The only link is the reply button, built from the address that validate()
// has already accepted.
//
// Gmail's own Reply quotes this email under the answer, so the visitor may see
// it. Nothing here is written that they should not read. The button starts a
// fresh message with no quote.

export const escapeHtml = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
// The light palette of the site, as plain values: an email cannot read its tokens.
const C = { bg: '#ffffff', page: '#f6f8fa', border: '#e2e8ee', ink: '#0b1622', text: '#27323f', muted: '#5b6878', brand: '#0d9488', soft: '#e7f4f3', softLine: '#cfe5e3', amber: '#fbbf24', sky: '#38bdf8', white: '#ffffff' };
const DARK = '.page{background:#060d15 !important}.card{background:#0b1622 !important;border-color:#213243 !important}.ink{color:#f4f7fa !important}.text{color:#d3dbe4 !important}.muted{color:#9dabba !important}.soft{background:#10302f !important}.line{border-color:#1f4a47 !important}.btn{background:#2dd4bf !important;color:#062521 !important}';
// On a phone the three facts stand under each other.
const PHONE = '.pad{padding-left:20px !important;padding-right:20px !important}.big{font-size:24px !important}'
    + '.fact{display:block !important;width:auto !important;border-left:none !important;padding:0 !important}.fact + .fact{padding-top:14px !important}';

// The words of the form, where the brief carries the value an agent would send.
const KIND = {
    ai_automation: 'AI agent or automation',
    backend_architecture: 'Enterprise software or architecture',
    blockchain_distributed: 'Blockchain or distributed systems',
    web_mobile: 'Website, booking system or app',
    other: 'Something else',
};
const ENGAGEMENT = { hourly: 'Hourly', fixed_price: 'Fixed price' };
const ROUTE = { form: 'the form', api: 'the API', mcp: 'the MCP tool' };

const capital = v => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v);

// "10000-40000" reads as "10,000 to 40,000 EUR". Text without a figure stays as it is.
export function budgetLabel(value) {
    if (!value) return '';
    const text = capital(value.replace(/(\d)\s*-\s*(?=\d)/g, '$1 to ').replace(/\d{4,}/g, n => n.replace(/\B(?=(\d{3})+(?!\d))/g, ',')));
    return /\d/.test(text) && !/eur|€/i.test(text) ? text + ' EUR' : text;
}

// A reply that starts fresh, with the reference in the subject, in the visitor's language.
function replyLink(brief, ref) {
    const subject = (brief.locale === 'de' ? 'Ihre Anfrage ' : 'Your brief ') + ref;
    return 'mailto:' + encodeURIComponent(brief.email).replace(/%40/g, '@') + '?subject=' + encodeURIComponent(subject);
}

// Five small dots and squares in the colours of the first screen.
function confetti() {
    return [C.brand, C.amber, C.sky, C.brand, C.amber].map((colour, i) => {
        const size = 8 + (i % 3) * 2;
        return `<span style="display:inline-block;width:${size}px;height:${size}px;border-radius:${i % 2 ? '2px' : '50%'};background:${colour};margin:0 ${5 + (i % 2) * 4}px 0 0;vertical-align:middle"></span>`;
    }).join('');
}

// The facts that decide whether a brief fits, as big figures like the numbers on the site.
function facts(list) {
    const width = Math.floor(100 / list.length);
    return list.map(([value, label], i) =>
        `<td class="fact line" style="width:${width}%;vertical-align:top;padding:2px ${i === list.length - 1 ? 0 : 14}px 2px ${i ? 18 : 0}px;${i ? 'border-left:1px solid ' + C.softLine : ''}">`
        + `<div class="ink" style="font-size:19px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;color:${C.ink}">${escapeHtml(value)}</div>`
        + `<div class="muted" style="margin-top:4px;font-size:13px;color:${C.muted}">${label}</div></td>`).join('');
}

export function briefHtml(brief, ref, via) {
    const who = brief.name || brief.email;
    const first = brief.name ? brief.name.split(' ')[0] : '';
    const byAgent = brief.submitted_by === 'agent';
    const origin = (byAgent ? 'Sent by an agent' + (brief.agent ? ' (' + brief.agent + ')' : '') + ' on behalf of this person' : 'Sent by a person')
        + ', through ' + (ROUTE[via] || via) + ', in ' + (brief.locale === 'de' ? 'German' : 'English') + '.';
    const summary = escapeHtml(brief.summary).replace(/\r?\n/g, '<br>');

    // The form's empty budget is its "Not sure yet". An agent that names none has said nothing.
    const budget = budgetLabel(brief.budget_eur) || (via === 'form' ? 'Not sure yet' : '');
    const deciding = [[budget, 'Budget'], [capital(brief.timeline), 'Timeline'], [KIND[brief.project_type] || brief.project_type, 'Kind of project']].filter(([value]) => value);
    const engagement = ENGAGEMENT[brief.engagement];

    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">'
        + `<style>@media (prefers-color-scheme: dark){${DARK}}@media (max-width:480px){${PHONE}}</style></head>`
        + `<body class="page" style="margin:0;padding:0;background:${C.page}">`
        + `<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">`
        + `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${FONT}">`
        + `<tr><td class="card pad" style="background:${C.bg};border:1px solid ${C.border};border-radius:16px;padding:30px 36px 32px">`
        // who
        + `<div style="line-height:1;margin-bottom:14px">${confetti()}</div>`
        + `<div class="ink big" style="font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:${C.ink}">A new brief came in.</div>`
        + `<div class="muted" style="margin-top:8px;font-size:15px;line-height:1.5;color:${C.muted}">From <b class="ink" style="color:${C.ink}">${escapeHtml(who)}</b>${brief.company ? ', ' + escapeHtml(brief.company) : ''}`
        + (byAgent ? `<br>Via an agent${brief.agent ? ' (' + escapeHtml(brief.agent) + ')' : ''}` : '') + '</div>'
        // the facts that decide
        + `<table role="presentation" class="soft" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:${C.soft};border-radius:12px"><tr><td style="padding:18px 20px">`
        + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${facts(deciding)}</tr></table>`
        + (engagement ? `<div class="muted line" style="margin-top:14px;padding-top:12px;border-top:1px solid ${C.softLine};font-size:14px;color:${C.muted}">Engagement: <b class="ink" style="color:${C.ink}">${engagement}</b></div>` : '')
        + '</td></tr></table>'
        // the brief
        + `<p class="muted" style="margin:0 0 6px;font-size:13px;color:${C.muted}">What they need</p>`
        + `<p class="text" style="margin:0 0 26px;font-size:16px;line-height:1.6;color:${C.text}">${summary}</p>`
        + '<table role="presentation" cellpadding="0" cellspacing="0"><tr>'
        + `<td><a class="btn" href="${escapeHtml(replyLink(brief, ref))}" style="display:inline-block;padding:13px 24px;border-radius:999px;background:${C.brand};color:${C.white};font-size:15px;font-weight:600;text-decoration:none">${first ? 'Reply to ' + escapeHtml(first) : 'Reply'}</a></td>`
        + `<td class="muted" style="padding-left:16px;font-family:${MONO};font-size:13px;color:${C.muted}">${escapeHtml(ref)}</td></tr></table>`
        + `<p class="muted" style="margin:22px 0 0;font-size:12px;line-height:1.6;color:${C.muted}">${escapeHtml(origin)} Reference <span style="font-family:${MONO}">${escapeHtml(ref)}</span>. `
        + `Replying to this email writes to ${escapeHtml(brief.email)}.</p>`
        + '</td></tr></table></td></tr></table></body></html>';
}

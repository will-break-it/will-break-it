// The email Will receives for a brief, as HTML. Its plain-text twin is
// messageText() in enquiry.js; a mail program shows one or the other.
//
// Will chose this design from four (November 2026): a teal band with confetti
// and "New brief", then what the visitor needs, the facts as a list, and a
// button that starts a reply.
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
const C = { bg: '#ffffff', page: '#f6f8fa', border: '#e2e8ee', ink: '#0b1622', muted: '#5b6878', brand: '#0d9488', bandText: '#d9f2ef', chip: '#0b7f75', amber: '#fbbf24', sky: '#38bdf8', mint: '#5eead4', white: '#ffffff' };
const DARK = '.page{background:#060d15 !important}.card{background:#0b1622 !important;border-color:#213243 !important}.ink{color:#f4f7fa !important}.muted{color:#9dabba !important}.line{border-color:#213243 !important}.btn{background:#2dd4bf !important;color:#062521 !important}';

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

// Seven small dots and squares in the colours of the first screen.
function confetti() {
    return [C.amber, C.white, C.sky, C.mint, C.amber, C.white, C.sky].map((colour, i) => {
        const size = 9 + (i % 3) * 2;
        return `<span style="display:inline-block;width:${size}px;height:${size}px;border-radius:${i % 2 ? '2px' : '50%'};background:${colour};margin:0 ${5 + (i % 2) * 4}px 0 0;vertical-align:middle"></span>`;
    }).join('');
}

function row(label, value) {
    if (!value) return '';
    return `<tr><td class="muted line" style="padding:10px 0;border-bottom:1px solid ${C.border};width:150px;font-size:14px;color:${C.muted};vertical-align:top">${label}</td>`
        + `<td class="ink line" style="padding:10px 0;border-bottom:1px solid ${C.border};font-size:15px;font-weight:600;color:${C.ink}">${escapeHtml(value)}</td></tr>`;
}

export function briefHtml(brief, ref, via) {
    const who = brief.name || brief.email;
    const first = brief.name ? brief.name.split(' ')[0] : '';
    const byAgent = brief.submitted_by === 'agent';
    const origin = (byAgent ? 'Sent by an agent' + (brief.agent ? ' (' + brief.agent + ')' : '') + ' on behalf of this person' : 'Sent by a person')
        + ', through ' + (ROUTE[via] || via) + ', in ' + (brief.locale === 'de' ? 'German' : 'English') + '.';
    const summary = escapeHtml(brief.summary).replace(/\r?\n/g, '<br>');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">'
        + `<style>@media (prefers-color-scheme: dark){${DARK}}@media (max-width:480px){.pad{padding-left:20px !important;padding-right:20px !important}.big{font-size:24px !important}}</style></head>`
        + `<body class="page" style="margin:0;padding:0;background:${C.page}">`
        + `<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">`
        + `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${FONT}">`
        // the band
        + `<tr><td class="pad" style="background:${C.brand};border-radius:16px 16px 0 0;padding:26px 32px 28px">`
        + `<div style="line-height:1;margin-bottom:16px">${confetti()}</div>`
        + `<div class="big" style="font-size:28px;font-weight:800;letter-spacing:-0.02em;color:${C.white};line-height:1.15">New brief &#127881;</div>`
        + `<div style="margin-top:8px;font-size:15px;line-height:1.7;color:${C.bandText}">${escapeHtml(who)}${brief.company ? ', ' + escapeHtml(brief.company) : ''} &nbsp;`
        + `<span style="font-family:${MONO};font-size:13px;background:${C.chip};color:${C.white};padding:3px 9px;border-radius:999px;white-space:nowrap">${escapeHtml(ref)}</span></div>`
        + (byAgent ? `<div style="margin-top:6px;font-size:13px;color:${C.bandText}">Via an agent${brief.agent ? ' (' + escapeHtml(brief.agent) + ')' : ''}</div>` : '')
        + '</td></tr>'
        // the brief
        + `<tr><td class="card pad" style="background:${C.bg};border:1px solid ${C.border};border-top:none;border-radius:0 0 16px 16px;padding:28px 32px 30px">`
        + `<p class="muted" style="margin:0 0 6px;font-size:13px;color:${C.muted}">What they need</p>`
        + `<p class="ink" style="margin:0 0 22px;font-size:17px;line-height:1.55;color:${C.ink}">${summary}</p>`
        + `<table role="presentation" class="line" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border}">`
        + row('Kind of project', KIND[brief.project_type] || brief.project_type)
        + row('Timeline', capital(brief.timeline))
        + row('Budget', budgetLabel(brief.budget_eur))
        + row('Engagement', ENGAGEMENT[brief.engagement])
        + row('Email', brief.email)
        + '</table>'
        + `<div style="margin:26px 0 22px"><a class="btn" href="${escapeHtml(replyLink(brief, ref))}" style="display:inline-block;padding:13px 24px;border-radius:999px;background:${C.brand};color:${C.white};font-size:15px;font-weight:600;text-decoration:none">${first ? 'Reply to ' + escapeHtml(first) : 'Reply'}</a></div>`
        + `<p class="muted" style="margin:0;font-size:12px;line-height:1.6;color:${C.muted}">${escapeHtml(origin)} Reference <span style="font-family:${MONO}">${escapeHtml(ref)}</span>. `
        + `Replying to this email writes to ${escapeHtml(brief.email)}.</p>`
        + '</td></tr></table></td></tr></table></body></html>';
}

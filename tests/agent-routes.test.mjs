// Runs the Pages Functions in Node against the built site in dist/, with a
// stand-in for Brevo. No network, no email. `npm test` builds first; on its
// own, run `npm run build` and then `node --test tests/agent-routes.test.mjs`.

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { onRequest as middleware } from '../functions/_middleware.js';
import { onRequest as enquiry } from '../functions/api/enquiry.js';
import { onRequest as mcp } from '../functions/mcp.js';
import { forgetBriefCounts, overLimit, SITE_ADDRESS } from '../lib/enquiry.js';
import { cardHash } from '../scripts/preview-card.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ is missing. Run `npm run build` first, or use `npm test`.');

// A path as Pages resolves it: a folder answers with its index.html.
const resolve = path => {
    const target = join(dist, decodeURIComponent(path));
    return existsSync(target) && statSync(target).isDirectory() ? join(target, 'index.html') : target;
};
const file = name => readFileSync(resolve(name), 'utf8');

// Serves the built files the way Pages serves the deployed site.
const ASSETS = {
    async fetch(request) {
        try {
            return new Response(file(new URL(request.url).pathname));
        } catch {
            return new Response('not found', { status: 404 });
        }
    },
};

// Every built HTML page, as the path a visitor would request.
const pages = (function walk(dir, base = '/') {
    return readdirSync(dir, { withFileTypes: true }).flatMap(item => {
        if (item.isDirectory()) return walk(join(dir, item.name), base + item.name + '/');
        return item.name === 'index.html' ? [base] : [];
    });
})(dist);
const SUBPAGE = /^\/(services|work|de\/leistungen|de\/projekte)\/[a-z0-9-]+\/$/;
const subpages = pages.filter(path => SUBPAGE.test(path));
// One Markdown file per page and language.
const sources = ['services', 'work'].flatMap(kind => readdirSync(join(root, 'src/content', kind)).filter(name => name.endsWith('.md')));

const realFetch = globalThis.fetch;
let sent;
// What Cloudflare's send endpoint answers in a test; a test may replace it.
let cloudflareAnswer;
beforeEach(() => {
    sent = [];
    cloudflareAnswer = to => ({ success: true, errors: [], messages: [], result: { delivered: [to], permanent_bounces: [], queued: [] } });
    forgetBriefCounts();
    globalThis.fetch = async (url, init) => {
        const body = JSON.parse(init.body);
        sent.push({ url: String(url), body, headers: init.headers });
        if (String(url).startsWith('https://api.cloudflare.com/')) return new Response(JSON.stringify(cloudflareAnswer(body.to)), { status: 200 });
        return new Response(JSON.stringify({ messageId: '<test@brevo>' }), { status: 201 });
    };
});
afterEach(() => { globalThis.fetch = realFetch; });

const env = { ASSETS, BREVO_API_KEY: 'test-key' };
const brief = { email: 'ada@example.com', summary: 'Extract figures from supplier PDFs into our ERP, with review.' };
const post = (url, body, headers = {}) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });

// --- home page: HTML for people, Markdown for agents --------------------------

const visit = (url, headers = {}) =>
    middleware({ request: new Request(url, { headers }), env, next: () => ASSETS.fetch(new Request(url)) });
const home = (headers = {}, url = 'https://williwolff.com/') => visit(url, headers);

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
    // A POST to the old host keeps its method and body through the redirect.
    const oldPost = await middleware({ request: post('https://wwolff.pages.dev/api/enquiry', brief), env, next: () => new Response('no') });
    assert.equal(oldPost.status, 308);
    assert.equal(oldPost.headers.get('location'), 'https://williwolff.com/api/enquiry');
});

test('the old ?lang= links land on the page for that language', async () => {
    const german = await home({}, 'https://williwolff.com/?lang=de');
    assert.equal(german.status, 301);
    assert.equal(german.headers.get('location'), 'https://williwolff.com/de/');
    const english = await home({}, 'https://williwolff.com/?lang=en&utm_source=x');
    assert.equal(english.headers.get('location'), 'https://williwolff.com/?utm_source=x');
});

test('the German home page is its own page, in one language', async () => {
    const response = await visit('https://williwolff.com/de/', { accept: 'text/html' });
    const german = await response.text();
    assert.match(german, /<html lang="de"/);
    assert.match(german, /Zur Fallstudie/);
    // Besides <html> itself, the only thing marked with a language on either
    // page is the switch to the other one. Anything else is a leftover translation.
    assert.deepEqual(german.match(/ lang="[a-z]+"/g), [' lang="de"', ' lang="en"']);
    assert.deepEqual(file('/').match(/ lang="[a-z]+"/g), [' lang="en"', ' lang="de"']);
    assert.doesNotMatch(german, /Read the case study/);
    const english = file('/');
    assert.match(english, /<html lang="en"/);
    assert.match(english, /Read the case study/);
    assert.doesNotMatch(english, /Zur Fallstudie/);
});

test('a service page or case study answers an agent with its Markdown twin', async () => {
    assert.equal(subpages.length, sources.length, 'one page for every file in src/content');
    for (const path of subpages) {
        const url = 'https://williwolff.com' + path;
        const markdown = await visit(url, { accept: 'text/markdown' });
        assert.equal(markdown.headers.get('content-type'), 'text/markdown; charset=utf-8', path);
        assert.equal(markdown.headers.get('link'), `<${url}>; rel="canonical"`);
        const text = await markdown.text();
        assert.match(text, /^# \S/, path);
        assert.doesNotMatch(text, /<[a-z]+[ >]/, path + ' twin contains HTML');
        const html = await (await visit(url, { accept: 'text/html' })).text();
        assert.match(html, /<!DOCTYPE html>/i, path);
        // The twin is linked from the page, so an agent reading HTML can find it.
        assert.ok(html.includes(`href="${path.slice(0, -1)}.md"`), path + ' links its twin');
    }
});

test('the German home page answers an agent in English and says so', async () => {
    const response = await visit('https://williwolff.com/de/', { accept: 'text/markdown' });
    assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(response.headers.get('content-language'), 'en');
    assert.equal(response.headers.get('link'), '<https://williwolff.com/>; rel="canonical"');
});

// --- pages, languages and links -------------------------------------------------

const attr = (html, pattern) => (html.match(pattern) || [])[1];
const alternate = (html, lang) => attr(html, new RegExp(`<link rel="alternate" hreflang="${lang}" href="https://williwolff\\.com([^"]+)"`));

test('every page names itself, and its twin in the other language names it back', () => {
    for (const path of pages.filter(p => p !== '/404.html' && !p.startsWith('/404'))) {
        const html = file(path);
        const lang = path.startsWith('/de/') ? 'de' : 'en';
        const other = lang === 'de' ? 'en' : 'de';
        assert.equal(attr(html, /<link rel="canonical" href="https:\/\/williwolff\.com([^"]+)"/), path, path + ' canonical');
        assert.equal(alternate(html, lang), path, path + ' hreflang for itself');
        const twin = alternate(html, other);
        assert.ok(pages.includes(twin), `${path} points at ${twin}, which is not built`);
        assert.equal(alternate(file(twin), lang), path, `${twin} does not point back at ${path}`);
        assert.equal(alternate(html, 'x-default'), lang === 'en' ? path : twin, path + ' x-default');
        assert.match(html, /<title>[^<]{10,70}<\/title>/, path + ' title length');
        assert.match(html, /<meta name="description" content="[^"]{50,200}"/, path + ' description length');
        assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path + ' has one h1');
    }
});

test('the language switch is on every page and nothing hides it', () => {
    for (const path of pages) {
        const html = file(path);
        const other = path.startsWith('/de/') ? 'en' : 'de';
        const twin = alternate(html, other);
        assert.ok(html.includes(`id="lang-toggle" href="${twin}"`), path + ' has no switch to ' + twin);
    }
    // The old single page hid the other language with CSS. A rule like that
    // would hide the switch, which is labelled in the other language.
    for (const name of readdirSync(join(dist, '_astro')).filter(n => n.endsWith('.css'))) {
        assert.doesNotMatch(readFileSync(join(dist, '_astro', name), 'utf8'), /\[data-lang|\[lang[=\]]/, name + ' selects by language');
    }
});

test('the sticky header keeps its blur in every browser', () => {
    // The header is translucent. Without the blur, the text scrolling under it shows
    // through and collides with the navigation. The minifier once kept only one of the
    // two declarations: Safari before 18 needs the prefixed one, the others the standard.
    const css = readdirSync(join(dist, '_astro')).filter(n => n.endsWith('.css')).map(n => readFileSync(join(dist, '_astro', n), 'utf8')).join('');
    const header = css.match(/\.site-header\{[^}]*position:sticky[^}]*\}/);
    assert.ok(header, 'no rule for the sticky header');
    assert.match(header[0], /[;{]backdrop-filter:[^;}]*blur\(/);
    assert.match(header[0], /-webkit-backdrop-filter:[^;}]*blur\(/);
});

test('the home page script writes one language, and the German page describes itself', () => {
    // Nothing hides the other language, so text inserted by a script must not carry both.
    for (const name of readdirSync(join(dist, 'js'))) {
        assert.doesNotMatch(readFileSync(join(dist, 'js', name), 'utf8'), /lang=\\?["'](en|de)/, name + ' writes language-tagged markup');
    }
    const graph = JSON.parse(file('/de/').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const page = graph.find(node => node['@type'] === 'ProfilePage');
    assert.equal(page.inLanguage, 'de');
    for (const part of page.hasPart) {
        assert.ok(part.url.startsWith('https://williwolff.com/de/#'), part.url);
        const id = part.url.split('#')[1];
        assert.ok(file('/de/').includes(`id="${id}"`), 'no section #' + id + ' on the German page');
    }
    assert.ok(page.hasPart.some(part => part.name === 'Leistungen'));
    // Group counts in the markup match the cards under them before any script runs.
    for (const path of ['/', '/de/']) {
        const groups = file(path).split('class="group-count">').slice(1);
        for (const group of groups) {
            const count = Number(group.match(/^(\d+)/)[1]);
            assert.equal((group.match(/class="project-card[ "]/g) || []).length, count, path + ' group count');
        }
    }
});

test('every internal link on every page leads to a built file', () => {
    for (const path of pages) {
        const html = file(path);
        assert.doesNotMatch(html, /@(work|service)\//, path + ' has an unresolved page reference');
        for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
            if (href.startsWith('//') || href.startsWith('/api/')) continue;
            assert.ok(existsSync(resolve(href)), `${path} links to ${href}, which is not in dist`);
        }
    }
});

test('the sitemap and llms.txt list every page', () => {
    const sitemap = file('/sitemap.xml');
    const listed = [...sitemap.matchAll(/<loc>https:\/\/williwolff\.com([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const path of pages.filter(p => !p.startsWith('/404'))) assert.ok(listed.includes(path), path + ' is missing from the sitemap');
    for (const path of listed) assert.ok(existsSync(resolve(path)), `the sitemap lists ${path}, which is not built`);
    const llms = file('/llms.txt');
    for (const path of subpages) assert.ok(llms.includes('https://williwolff.com' + path), path + ' is missing from llms.txt');
    assert.doesNotMatch(llms, /<!--/);
    assert.match(file('/404.html'), /<meta name="robots" content="noindex/);
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
    assert.equal(sent[0].body.sender.email, 'contact@williwolff.com', 'the sender stays the plain, verified address');
    assert.match(sent[0].body.subject, /^\[williwolff\.com\] /);
    assert.equal(sent[0].body.replyTo.email, 'ada@example.com');
    assert.match(sent[0].body.subject, /via agent/);
    assert.match(sent[0].body.textContent, /Sent by an agent \(Scout\)/);
});

// Will chose the design of this email from four variants in November 2026.
test('the brief email is designed, says what the form says, and keeps its plain text', async () => {
    await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, name: 'Ada Example', company: 'Example GmbH', project_type: 'ai_automation', timeline: 'start within a month', budget_eur: '10000-40000', summary: 'First line.\nSecond line, with <b>markup</b>.' }, { origin: 'https://williwolff.com' }), env });
    const { htmlContent: html, textContent: text, subject } = sent[0].body;
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /A new brief came in\./);
    assert.match(html, />Ada Example<\/b>, Example GmbH/);
    const ref = subject.match(/WW-[0-9A-F]{8}/)[0];
    assert.ok(html.includes(ref), 'the reference is in the email');
    // The words of the form, not the values of the API.
    assert.match(html, />AI agent or automation</);
    assert.match(html, />Start within a month</);
    assert.match(html, />10,000 to 40,000 EUR</);
    assert.equal(html.match(/class="fact line"/g).length, 3, 'budget, timeline and kind of project');
    assert.doesNotMatch(html, /ai_automation|Engagement/, 'no raw value, and no line for an engagement nobody chose');
    // The brief is text: its line breaks are kept and its markup is not.
    assert.match(html, /First line\.<br>Second line, with &lt;b&gt;markup&lt;\/b&gt;\./);
    // One link, a reply to the visitor that starts fresh, and no picture to load.
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(links, ['mailto:ada@example.com?subject=Your%20brief%20' + ref]);
    assert.match(html, />Reply to Ada</);
    assert.doesNotMatch(html, /<img|<script|url\(/);
    assert.match(html, /Sent by a person, through the form, in English\./);
    // The plain text is still there for a mail program that shows no HTML.
    assert.match(text, /^New brief from williwolff\.com · WW-/);
    assert.match(text, /What they need:\nFirst line\.\nSecond line/);

    // An agent's brief says so, and a German visitor gets a German subject on the reply.
    await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, submitted_by: 'agent', agent: 'Scout <x>', locale: 'de', engagement: 'fixed_price', budget_eur: 'hourly, open ended' }), env });
    const second = sent[1].body.htmlContent;
    assert.match(second, /Via an agent \(Scout &lt;x&gt;\)/);
    assert.match(second, /Sent by an agent \(Scout &lt;x&gt;\) on behalf of this person, through the API, in German\./);
    assert.match(second, /subject=Ihre%20Anfrage%20WW-/);
    assert.match(second, /Engagement: <b[^>]*>Fixed price</);
    assert.match(second, />Hourly, open ended</);
    assert.match(second, />Reply</, 'without a name the button only says Reply');

    // The form's empty budget is its "Not sure yet"; an agent that names none gets no words put in its mouth.
    await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, budget_eur: '' }, { origin: 'https://williwolff.com' }), env });
    assert.match(sent[2].body.htmlContent, />Not sure yet</);
    await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, budget_eur: '' }), env });
    assert.doesNotMatch(sent[3].body.htmlContent, /Not sure yet|>Budget</);
});

test('the brief email rewrites only a bare amount, and keeps what was typed', async () => {
    const { budgetLabel, briefHtml } = await import('../lib/brief-mail.js');
    // The form's own values read as the form words them.
    assert.equal(budgetLabel('under 10000'), 'Under 10,000 EUR');
    assert.equal(budgetLabel('10000-40000'), '10,000 to 40,000 EUR');
    assert.equal(budgetLabel('over 40000'), 'Over 40,000 EUR');
    assert.equal(budgetLabel('hourly, open ended'), 'Hourly, open ended');
    assert.equal(budgetLabel('2500000'), '2,500,000 EUR');
    // An agent may write anything: another currency, a year, a date. None of it is touched.
    for (const typed of ['5000 USD', '$20000', '£8000', '2 developers for 3 months', 'Approved for 2027', 'TBD by 2026-12-01', 'Q1-2027', '0.12345', '15000 EUR'])
        assert.equal(budgetLabel(typed), typed);

    const mail = over => briefHtml({ name: '', company: '', email: 'ada@example.com', summary: 'Something to build.', project_type: 'other', timeline: '', budget_eur: '', engagement: 'unsure', locale: 'en', submitted_by: 'human', agent: '', ...over }, 'WW-00000000', 'api');
    // Indents and runs of spaces survive without a style a mail program may drop.
    assert.match(mail({ summary: 'Steps:\n    - export CSV\n\t- map   columns' }), /Steps:<br>&nbsp;&nbsp;&nbsp;&nbsp;- export CSV<br>&nbsp;&nbsp;&nbsp;&nbsp;- map&nbsp;&nbsp;&nbsp;columns/);
    // A title or "Surname, Name" is not a first name.
    assert.match(mail({ name: 'Ada Example' }), />Reply to Ada</);
    for (const name of ['Dr. Ada Example', 'Example, Ada', 'Herr Müller', 'Prof Ada Example'])
        assert.match(mail({ name }), />Reply</, name);
    // A long unbroken string breaks inside the card.
    assert.ok(mail({}).split('overflow-wrap:anywhere').length > 4);
    assert.match(mail({}), /max-width:600px;table-layout:fixed/);
});

test('an address that holds half a character pair is a field error, not a failed send', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, email: 'a\ud800b@example.com' }), env });
    assert.equal(response.status, 400);
    assert.deepEqual(Object.keys((await response.json()).fields), ['email']);
    assert.equal(sent.length, 0);
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
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, hp_confirm: 'https://spam.example' }), env });
    assert.equal((await response.json()).ok, true);
    assert.equal(sent.length, 0);
});

test('a brief that names a website, or an address with an apostrophe, is still sent', async () => {
    const withSite = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, website: 'https://acme.example' }), env });
    assert.match((await withSite.json()).reference, /^WW-/);
    const irish = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, email: "o'brien@example.com" }), env });
    assert.equal(irish.status, 200);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].body.replyTo.email, "o'brien@example.com");
    assert.doesNotMatch(sent[1].body.htmlContent, /o'brien/, 'the apostrophe is escaped in the HTML part');
});

test('an address no mail server would accept is a field error, not an outage', async () => {
    for (const email of ['ada@example..com', 'a@b.c.', 'ada@.example.com', 'ada.@example.com', 'ada@-example.com', 'ada@example']) {
        const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, email }), env });
        assert.equal(response.status, 400, email);
        assert.ok((await response.json()).fields.email, email);
    }
    for (const email of ['ada@example.com', 'ada.lovelace+work@mail.example.co.uk', 'jürgen@müller.de', 'a@b.co']) {
        const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, email }), env });
        assert.equal(response.status, 200, email);
    }
    assert.equal(sent.length, 4);
});

test('the form works without its script and states nothing the visitor did not choose', () => {
    for (const path of ['/', '/de/']) {
        const html = file(path);
        const form = html.match(/<form[^>]*id="brief-form"[^>]*>/)[0];
        assert.match(form, /action="mailto:contact@williwolff\.com/, path);
        assert.match(form, /method="post"/, path);
        assert.match(form, /enctype="text\/plain"/, path);
        // The first option of each select is what a visitor sends without choosing.
        const first = name => html.match(new RegExp(`<select[^>]*name="${name}"[^>]*>\\s*<option value="([^"]*)"`))[1];
        assert.equal(first('timeline'), 'not fixed yet', path);
        assert.equal(first('budget_eur'), '', path);
    }
});

test('a brief that is too long is refused, not cut', async () => {
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, summary: 'x'.repeat(6001) }), env });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.fields.summary, /6,000/);
    assert.equal(sent.length, 0);
    const fits = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, summary: 'x'.repeat(6000) }), env });
    assert.equal(fits.status, 200);
    assert.equal(sent[0].body.textContent.match(/x+$/)[0].length, 6000);
});

test('only JSON is accepted, so another website cannot post through its visitors', async () => {
    for (const type of [undefined, 'text/plain;charset=UTF-8', 'application/x-www-form-urlencoded']) {
        const headers = type ? { 'content-type': type } : {};
        const response = await enquiry({ request: new Request('https://williwolff.com/api/enquiry', { method: 'POST', headers, body: JSON.stringify(brief) }), env });
        assert.equal(response.status, 415, String(type));
    }
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
    // The cap counts bytes, not characters: 12,000 euro signs are 36 KB.
    assert.equal((await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, summary: '€'.repeat(12000) }), env })).status, 413);
    const described = await (await enquiry({ request: new Request('https://williwolff.com/api/enquiry'), env })).json();
    assert.deepEqual(described.required, ['email', 'summary']);
});

const from = (ip, body = brief) => post('https://williwolff.com/api/enquiry', body, { 'cf-connecting-ip': ip });

test('briefs are capped per visitor and per day', async () => {
    for (let i = 0; i < 5; i += 1) assert.equal((await enquiry({ request: from('203.0.113.7'), env })).status, 200);
    const sixth = await enquiry({ request: from('203.0.113.7'), env });
    const body = await sixth.json();
    assert.equal(sixth.status, 429);
    assert.equal(body.code, 'rate_limited');
    assert.equal(body.fallback.email, 'contact@williwolff.com');
    assert.ok(Number(sixth.headers.get('retry-after')) > 0 && Number(sixth.headers.get('retry-after')) <= 3600);
    // Another visitor is not affected, and an invalid brief is not counted.
    assert.equal((await enquiry({ request: from('203.0.113.8'), env })).status, 200);
    for (let i = 0; i < 9; i += 1) assert.equal((await enquiry({ request: from('203.0.113.9', { summary: 'no address given here' }), env })).status, 400);
    assert.equal((await enquiry({ request: from('203.0.113.9'), env })).status, 200);
    assert.equal(sent.length, 7);

    // The same cap holds for the MCP route.
    const call = { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'submit_enquiry', arguments: brief } };
    const viaMcp = await mcp({ request: post('https://williwolff.com/mcp', call, { 'cf-connecting-ip': '203.0.113.7' }), env });
    const answer = await viaMcp.json();
    assert.equal(answer.result.isError, true);
    assert.match(answer.result.content[0].text, /rate_limited/);
    assert.equal(sent.length, 7);
});

test('the daily cap counts everyone, and both caps lift when their time is up', async () => {
    const tight = { ...env, BRIEF_LIMIT_PER_DAY: '2' };
    assert.equal((await enquiry({ request: from('198.51.100.1'), env: tight })).status, 200);
    assert.equal((await enquiry({ request: from('198.51.100.2'), env: tight })).status, 200);
    const third = await enquiry({ request: from('198.51.100.3'), env: tight });
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get('retry-after')) <= 86400);
    assert.equal(sent.length, 2);

    forgetBriefCounts();
    const noon = Date.UTC(2026, 10, 20, 12, 0, 0);
    for (let i = 0; i < 5; i += 1) assert.equal(overLimit({}, '192.0.2.1', noon), 0);
    assert.equal(overLimit({}, '192.0.2.1', noon + 59 * 60 * 1000), 60, 'one minute left in the hour');
    assert.equal(overLimit({}, '192.0.2.1', noon + 60 * 60 * 1000), 0, 'the next hour starts from zero');
    // A hundred different visitors use up the day.
    forgetBriefCounts();
    for (let i = 0; i < 100; i += 1) assert.equal(overLimit({}, '192.0.2.' + i, noon), 0);
    assert.equal(overLimit({}, '192.0.3.1', noon), 12 * 3600);
    assert.equal(overLimit({}, '192.0.3.1', noon + 12 * 3600 * 1000), 0);
});

test('the site shows one address everywhere, and briefs go there unless told otherwise', async () => {
    const files = (function walk(dir) {
        return readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]);
    })(dist).filter(file => /\.(html|js|json|md|txt|xml)$/.test(file));
    assert.ok(files.length > 30);
    for (const file of files) {
        const others = (readFileSync(file, 'utf8').match(/[\w.+-]+@williwolff\.com/g) || []).filter(address => address !== SITE_ADDRESS);
        assert.deepEqual(others, [], file.slice(dist.length));
    }
    assert.equal(SITE_ADDRESS, 'contact@williwolff.com');
    assert.equal(JSON.parse(readFileSync(join(dist, 'hire.json'), 'utf8')).contact.email, SITE_ADDRESS);
    assert.match(readFileSync(join(dist, 'index.html'), 'utf8'), /href="mailto:contact@williwolff\.com"/);

    // An address set for the Pages project wins for briefs.
    await enquiry({ request: post('https://williwolff.com/api/enquiry', brief), env: { ...env, CONTACT_TO_EMAIL: 'someone+site@example.org' } });
    assert.deepEqual(sent[0].body.to, [{ email: 'someone+site@example.org' }]);
});

test('with a Cloudflare token the brief is sent through Cloudflare, not Brevo', async () => {
    const cloudflare = { ...env, CLOUDFLARE_EMAIL_TOKEN: 'cf-token', CLOUDFLARE_ACCOUNT_ID: 'acc123', CONTACT_TO_EMAIL: 'inbox@example.org' };
    const response = await enquiry({ request: post('https://williwolff.com/api/enquiry', { ...brief, name: 'Ada' }), env: cloudflare });
    assert.equal(response.status, 200);
    assert.match((await response.json()).reference, /^WW-[0-9A-F]{8}$/);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].url, 'https://api.cloudflare.com/client/v4/accounts/acc123/email/sending/send');
    assert.equal(sent[0].headers.Authorization, 'Bearer cf-token');
    assert.equal(sent[0].headers['api-key'], undefined);
    assert.equal(sent[0].body.to, 'inbox@example.org');
    assert.deepEqual(sent[0].body.from, { address: 'contact@williwolff.com', name: 'williwolff.com' });
    assert.equal(sent[0].body.reply_to, 'ada@example.com');
    assert.match(sent[0].body.subject, /^\[williwolff\.com\] Brief WW-/);
    assert.match(sent[0].body.text, /Extract figures/);

    // Accepted by the API but bounced, or refused: the visitor is told, with the address to use instead.
    cloudflareAnswer = to => ({ success: true, errors: [], messages: [], result: { delivered: [], permanent_bounces: [to], queued: [] } });
    const bounced = await enquiry({ request: post('https://williwolff.com/api/enquiry', brief), env: cloudflare });
    assert.equal(bounced.status, 503);
    assert.equal((await bounced.json()).code, 'delivery_failed');
    cloudflareAnswer = () => ({ success: false, errors: [{ code: 10000, message: 'Authentication error' }], result: null });
    assert.equal((await enquiry({ request: post('https://williwolff.com/api/enquiry', brief), env: cloudflare })).status, 503);

    // Half a configuration is not one: without the account id, Brevo is used.
    sent = [];
    await enquiry({ request: post('https://williwolff.com/api/enquiry', brief), env: { ...env, CLOUDFLARE_EMAIL_TOKEN: 'cf-token' } });
    assert.equal(sent[0].url, 'https://api.brevo.com/v3/smtp/email');
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

test('MCP sends one brief per request, whatever the batch holds', async () => {
    const call = id => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'submit_enquiry', arguments: brief } });
    const batch = await mcp({ request: post('https://williwolff.com/mcp', [call(1), call(2), call(3)]), env });
    const answers = await batch.json();
    assert.deepEqual(answers.map(a => a.result.isError), [false, true, true]);
    assert.equal(sent.length, 1);
    const tooMany = await mcp({ request: post('https://williwolff.com/mcp', Array.from({ length: 21 }, (_, i) => ({ jsonrpc: '2.0', id: i, method: 'ping' }))), env });
    assert.equal(tooMany.status, 400);
    const huge = await mcp({ request: post('https://williwolff.com/mcp', { jsonrpc: '2.0', id: 1, method: 'ping', params: { pad: 'x'.repeat(40000) } }), env });
    assert.equal(huge.status, 413);
    assert.equal(sent.length, 1);
});

test('MCP refuses what a web page on another site could send', async () => {
    const call = { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'submit_enquiry', arguments: brief } };
    const plain = await mcp({ request: new Request('https://williwolff.com/mcp', { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(call) }), env });
    assert.equal(plain.status, 415);
    const foreign = await mcp({ request: post('https://williwolff.com/mcp', call, { origin: 'https://evil.example' }), env });
    assert.equal(foreign.status, 403);
    assert.equal(sent.length, 0);
    const own = await mcp({ request: post('https://williwolff.com/mcp', call, { origin: 'https://williwolff.com' }), env });
    assert.equal(own.status, 200);
    assert.equal(sent.length, 1);
});

test('MCP lets a brief be corrected in the same request', async () => {
    const call = (id, args) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'submit_enquiry', arguments: args } });
    const batch = await mcp({ request: post('https://williwolff.com/mcp', [call(1, { summary: 'no address given here' }), call(2, brief), call(3, brief)]), env });
    assert.deepEqual((await batch.json()).map(a => a.result.isError), [true, false, true]);
    assert.equal(sent.length, 1);
});

test('MCP answers malformed messages and odd arguments with an error, not a crash', async () => {
    for (const body of ['null', '[null]', '42', '"hi"']) {
        const response = await mcp({ request: post('https://williwolff.com/mcp', body), env });
        const answer = [].concat(await response.json())[0];
        assert.equal(answer.error.code, -32600, body);
    }
    const odd = await rpc('tools/call', { name: 'get_cv', arguments: { language: 'constructor', format: 'name' } });
    assert.equal(odd.body.result.isError, true);
    assert.match(odd.body.result.content[0].text, /language must be/);
});

test('MCP errors: unknown method, unknown tool, GET', async () => {
    assert.equal((await rpc('resources/list')).body.error.code, -32601);
    assert.equal((await rpc('tools/call', { name: 'delete_everything' })).body.error.code, -32602);
    const get = await mcp({ request: new Request('https://williwolff.com/mcp'), env });
    assert.equal(get.status, 405);
});

// --- published facts agree --------------------------------------------------------

test('the rate is the same on the page, in llms.txt and in hire.json', () => {
    const terms = JSON.parse(file('/hire.json'));
    const { from, to } = terms.rate;
    assert.match(file('/llms.txt'), new RegExp(from + ' to ' + to + ' EUR per hour'));
    assert.match(file('/'), new RegExp(from + ' to ' + to + ' EUR per hour'));
    assert.match(file('/de/'), new RegExp(from + ' bis ' + to + ' EUR pro Stunde'));
    // The range is typed by hand in a few places. Every mention, on every page
    // and in every Markdown twin, has to be the one in hire.json.
    const texts = pages.concat(subpages.map(p => p.slice(0, -1) + '.md'), ['/llms.txt', '/404.html']);
    for (const path of texts) {
        for (const [found, low, high] of file(path).matchAll(/(\d+) (?:to|bis) (\d+) EUR/g)) {
            assert.deepEqual([Number(low), Number(high)], [from, to], `${path} says "${found}"`);
        }
    }
    // The home pages and the service pages each carry the price as structured data.
    for (const path of pages.filter(p => p === '/' || p === '/de/' || /\/(services|leistungen)\//.test(p))) {
        const page = file(path);
        assert.match(page, new RegExp('"minPrice":\\s*' + from + '\\b'), path);
        assert.match(page, new RegExp('"maxPrice":\\s*' + to + '\\b'), path);
        assert.doesNotMatch(page, /From \d+ EUR per hour|Ab \d+ EUR pro Stunde/, path);
    }
});

test('the generated CV files match their Typst sources', async () => {
    const { execFileSync } = await import('node:child_process');
    execFileSync('node', ['scripts/build-cv-data.mjs', '--check'], { cwd: root });
});

test('the technologies recruiters search for are named where they look', () => {
    const wanted = ['React', 'React Native', 'TypeScript', 'JavaScript', 'Rust', 'Flutter', 'Swift', 'Java', 'Next.js', 'Kotlin', 'Node.js', 'PostgreSQL'];
    const word = name => new RegExp('(^|[^\\w.])' + name.replace(/[.]/g, '\\.') + '($|[^\\w.])');

    // The home page, in both languages, as visible text.
    for (const page of ['index.html', 'de/index.html']) {
        const text = readFileSync(join(dist, page), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
        for (const name of wanted) assert.match(text, word(name), page + ' names ' + name);
    }
    // Each kind of work names its own stack on the home page.
    assert.equal((readFileSync(join(dist, 'index.html'), 'utf8').match(/class="lane-stack"/g) || []).length, 4);

    // Structured data, the hiring summary and the profile for agents.
    const home = readFileSync(join(dist, 'index.html'), 'utf8');
    const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const person = (graph['@graph'] || [graph]).find(node => node['@type'] === 'Person');
    const skills = Object.values(JSON.parse(readFileSync(join(dist, 'hire.json'), 'utf8')).skills).flat().join(', ');
    const profile = readFileSync(join(dist, 'llms.txt'), 'utf8');
    for (const name of wanted) {
        assert.ok(person.knowsAbout.includes(name), 'knowsAbout has ' + name);
        assert.match(skills, word(name), 'hire.json names ' + name);
        assert.match(profile, word(name), 'llms.txt names ' + name);
    }

    // Every service page carries a Stack line, in the page and in its Markdown twin.
    const services = readdirSync(join(dist, 'services'));
    assert.equal(services.filter(name => !name.endsWith('.md')).length, 4);
    for (const name of services) {
        const file = name.endsWith('.md') ? join(dist, 'services', name) : join(dist, 'services', name, 'index.html');
        assert.match(readFileSync(file, 'utf8'), name.endsWith('.md') ? /\*\*Stack:\*\* \w/ : /<dt>Stack<\/dt><dd>\w/, name);
    }
});

test('every page has its own title, description and link preview image', () => {
    const pages = (function walk(dir) {
        return readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]);
    })(dist).filter(file => file.endsWith('index.html'));
    assert.equal(pages.length, 20);
    const cards = JSON.parse(readFileSync(join(dist, 'og', 'cards.json'), 'utf8'));
    const lock = JSON.parse(readFileSync(join(root, 'scripts', 'previews.lock.json'), 'utf8'));
    const plain = text => text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const meta = (html, name) => (html.match(new RegExp('<meta (?:name|property)="' + name + '" content="([^"]*)"')) || [])[1];

    const seen = { title: new Map(), description: new Map(), image: new Map() };
    for (const file of pages) {
        const html = readFileSync(file, 'utf8');
        const name = file.slice(dist.length);
        const isHome = /^\/(de\/)?index\.html$/.test(name);
        const title = plain(html.match(/<title>([^<]*)<\/title>/)[1]);
        const description = plain(meta(html, 'description'));

        // Search results cut titles at about 65 characters and descriptions at about 160.
        assert.ok(title.length >= 30 && title.length <= 65, name + ' title has ' + title.length + ' characters');
        assert.ok(description.length >= 110 && description.length <= 160, name + ' description has ' + description.length + ' characters');
        assert.equal(plain(meta(html, 'og:title')), title, name);
        assert.equal(plain(meta(html, 'og:description')), description, name);
        assert.equal(plain(meta(html, 'twitter:title')), title, name);
        assert.equal(meta(html, 'og:url'), html.match(/<link rel="canonical" href="([^"]*)"/)[1], name);
        assert.equal(meta(html, 'twitter:card'), 'summary_large_image', name);

        // The image belongs to this page: its language on a home page, its own card elsewhere.
        const image = meta(html, 'og:image');
        assert.equal(meta(html, 'twitter:image'), image, name);
        const card = cards.find(entry => 'https://williwolff.com' + entry.image === image);
        assert.ok(card, name + ' shows an image that is not a card: ' + image);
        assert.equal(card.lang, html.match(/<html lang="(\w+)"/)[1], name + ' image language');
        assert.equal(card.kind === 'home', isHome, name + ' image kind');
        assert.equal(plain(meta(html, 'og:image:alt')), card.alt, name);
        if (!isHome) assert.ok(plain(html).includes(card.title), name + ' card title is the page title');
        assert.equal(meta(html, 'og:type'), card.kind === 'work' ? 'article' : 'website', name);
        if (card.kind === 'work') assert.match(meta(html, 'article:modified_time'), /^\d{4}-\d\d-\d\dT/, name);

        for (const [kind, value] of [['title', title], ['description', description], ['image', image]]) {
            assert.ok(!seen[kind].has(value), name + ' shares its ' + kind + ' with ' + seen[kind].get(value));
            seen[kind].set(value, name);
        }
    }

    // Each image exists at 1200 x 630, stays light enough for messengers, and was
    // drawn from what the page says today. Run `npm run previews` when this fails.
    assert.equal(cards.length, 20);
    assert.deepEqual(Object.keys(lock).sort(), cards.map(card => card.image).sort());
    for (const card of cards) {
        const png = readFileSync(join(dist, card.image));
        assert.equal(png.toString('latin1', 1, 4), 'PNG', card.image);
        assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], card.image + ' size');
        assert.ok(png.length < 300 * 1024, card.image + ' is ' + Math.round(png.length / 1024) + ' KB');
        assert.equal(lock[card.image], cardHash(card), card.image + ' is out of date: run `npm run previews`');
    }
    assert.deepEqual(readdirSync(join(dist, 'og')).filter(file => file.endsWith('.png')).length, 18);
});

// Will went through the audit's before and after pictures on 2026-11-21 and chose per
// section. The first screen and the career section keep their earlier look (small
// capital labels, middle dots, the brighter button); the rest follows the audit.
test('the design holds the rules of the November 2026 audit', () => {
    const css = readFileSync(join(root, 'src', 'styles', 'site.css'), 'utf8');

    // Capitals with spread letters stay on two labels only: the small label of the first
    // screen and of the career section, and "Building now".
    assert.equal((css.match(/text-transform:\s*uppercase/g) || []).length, 2);
    assert.match(css, /\.section-kicker \{[^}]*text-transform: uppercase/);
    assert.match(css, /\.now-label \{[^}]*text-transform: uppercase/);
    for (const [, em] of css.matchAll(/letter-spacing:\s*(-?[\d.]+)em/g)) assert.ok(Number(em) <= 0.06, 'letter-spacing ' + em + 'em');
    // No text under 11px.
    for (const [, rem] of css.matchAll(/font-size:\s*([\d.]+)rem/g)) assert.ok(Number(rem) >= 0.7, 'font-size ' + rem + 'rem');
    // Motion names what it moves, and stops for a visitor who asked for less.
    assert.doesNotMatch(css, /transition:\s*all|transition:[^;]*\b(?:max-)?(?:width|height|top|left)\b/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\*, \*::before, \*::after \{/);
    // Fonts come from the tokens, and no page scrolls sideways.
    for (const [, value] of css.matchAll(/font-family:\s*([^;]+);/g)) assert.match(value, /^var\(--font-|^inherit$/, 'font-family ' + value);
    assert.match(css, /html, body \{ overflow-x: clip; \}/);

    // Contrast, worked out from the tokens: the edge of a field 3:1 in both palettes, button
    // text 4.5:1 in dark. In light Will chose the brand teal for buttons, which is 3.7:1.
    const token = (block, name) => block.match(new RegExp(name + ':\\s*(#[0-9a-f]{6})', 'i'))[1];
    const luminance = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
    const light = css.slice(css.indexOf(':root {'), css.indexOf('\n}'));
    const dark = css.slice(css.indexOf('\n:root[data-theme="dark"] {'));
    for (const [name, palette] of [['light', light], ['dark', dark]]) {
        for (const fill of ['--action', '--action-hover']) {
            assert.ok(contrast(token(palette, '--brand-ink'), token(palette, fill)) >= (name === 'light' ? 3.7 : 4.5), name + ' button text on ' + fill);
        }
        assert.ok(contrast(token(palette, '--field-edge'), token(palette, '--bg')) >= 3, name + ' field edge');
        assert.ok(contrast(token(palette, '--brand'), token(palette, '--bg')) >= 3, name + ' focus ring');
    }
    assert.match(css, /\.btn-primary \{\s*background: var\(--action\);/);

    for (const path of pages) {
        const html = file(path).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
            .replace(/<section id="experience"[\s\S]*?<\/section>/, '');
        // Outside the career section, facts are joined by words, commas and layout. The one
        // dot left is the byline on the home page.
        const dots = (html.replace(/<[^>]+>/g, '').match(/·/g) || []).length;
        assert.ok(dots <= 1, path + ' joins text with ' + dots + ' middle dots');
        // An icon is hidden from screen readers or named.
        for (const [svg] of html.matchAll(/<svg\b[^>]*>/g)) assert.match(svg, /aria-hidden="true"|aria-label=|style="display:\s*none/, path + ' ' + svg.slice(0, 80));
        // Scripts say they run before the page is drawn, so nothing is collapsed without them.
        assert.match(file(path).slice(0, file(path).indexOf('</head>')), /classList\.add\('js'\)/, path);
    }
    // A role in the career section opens with a real button, and is open when scripts do not run.
    for (const path of ['/', '/de/']) {
        const toggles = file(path).match(/<button type="button" class="job-toggle" aria-expanded="false">/g) || [];
        assert.equal(toggles.length, 9, path);
    }
    assert.match(css, /\.js \.job-content \{[^}]*visibility: hidden/);
});

// The form's dropdowns, fields and buttons move after transitions.dev (November 2026).
test('the form keeps its fallback without scripts and its motion rules', () => {
    const css = readFileSync(join(root, 'src', 'styles', 'site.css'), 'utf8');
    const js = readFileSync(join(root, 'public', 'js', 'brief.js'), 'utf8');
    for (const path of ['/', '/de/']) {
        const html = file(path);
        // Each select stays in the page, in a wrapper with its own arrow, so it holds the
        // value and looks like the other fields when the script does not run.
        assert.equal((html.match(/<div class="select">\s*<select [^>]*>[\s\S]*?<\/select>\s*<svg class="select-chevron"/g) || []).length, 3, path);
        // The script changes the text of these two labels, so each is a single piece of text.
        assert.match(html, /<span class="t-text-swap" id="brief-send-label">[^<]+<\/span>/, path);
        assert.match(html, /<span class="t-text-swap" id="brief-copy-label">[^<]+<\/span>/, path);
        assert.match(html, /<p class="brief-status t-panel-slide" id="brief-status" data-open="false" role="status"/, path);
        // The confirmation that takes the form's place is in the page, hidden until a brief
        // has gone out, with the reference and a button to copy it.
        const sent = html.match(/<div class="sent t-panel-slide" id="brief-sent"[^>]*>[\s\S]*?<div class="back"/);
        assert.ok(sent, path + ' has the sent confirmation');
        assert.match(sent[0], /^<div[^>]* hidden>/, path);
        assert.match(sent[0], /<code id="brief-sent-code"><\/code>\s*<button type="button" class="sent-copy" id="brief-sent-copy">/, path);
        assert.match(sent[0], /<b data-sent-email><\/b>/, path);
        assert.match(sent[0], path === '/de/' ? /Anfrage erhalten\.[\s\S]*Weitere Anfrage senden/ : /Brief received\.[\s\S]*Send another brief/, path);
    }
    assert.match(css, /\.sent\[hidden\] \{ display: none; \}/);
    assert.match(css, /\.is-sent > \.section-head,\s*\.is-sent > \.brief \{ display: none; \}/);
    assert.match(css, /\.select\.is-enhanced select \{ display: none; \}/);
    assert.match(css, /\.field select \{[^}]*appearance: none/);
    // Every transition taken from transitions.dev keeps its own rule for less motion.
    for (const hook of ['t-dropdown', 't-input', 't-text-swap', 't-success-check', 't-panel-slide']) {
        assert.match(css, new RegExp('@media \\(prefers-reduced-motion: reduce\\) \\{\\s*\\.' + hook + ' \\{'), hook);
    }
    // The script waits as long as the sheet animates: it reads these, and they are plain milliseconds.
    for (const name of ['--dropdown-close-dur', '--text-swap-dur', '--shake-dur-a', '--shake-dur-b', '--revert-dur']) {
        assert.match(css, new RegExp(name + ': \\d+ms;'), name);
        assert.ok(js.includes("ms('" + name + "'"), name + ' is read by brief.js');
    }
});

test('the dark palette is complete and every page carries the switch', () => {
    const css = readFileSync(join(root, 'src', 'styles', 'site.css'), 'utf8');
    const declarations = block => block.split('\n').map(line => line.trim()).filter(line => /^(--[\w-]+|color-scheme):/.test(line));
    const between = (start, end) => css.slice(css.indexOf(start) + start.length, css.indexOf(end, css.indexOf(start)));

    // Plain CSS cannot share the list, so it exists twice: for a dark device and for a visitor who chose dark.
    const device = declarations(between(':root:not([data-theme="light"]) {', '}'));
    const chosen = declarations(between('\n:root[data-theme="dark"] {', '}'));
    assert.ok(device.length >= 20, 'dark palette has ' + device.length + ' entries');
    assert.deepEqual(device, chosen);

    // Every colour token of the light palette has a dark value, except the logo plate, which stays white.
    const light = declarations(between(':root {', '\n}')).map(line => line.split(':')[0]);
    const colours = declarations(between(':root {', '\n}')).filter(line => /#[0-9a-f]{3,8}\b|rgba?\(/i.test(line)).map(line => line.split(':')[0]);
    const dark = device.map(line => line.split(':')[0]);
    assert.deepEqual(colours.filter(name => !dark.includes(name)), ['--plate']);
    assert.deepEqual(dark.filter(name => !light.includes(name)), []);

    // Nothing outside the palettes names a colour, so no rule can stay light on a dark page.
    const rest = css.slice(css.indexOf('*, *::before, *::after'), css.indexOf('@media print'));
    assert.deepEqual(rest.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi) || [], []);

    for (const page of ['index.html', 'de/index.html', 'services/web-mobile-products/index.html', 'de/projekte/alwayssandy/index.html', '404.html']) {
        const html = readFileSync(join(dist, page), 'utf8');
        assert.match(html, /<meta name="color-scheme" content="light dark">/, page);
        // The stored choice is applied in the head, before the page is drawn.
        const head = html.slice(0, html.indexOf('</head>'));
        assert.match(head, /localStorage\.getItem\('theme'\)/, page);
        // The switch waits hidden for its script, and says what a click does in the page's language.
        const button = html.match(/<button[^>]*id="theme-toggle"[^>]*>/)[0];
        assert.match(button, / hidden /, page);
        assert.match(button, page.startsWith('de/') ? /aria-label="Zum dunklen Design wechseln"/ : /aria-label="Switch to the dark theme"/, page);
        assert.match(html, /getElementById\('theme-toggle'\)/, page);
    }
});

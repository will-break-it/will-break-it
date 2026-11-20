// Builds the text and data versions of the CV from the Typst sources, so the
// PDF, the Markdown and the JSON can never say different things.
//
//   master-cv.typ     -> cv.md,    cv.json     (English)
//   master-cv-de.typ  -> cv.de.md, cv.de.json  (German)
//
// The JSON follows the JSON Resume schema (https://jsonresume.org/schema).
// Run with `node scripts/build-cv-data.mjs`; `--check` exits 1 if the committed
// files are stale. The deploy workflow runs it before publishing.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://williwolff.com';

const LANGS = {
    en: {
        source: 'master-cv.typ',
        md: 'cv.md',
        json: 'cv.json',
        pdf: 'willi-wolff-cv-en.pdf',
        label: 'Software Engineer & Architect',
        place: 'Berlin, Germany',
        spoken: [{ language: 'German' }, { language: 'English' }],
        spokenLine: 'German and English',
        present: 'Present',
        otherFormats: 'Other formats',
        updated: 'Last updated',
        months: { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 },
    },
    de: {
        source: 'master-cv-de.typ',
        md: 'cv.de.md',
        json: 'cv.de.json',
        pdf: 'willi-wolff-cv-de.pdf',
        label: 'Software Engineer & Architekt',
        place: 'Berlin, Deutschland',
        spoken: [{ language: 'Deutsch' }, { language: 'Englisch' }],
        spokenLine: 'Deutsch und Englisch',
        present: 'Heute',
        otherFormats: 'Weitere Formate',
        updated: 'Stand',
        months: { jan: 1, feb: 2, 'mär': 3, mrz: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12 },
    },
};

// --- Typst reading -----------------------------------------------------------

// Returns the text between the bracket at `start` and its partner, plus the
// index just past the partner. Brackets inside string literals do not count.
function balanced(src, start) {
    const open = src[start];
    const close = { '(': ')', '[': ']' }[open];
    let depth = 0;
    let inString = false;
    for (let i = start; i < src.length; i++) {
        const ch = src[i];
        if (inString) {
            if (ch === '\\') i++;
            else if (ch === '"') inString = false;
            continue;
        }
        if (ch === '"') inString = true;
        else if (ch === open) depth++;
        else if (ch === close && --depth === 0) return { inner: src.slice(start + 1, i), end: i + 1 };
    }
    throw new Error('Unbalanced ' + open + ' at offset ' + start);
}

function splitArgs(args) {
    const out = [];
    let depth = 0;
    let inString = false;
    let current = '';
    for (let i = 0; i < args.length; i++) {
        const ch = args[i];
        if (inString) {
            current += ch;
            if (ch === '\\') current += args[++i];
            else if (ch === '"') inString = false;
            continue;
        }
        if (ch === '"') inString = true;
        if (ch === '(' || ch === '[') depth++;
        if (ch === ')' || ch === ']') depth--;
        if (ch === ',' && depth === 0) {
            out.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) out.push(current.trim());
    return out;
}

// An argument is a string literal, a content block, or a bare `link(...)[...]`.
function argToMarkup(arg) {
    if (arg.startsWith('"')) return JSON.parse(arg);
    if (arg.startsWith('[')) return arg.slice(1, -1);
    return '#' + arg;
}

// Typst markup to Markdown: links and bold survive, styling goes.
function toMd(markup) {
    let s = markup;
    let before;
    do {
        before = s;
        s = s
            .replace(/#text\((?:[^()"]|"[^"]*")*\)\[([^\[\]]*)\]/g, '$1')
            .replace(/#link\("([^"]*)"\)\[([^\[\]]*)\]/g, '[$2]($1)')
            .replace(/#box\[([^\[\]]*)\]/g, '$1');
    } while (s !== before);
    return s
        .replace(/#linebreak\(\)/g, ' ')
        .replace(/#v\([^)]*\)/g, ' ')
        .replace(/\\@/g, '@')
        .replace(/\*([^*\n]+)\*/g, '**$1**')
        .replace(/\s+/g, ' ')
        .trim();
}

const toText = md => md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '');
const firstLink = md => (md.match(/\[([^\]]*)\]\(([^)]*)\)/) || []).slice(1);

function parseEntries(body) {
    const entries = [];
    let at = 0;
    for (;;) {
        const i = body.indexOf('#exp(', at);
        if (i === -1) break;
        const args = balanced(body, i + 4);
        const content = balanced(body, body.indexOf('[', args.end));
        const [title, date, org] = splitArgs(args.inner).map(argToMarkup);
        const cut = content.inner.search(/#b\[|#v\(/);
        const summary = toMd(cut === -1 ? content.inner : content.inner.slice(0, cut));
        const highlights = [];
        let b = 0;
        for (;;) {
            const j = content.inner.indexOf('#b[', b);
            if (j === -1) break;
            const item = balanced(content.inner, j + 2);
            highlights.push(toMd(item.inner));
            b = item.end;
        }
        entries.push({ title: toMd(title), date: toMd(date), org: toMd(org), summary, highlights });
        at = content.end;
    }
    return entries;
}

function parseCv(src) {
    const marks = [...src.matchAll(/^#section\("([^"]+)"\)/gm)];
    if (marks.length !== 6) {
        throw new Error('Expected six sections (profile, experience, publications, projects, technologies, education), found ' + marks.length);
    }
    const sections = marks.map((m, n) => ({
        title: m[1],
        body: src.slice(m.index + m[0].length, n + 1 < marks.length ? marks[n + 1].index : src.length),
    }));
    const [profile, experience, publications, projects, technologies, education] = sections;

    const tagline = toMd((src.match(/#text\(size: 10pt, fill: muted\)\[([^\]]*)\]/) || [])[1] || '');
    const skills = [...technologies.body.matchAll(/skill\("([^"]*)",\s*"([^"]*)"\)/g)].map(m => ({ name: m[1], keywords: m[2].split(/,\s*/) }));
    const degrees = [...education.body.matchAll(/\[\*([^*]+)\*\s*·\s*#text\(fill: muted\)\[([^\]]*)\]\],\s*text\(fill: muted\)\[([^\]]*)\]/g)]
        .map(m => ({ degree: m[1].trim(), school: m[2].trim(), years: m[3].trim() }));
    if (!skills.length || !degrees.length) throw new Error('Could not read the technologies or education section');

    return {
        tagline,
        titles: sections.map(s => s.title),
        profile: toMd(profile.body),
        experience: parseEntries(experience.body),
        publications: parseEntries(publications.body),
        projects: parseEntries(projects.body),
        skills,
        degrees,
    };
}

// --- dates ---------------------------------------------------------------------

// "Oct 2026 – Present" -> { start: "2026-10" }; "2023 – 2025" -> { start: "2023", end: "2025" }.
function parseRange(range, lang) {
    const point = raw => {
        const s = raw.trim();
        if (!s || s === lang.present) return undefined;
        const m = s.match(/^(?:(\S+)\s+)?(\d{4})$/);
        if (!m) throw new Error('Unreadable date: ' + raw);
        if (!m[1]) return m[2];
        const month = lang.months[m[1].toLowerCase().replace('.', '')];
        if (!month) throw new Error('Unknown month: ' + m[1]);
        return m[2] + '-' + String(month).padStart(2, '0');
    };
    const [from, to] = range.split(/\s+[–-]\s+/);
    const start = point(from);
    return to === undefined ? { start, end: start } : { start, end: point(to) };
}

const drop = obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)));

// --- outputs -------------------------------------------------------------------

function toJsonResume(cv, code, lang, modified) {
    const org = entry => {
        const [label, url] = firstLink(entry.org);
        const plain = toText(entry.org);
        const [head, note] = plain.split(' · ');
        const name = (label && !label.includes(',') ? label : head).trim();
        const comma = name === head.trim() ? head.indexOf(', ') : -1;
        return {
            name: comma === -1 ? name : head.slice(0, comma),
            location: comma === -1 ? undefined : head.slice(comma + 2),
            url,
            note,
        };
    };
    return {
        $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
        basics: {
            name: 'Willi Wolff',
            label: lang.label,
            image: SITE + '/assets/images/will.jpg',
            email: 'contact@williwolff.com',
            url: SITE + '/',
            summary: toText(cv.profile),
            location: { city: 'Berlin', countryCode: 'DE' },
            profiles: [
                { network: 'GitHub', username: 'will-break-it', url: 'https://github.com/will-break-it' },
                { network: 'LinkedIn', username: 'wwolff', url: 'https://linkedin.com/in/wwolff' },
                { network: 'X', username: 'will_break_it', url: 'https://x.com/will_break_it' },
            ],
        },
        work: cv.experience.map(e => {
            const o = org(e);
            const { start, end } = parseRange(e.date, lang);
            return drop({
                name: o.name,
                position: toText(e.title),
                url: o.url,
                location: o.location,
                description: o.note,
                startDate: start,
                endDate: end,
                summary: toText(e.summary),
                highlights: e.highlights.map(toText),
            });
        }),
        education: cv.degrees.map(d => {
            const [studyType, ...area] = d.degree.split(' ');
            const [start, end] = d.years.split(/\s+[–-]\s+/);
            return { institution: d.school, studyType, area: area.join(' '), startDate: start, endDate: end };
        }),
        publications: cv.publications.map(p => drop({
            name: toText(p.title),
            publisher: toText(p.org),
            releaseDate: p.date,
            url: firstLink(p.summary)[1],
            summary: toText(p.summary),
        })),
        projects: cv.projects.map(p => {
            const { start, end } = parseRange(p.date, lang);
            return drop({
                name: toText(p.title),
                description: toText(p.summary),
                highlights: p.highlights.map(toText),
                startDate: start,
                endDate: end,
                url: firstLink(p.summary)[1] || firstLink(p.highlights.join(' '))[1],
                roles: [toText(p.org)],
            });
        }),
        skills: cv.skills,
        languages: lang.spoken,
        meta: {
            canonical: SITE + '/' + lang.json,
            version: 'v1.0.0',
            lastModified: modified,
            language: code,
        },
    };
}

function toMarkdown(cv, code, lang, modified) {
    const other = code === 'en' ? LANGS.de : LANGS.en;
    const lines = [
        '# Willi Wolff',
        '',
        cv.tagline,
        '',
        `${lang.place} · ${lang.spokenLine} · contact@williwolff.com · [williwolff.com](${SITE}/) · [LinkedIn](https://linkedin.com/in/wwolff) · [GitHub](https://github.com/will-break-it)`,
        '',
        `${lang.otherFormats}: [PDF](${SITE}/${lang.pdf}) · [JSON](${SITE}/${lang.json}) · [${code === 'en' ? 'Deutsch' : 'English'}](${SITE}/${other.md})`,
        '',
        `## ${cv.titles[0]}`,
        '',
        cv.profile,
        '',
    ];
    const block = (title, entries) => {
        lines.push(`## ${title}`, '');
        for (const e of entries) {
            lines.push(`### ${e.title}`, '', `${e.org} · ${e.date}`, '', e.summary, '');
            if (e.highlights.length) lines.push(...e.highlights.map(h => '- ' + h), '');
        }
    };
    block(cv.titles[1], cv.experience);
    block(cv.titles[2], cv.publications);
    block(cv.titles[3], cv.projects);
    lines.push(`## ${cv.titles[4]}`, '', ...cv.skills.map(s => `- **${s.name}:** ${s.keywords.join(', ')}`), '');
    lines.push(`## ${cv.titles[5]}`, '', ...cv.degrees.map(d => `- **${d.degree}** · ${d.school} · ${d.years}`), '');
    lines.push('---', '', `${lang.updated}: ${modified}`, '');
    return lines.join('\n');
}

// The date the source last changed, so a rebuild without edits is a no-op.
function lastModified(file) {
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim();
        if (out) return out;
    } catch { /* not a git checkout */ }
    return new Date().toISOString().slice(0, 10);
}

const check = process.argv.includes('--check');
let stale = false;

for (const [code, lang] of Object.entries(LANGS)) {
    const cv = parseCv(readFileSync(join(root, lang.source), 'utf8'));
    // A committed file keeps its date unless its content changed, so the
    // date means "the CV changed", not "the build ran".
    const previous = existsSync(join(root, lang.json)) ? JSON.parse(readFileSync(join(root, lang.json), 'utf8')) : null;
    const render = modified => ({
        [lang.json]: JSON.stringify(toJsonResume(cv, code, lang, modified), null, 2) + '\n',
        [lang.md]: toMarkdown(cv, code, lang, modified),
    });
    let outputs = previous?.meta?.lastModified ? render(previous.meta.lastModified) : null;
    const unchanged = outputs && Object.entries(outputs).every(([file, text]) => existsSync(join(root, file)) && readFileSync(join(root, file), 'utf8') === text);
    if (!unchanged) {
        outputs = render(lastModified(lang.source));
        stale = true;
        if (!check) {
            for (const [file, text] of Object.entries(outputs)) writeFileSync(join(root, file), text);
            console.log(`${lang.source} -> ${lang.md}, ${lang.json}`);
        } else {
            console.error(`${lang.md} or ${lang.json} is out of date with ${lang.source}`);
        }
    }
}

if (check && stale) process.exit(1);
if (!stale) console.log('CV data is up to date.');

// Service pages and case studies live as Markdown in src/content, one file
// per page and language: <key>.<lang>.md. This module reads them once and
// gives every page, the Markdown twins and the sitemap the same list.

import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';
import { type Lang, RATE, abs, home } from './site';

export type Kind = 'services' | 'work';

export interface Entry {
    kind: Kind;
    key: string;
    lang: Lang;
    slug: string;
    title: string;
    description: string;
    lead: string;
    order: number;
    updated: string;
    /** project_type preselected in the brief form */
    brief: string;
    facts: Record<string, string>;
    proof: { label: string; href: string }[];
    /** keys of related entries of the other kind */
    related: string[];
    body: string;
    html: string;
    path: string;
    markdownPath: string;
}

const BASE: Record<Kind, Record<Lang, string>> = {
    services: { en: '/services/', de: '/de/leistungen/' },
    work: { en: '/work/', de: '/de/projekte/' },
};

const files = import.meta.glob('../content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function read(file: string, raw: string): Entry {
    const match = file.match(/content\/(services|work)\/([a-z0-9-]+)\.(en|de)\.md$/);
    if (!match) throw new Error(`Unexpected content file name: ${file}`);
    const [, kind, key, lang] = match as unknown as [string, Kind, string, Lang];
    const parts = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!parts) throw new Error(`${file} has no front matter`);
    const meta = parseYaml(parts[1]) ?? {};
    for (const field of ['slug', 'title', 'description', 'lead', 'updated']) {
        if (!meta[field]) throw new Error(`${file} is missing "${field}"`);
    }
    const body = parts[2].trim();
    const path = `${BASE[kind][lang]}${meta.slug}/`;
    return {
        kind, key, lang,
        slug: meta.slug,
        title: meta.title,
        description: meta.description,
        lead: meta.lead,
        order: meta.order ?? 99,
        updated: String(meta.updated),
        brief: meta.brief ?? 'other',
        facts: meta.facts ?? {},
        proof: meta.proof ?? [],
        related: meta.related ?? [],
        body,
        html: '', // rendered below, once links between entries can be resolved
        path,
        markdownPath: `${BASE[kind][lang]}${meta.slug}.md`,
    };
}

export const entries: Entry[] = Object.entries(files)
    .map(([file, raw]) => read(file, raw))
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

export const list = (kind: Kind, lang: Lang) => entries.filter(e => e.kind === kind && e.lang === lang);

export function find(kind: Kind, key: string, lang: Lang): Entry {
    const entry = entries.find(e => e.kind === kind && e.key === key && e.lang === lang);
    if (!entry) throw new Error(`No ${kind} entry "${key}" in ${lang}`);
    return entry;
}

// Every page exists in both languages; a missing translation fails the build.
for (const entry of entries) find(entry.kind, entry.key, entry.lang === 'en' ? 'de' : 'en');

/**
 * Replaces @work/<key> and @service/<key> with that page's URL in `lang`.
 * Used for the home page partials and for the Markdown bodies below.
 */
export function resolveLinks(text: string, lang: Lang, absolute = false): string {
    return text.replace(/@(work|service)\/([a-z0-9-]+)/g, (_, kind, key) => {
        const { path } = find(kind === 'service' ? 'services' : 'work', key, lang);
        return absolute ? abs(path) : path;
    });
}

// Bodies may link to other pages by key. This runs once every entry is known:
// site-relative links for the page, full URLs for the Markdown twin.
for (const entry of entries) {
    entry.html = marked.parse(resolveLinks(entry.body, entry.lang), { async: false }) as string;
    entry.body = resolveLinks(entry.body, entry.lang, true);
}

/** The page as plain Markdown, for agents: /work/<slug>.md and friends. */
export function toMarkdown(entry: Entry, labels: { facts: Record<string, string>; proof: string; similar: string; updated: string }): string {
    const lines = [`# ${entry.title}`, '', entry.lead, ''];
    const facts = Object.entries(entry.facts);
    if (facts.length) {
        for (const [name, value] of facts) lines.push(`- **${labels.facts[name] ?? name}:** ${value}`);
        lines.push('');
    }
    lines.push(entry.body, '');
    if (entry.proof.length) {
        lines.push(`## ${labels.proof}`, '');
        for (const link of entry.proof) lines.push(`- [${link.label}](${link.href})`);
        lines.push('');
    }
    const unit = entry.lang === 'de' ? `${RATE.from} bis ${RATE.to} EUR pro Stunde` : `${RATE.from} to ${RATE.to} EUR per hour`;
    lines.push(`## ${labels.similar}`, '');
    lines.push(entry.lang === 'de'
        ? `Willi Wolff, freiberuflicher Software Engineer und Architekt, Berlin. ${unit}. Anfrage: ${abs(home('de'))}#brief, als JSON an ${abs('/api/enquiry')} (project_type \`${entry.brief}\`), oder per E-Mail an contact@williwolff.com. Konditionen: ${abs('/hire.json')}.`
        : `Willi Wolff, freelance software engineer and architect, Berlin. ${unit}. Send a brief at ${abs('/')}#brief, as JSON to ${abs('/api/enquiry')} (project_type \`${entry.brief}\`), or by email to contact@williwolff.com. Terms: ${abs('/hire.json')}.`);
    lines.push('', '---', '', `${labels.updated}: ${entry.updated} · ${abs(entry.path)}`, '');
    return lines.join('\n');
}

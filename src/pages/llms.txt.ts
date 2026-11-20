// /llms.txt: the site for agents. The prose lives in src/data/llms.md; the
// list of service pages and case studies is filled in here, so a new page
// cannot be forgotten.
import type { APIRoute } from 'astro';
import source from '../data/llms.md?raw';
import { find, list } from '../lib/content';
import { abs } from '../lib/site';

const MARK = '<!-- pages -->';

function section(title: string, kind: 'services' | 'work') {
    const lines = list(kind, 'en').map(entry => {
        const german = find(kind, entry.key, 'de');
        return `- [${entry.title}](${abs(entry.markdownPath)}): ${entry.description} Page: ${abs(entry.path)} · German: ${abs(german.path)}`;
    });
    return `## ${title}\n\n${lines.join('\n')}`;
}

export const GET: APIRoute = () => {
    if (!source.includes(MARK)) throw new Error(`src/data/llms.md has lost its ${MARK} marker`);
    const pages = [
        section('Services', 'services'),
        section('Case studies', 'work'),
    ].join('\n\n');
    return new Response(source.replace(MARK, pages), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

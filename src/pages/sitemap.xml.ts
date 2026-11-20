// Every page with its language twin, then the documents and data files.
import type { APIRoute } from 'astro';
import { entries, find } from '../lib/content';
import { abs, home } from '../lib/site';
import cv from '../../public/cv.json';
import hire from '../../public/hire.json';

const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function page(path: string, lastmod: string, paths?: { en: string; de: string }) {
    const alternates = paths
        ? ['en', 'de'].map(l => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${xml(abs(paths[l as 'en' | 'de']))}"/>`).join('') +
          `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(abs(paths.en))}"/>`
        : '';
    return `  <url>\n    <loc>${xml(abs(path))}</loc>\n    <lastmod>${lastmod}</lastmod>${alternates}\n  </url>`;
}

export const GET: APIRoute = () => {
    const cvDate = (cv as { meta: { lastModified: string } }).meta.lastModified.slice(0, 10);
    const newest = entries.map(e => e.updated).concat(hire.updated).sort().at(-1)!;
    const homes = { en: home('en'), de: home('de') };
    const urls = [
        page(homes.en, newest, homes),
        page(homes.de, newest, homes),
        ...entries.map(e => page(e.path, e.updated, { en: find(e.kind, e.key, 'en').path, de: find(e.kind, e.key, 'de').path })),
        ...['/willi-wolff-cv-en.pdf', '/willi-wolff-cv-de.pdf', '/cv.md', '/cv.de.md', '/cv.json', '/cv.de.json'].map(p => page(p, cvDate)),
        page('/hire.json', hire.updated),
        page('/llms.txt', newest),
    ];
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
        { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
    );
};

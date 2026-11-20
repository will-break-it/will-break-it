// The home page sections in src/partials keep English and German side by
// side, as <span lang="en">…</span><span lang="de">…</span>. That keeps the
// two texts next to each other when editing. At build time each page keeps
// one language and drops the other, so a visitor and a search engine get a
// page in a single language.

import { parse } from 'node-html-parser';
import type { Lang } from './site';
import { resolveLinks } from './content';

export function localize(html: string, lang: Lang): string {
    // By default the parser keeps the inside of <noscript> as plain text. It
    // holds markup in both languages like everything else, so it is parsed too.
    const root = parse(html, { comment: true, blockTextElements: { script: true, style: true, pre: true } });
    for (const el of root.querySelectorAll('[lang]')) {
        const tagged = el.getAttribute('lang');
        if (tagged !== 'en' && tagged !== 'de') continue;
        if (tagged !== lang) {
            el.remove();
        } else if (el.tagName === 'SPAN' && Object.keys(el.attributes).length === 1) {
            el.replaceWith(...el.childNodes);
        } else {
            el.removeAttribute('lang');
        }
    }
    // Option labels and placeholders carry both languages as data attributes.
    // The form script sets them too; doing it here means the page is in the
    // right language before any script runs.
    for (const option of root.querySelectorAll(`option[data-${lang}]`)) {
        option.set_content(option.getAttribute(`data-${lang}`) ?? '');
    }
    for (const field of root.querySelectorAll(`[data-placeholder-${lang}]`)) {
        field.setAttribute('placeholder', field.getAttribute(`data-placeholder-${lang}`) ?? '');
    }
    return resolveLinks(root.toString(), lang);
}

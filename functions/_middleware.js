// Three jobs, all about who is asking and where they came from.
//
// 1. williwolff.com is the canonical host. Visitors and crawlers that still
//    arrive on the Pages default domain are sent there, path and query intact.
//    Preview deployments (<hash>.wwolff.pages.dev) are left alone.
//
// 2. German used to be `/?lang=de` on a single page. It now has its own URL,
//    so old links and bookmarks are redirected to `/de/`.
//
// 3. Every page has a second form for agents. The HTML carries navigation,
//    icons and scripts, which is noise to a model. An agent gets the same
//    facts as Markdown instead, when it asks for Markdown or announces itself
//    as an assistant fetching a page for a user: the text of /llms.txt for the
//    home page, and the page's own `.md` twin for service pages and case
//    studies.
//
//    Search and training crawlers are deliberately not on that list. They get
//    the HTML a person sees, so nothing here shows a search engine a different
//    page than its users.

const ORIGIN = 'https://williwolff.com';

// Fetchers that load a page because a person asked an assistant to read it.
const ASSISTANT_FETCHERS = /\b(ChatGPT-User|Claude-User|Perplexity-User|MistralAI-User|Meta-ExternalFetcher)\b/i;

// Service pages and case studies: /services/<slug>/ has a twin at /services/<slug>.md.
const SUBPAGE = /^\/(?:services|work|de\/leistungen|de\/projekte)\/[a-z0-9-]+\/?$/;

function wantsMarkdown(request, url) {
    const format = url.searchParams.get('format');
    if (format === 'html') return false;
    if (format === 'md' || format === 'markdown') return true;
    const accept = request.headers.get('accept') || '';
    if (/\btext\/markdown\b/i.test(accept)) return true;
    return ASSISTANT_FETCHERS.test(request.headers.get('user-agent') || '');
}

// Where the Markdown for a page lives, or null when the page has none.
function markdownSource(pathname) {
    const path = pathname.replace(/index\.html$/, '');
    // llms.txt exists in English only, so the German home page answers with
    // the English text and names the English page as its original.
    if (path === '/' || path === '/de/') return { source: '/llms.txt', canonical: '/', language: 'en' };
    if (SUBPAGE.test(path)) {
        const bare = path.replace(/\/$/, '');
        return { source: bare + '.md', canonical: bare + '/' };
    }
    return null;
}

export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);

    if (url.hostname === 'wwolff.pages.dev') {
        url.hostname = 'williwolff.com';
        return Response.redirect(url.toString(), 301);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return next();

    const isHome = url.pathname === '/' || url.pathname === '/index.html';
    if (isHome && url.searchParams.has('lang')) {
        const german = url.searchParams.get('lang') === 'de';
        url.searchParams.delete('lang');
        url.pathname = german ? '/de/' : '/';
        return Response.redirect(url.toString(), 301);
    }

    const page = markdownSource(url.pathname);
    if (!page) return next();

    if (wantsMarkdown(request, url)) {
        const source = await env.ASSETS.fetch(new Request(new URL(page.source, url)));
        if (source.ok) {
            return new Response(request.method === 'HEAD' ? null : source.body, {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'public, max-age=300',
                    'Vary': 'Accept, User-Agent',
                    'Link': `<${ORIGIN}${page.canonical}>; rel="canonical"`,
                    ...(page.language ? { 'Content-Language': page.language } : {}),
                    'X-Robots-Tag': 'noindex',
                },
            });
        }
    }

    // The same URL answers in two formats, so caches must key on who asked.
    const response = await next();
    const html = new Response(response.body, response);
    html.headers.append('Vary', 'Accept, User-Agent');
    return html;
}

// Two jobs, both about who is asking.
//
// 1. williwolff.com is the canonical host. Visitors and crawlers that still
//    arrive on the Pages default domain are sent there, path and query intact.
//    Preview deployments (<hash>.wwolff.pages.dev) are left alone.
//
// 2. The home page has a second form for agents. The HTML carries both
//    languages, a contribution grid and two hundred kilobytes of markup, which
//    is noise to a model. An agent gets the same facts as Markdown instead
//    (the text of /llms.txt), when it asks for Markdown or announces itself as
//    an assistant fetching a page for a user.
//
//    Search and training crawlers are deliberately not on that list. They get
//    the HTML a person sees, so nothing here shows a search engine a different
//    page than its users.

// Fetchers that load a page because a person asked an assistant to read it.
const ASSISTANT_FETCHERS = /\b(ChatGPT-User|Claude-User|Perplexity-User|MistralAI-User|Meta-ExternalFetcher)\b/i;

function wantsMarkdown(request, url) {
    const format = url.searchParams.get('format');
    if (format === 'html') return false;
    if (format === 'md' || format === 'markdown') return true;
    const accept = request.headers.get('accept') || '';
    if (/\btext\/markdown\b/i.test(accept)) return true;
    return ASSISTANT_FETCHERS.test(request.headers.get('user-agent') || '');
}

export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);

    if (url.hostname === 'wwolff.pages.dev') {
        url.hostname = 'williwolff.com';
        return Response.redirect(url.toString(), 301);
    }

    const isHome = url.pathname === '/' || url.pathname === '/index.html';
    if (!isHome || (request.method !== 'GET' && request.method !== 'HEAD')) return next();

    if (wantsMarkdown(request, url)) {
        const source = await env.ASSETS.fetch(new Request(new URL('/llms.txt', url)));
        if (source.ok) {
            return new Response(request.method === 'HEAD' ? null : source.body, {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'public, max-age=300',
                    'Vary': 'Accept, User-Agent',
                    'Link': '<https://williwolff.com/>; rel="canonical"',
                    'X-Robots-Tag': 'noindex',
                },
            });
        }
    }

    // The same URL answers in two formats, so caches must key on who asked.
    const response = await next();
    const page = new Response(response.body, response);
    page.headers.append('Vary', 'Accept, User-Agent');
    return page;
}

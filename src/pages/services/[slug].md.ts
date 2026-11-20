// The same page as Markdown, for agents: <slug>.md next to <slug>/.
import type { APIRoute } from 'astro';
import { list, toMarkdown } from '../../lib/content';
import { T } from '../../lib/site';

export function getStaticPaths() {
    return list('services', 'en').map(entry => ({ params: { slug: entry.slug }, props: { entry } }));
}

export const GET: APIRoute = ({ props }) => {
    const t = T['en'];
    return new Response(toMarkdown(props.entry, { facts: t.facts, proof: t.proof, similar: t.similar, updated: t.updated }), {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
};

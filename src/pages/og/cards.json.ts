// What every link preview image says, as data. scripts/build-previews.mjs
// reads this file from dist/ and draws one image per entry; the tests use it
// to tell when an image no longer matches its page.
import type { APIRoute } from 'astro';
import { cards } from '../../lib/previews';

export const GET: APIRoute = () =>
    new Response(JSON.stringify(cards(), null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });

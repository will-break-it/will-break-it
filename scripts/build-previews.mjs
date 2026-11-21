// Draws the link preview images: public/social-preview.png and .de.png for the
// home pages, public/og/*.png for every service page and case study.
//
//   npm run previews        (builds the site first, then draws)
//
// Needs the `playwright` package and its Chromium, which are not dependencies
// of the site:  npm install --no-save playwright && npx playwright install chromium
//
// What each image says comes from the built dist/og/cards.json, how it looks
// from scripts/preview-card.mjs. scripts/previews.lock.json records what each
// image was drawn from; `npm test` fails when a page and its image disagree.

import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardHash, cardHtml } from './preview-card.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const cardsFile = join(dist, 'og', 'cards.json');
if (!existsSync(cardsFile)) {
    console.error('dist/og/cards.json is missing. Run `npm run build` first, or use `npm run previews`.');
    process.exit(1);
}
const cards = JSON.parse(readFileSync(cardsFile, 'utf8'));

// The last 52 weeks of public/data/activity.json as levels 0 to 4, the way the page draws them.
function activityLevels() {
    const data = JSON.parse(readFileSync(join(root, 'public', 'data', 'activity.json'), 'utf8'));
    // data.days lists active days only, so walk the calendar instead.
    const byDate = new Map(data.days.map(day => [day.date, day.total]));
    const end = new Date(data.generated.slice(0, 10) + 'T00:00:00Z');
    const totals = [];
    for (let i = 363; i >= 0; i--) {
        totals.push(byDate.get(new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10)) || 0);
    }
    // Quartiles of the active days, so one busy day does not flatten the rest.
    const active = totals.filter(n => n > 0).sort((a, b) => a - b);
    const q = f => active[Math.min(active.length - 1, Math.floor(active.length * f))] || 1;
    return totals.map(n => (n === 0 ? 0 : n <= q(0.25) ? 1 : n <= q(0.5) ? 2 : n <= q(0.75) ? 3 : 4));
}

// The cards load the site's own font and portrait, so serve dist/ while drawing.
const TYPES = { '.html': 'text/html', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };
const server = createServer((request, response) => {
    const file = join(dist, normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname)));
    if (!file.startsWith(dist) || !existsSync(file)) return response.writeHead(404).end();
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const font = readdirSync(join(dist, '_astro')).find(name => /^inter-latin-wght-normal\..*\.woff2$/.test(name));
if (!font) throw new Error('The built site has no Inter latin font file in dist/_astro.');
const assets = { font: `/_astro/${font}`, photo: '/assets/images/will.jpg' };
const levels = activityLevels();

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`${origin}/404.html`);

rmSync(join(root, 'public', 'og'), { recursive: true, force: true });
mkdirSync(join(root, 'public', 'og'), { recursive: true });
const lock = {};
for (const card of cards) {
    await page.setContent(cardHtml(card, assets, card.kind === 'home' ? levels : []), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // A title that does not fit would be cut off silently; refuse instead.
    const fit = await page.evaluate(() => {
        const box = selector => document.querySelector(selector)?.getBoundingClientRect();
        const [h1, line, grid] = [box('h1'), box('.line'), box('.grid')];
        return {
            // Room between the title and what follows it, and between the line and the grid.
            gap: Math.round(grid ? Math.min(line.top - h1.bottom, grid.top - line.bottom) : line.top - h1.bottom),
            wide: document.querySelector('.line').scrollWidth > document.body.clientWidth,
        };
    });
    if (fit.gap < 16 || fit.wide) throw new Error(`${card.image}: the text does not fit (${JSON.stringify(fit)}). Shorten the title or the line.`);
    await page.screenshot({ path: join(root, 'public', card.image) });
    lock[card.image] = cardHash(card);
    console.log(card.image);
}
await browser.close();
server.close();
writeFileSync(join(root, 'scripts', 'previews.lock.json'), JSON.stringify(lock, null, 2) + '\n');
console.log(`${cards.length} images drawn. Run \`npm test\` to rebuild the site with them.`);

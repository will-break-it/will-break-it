// How a link preview image looks. One function turns a card (see
// src/lib/previews.ts) into a 1200 x 630 page; scripts/build-previews.mjs
// screenshots it. The tests hash this file together with each card, so a
// change here or in a page's title marks the images as out of date.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = readFileSync(fileURLToPath(import.meta.url), 'utf8');

/** Changes when the card's text or this file changes. The activity grid on the home cards is decoration and left out. */
export const cardHash = card => createHash('sha256').update(SOURCE).update(JSON.stringify(card)).digest('hex').slice(0, 16);

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// *asterisks* in a title mark the part in the brand colour.
const title = text => escape(text).replace(/\*([^*]+)\*/g, '<em>$1</em>');

/** Size of the title by its length, so a long case study title still fits on three lines. */
function titleSize(card) {
    const length = card.title.replace(/\*/g, '').length;
    if (card.kind === 'home') return length <= 52 ? 76 : 66;
    return length <= 30 ? 84 : length <= 48 ? 76 : length <= 62 ? 68 : 62;
}

/**
 * @param card    one entry of /og/cards.json
 * @param assets  { font, photo }: URLs of the Inter file and the portrait
 * @param levels  for the home cards, 364 activity levels (0 to 4), oldest first
 */
export function cardHtml(card, assets, levels = []) {
    const home = card.kind === 'home';
    return `<!DOCTYPE html>
<html lang="${card.lang}">
<head>
<meta charset="UTF-8">
<style>
    @font-face { font-family: "Inter"; src: url("${assets.font}") format("woff2"); font-weight: 100 900; font-display: block; }
    * { box-sizing: border-box; margin: 0; }
    body {
        width: 1200px; height: 630px; overflow: hidden; position: relative;
        padding: 64px 84px 0;
        font-family: "Inter", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        color: #0b1622;
        background: #ffffff;
    }
    /* Only the home cards carry the soft corner; flat cards also make far smaller files. */
    body.home { background: radial-gradient(900px 500px at 100% 0%, rgba(13, 148, 136, 0.10), transparent 60%), #ffffff; }
    .id { display: flex; align-items: center; gap: 22px; }
    .id img { width: 84px; height: 84px; border-radius: 50%; box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px #0d9488; }
    .name { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }
    .name i { font-style: normal; color: #a9b4c0; }
    .url { font-size: 20px; font-weight: 650; color: #0f766e; }
    .kicker { margin-top: 44px; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0f766e; }
    h1 { margin-top: ${home ? 38 : 14}px; font-size: ${titleSize(card)}px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; text-wrap: balance; }
    h1 em { font-style: normal; color: #0d9488; }
    .line { font-size: 26px; font-weight: 600; color: #5b6878; line-height: 1.35; }
    .home .line { margin-top: 26px; font-size: ${card.line.length > 62 ? 24 : 26}px; white-space: nowrap; }
    .page .line { position: absolute; left: 84px; right: 84px; bottom: 56px; padding-top: 22px; border-top: 2px solid #0b1622; text-wrap: balance; }
    .grid { position: absolute; left: 84px; right: 84px; bottom: 44px; display: grid; grid-template-columns: repeat(52, 1fr); grid-auto-flow: column; grid-template-rows: repeat(7, 13px); gap: 4px 5px; }
    .grid span { border-radius: 3px; background: #eef2f5; }
    .grid .l1 { background: #ccfbf1; } .grid .l2 { background: #5eead4; } .grid .l3 { background: #14b8a6; } .grid .l4 { background: #0f766e; }
</style>
</head>
<body class="${home ? 'home' : 'page'}">
    <div class="id">
        <img src="${assets.photo}" alt="">
        <div>
            <p class="name">Will<i>i</i> Wolff</p>
            <p class="url">williwolff.com</p>
        </div>
    </div>
    ${card.kicker ? `<p class="kicker">${escape(card.kicker)}</p>` : ''}
    <h1>${title(card.title)}</h1>
    <p class="line">${escape(card.line)}</p>
    ${home ? `<div class="grid">${levels.map(level => `<span${level ? ` class="l${level}"` : ''}></span>`).join('')}</div>` : ''}
</body>
</html>`;
}

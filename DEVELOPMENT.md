# Working on williwolff.com

The site is static, built with [Astro](https://astro.build) and deployed to Cloudflare Pages
(project `wwolff`). Node version: see `.nvmrc`.

```sh
npm ci
npm run dev      # http://localhost:4321, English at /, German at /de/
npm test         # builds into dist/, then runs the tests against the built site
npm run cv       # regenerates public/cv*.md and public/cv*.json from the Typst sources
npm run previews # redraws the link preview images, see below
```

To run the Pages Functions (`/api/enquiry`, `/mcp`, the Markdown answers) locally:
`npm run build && npx wrangler pages dev dist`.

## Where things live

| Path | What |
| --- | --- |
| `src/partials/home/*.html` | The home page, one file per section. Both languages sit side by side as `<span lang="en">` and `<span lang="de">`; the build keeps one of them per page. |
| `src/content/services/`, `src/content/work/` | Service pages and case studies as Markdown, one file per language: `<key>.en.md` and `<key>.de.md`. The build fails if a translation is missing. |
| `src/lib/site.ts` | Shared strings, URLs and the rate (read from `public/hire.json`). |
| `src/data/llms.md` | The prose of `/llms.txt`. The list of pages is added at build time. |
| `public/` | Files served as they are: images, CV files, `hire.json`, `openapi.json`, `_headers`. |
| `functions/`, `lib/` | Cloudflare Pages Functions: the brief endpoint, the MCP server, redirects and Markdown for agents. |
| `master-cv.typ`, `master-cv-de.typ` | The CV sources. The PDFs in `public/` are compiled from them with Typst. |

## Adding a case study or service page

1. Add `src/content/work/<key>.en.md` and `<key>.de.md` (or under `services/`) with the same
   front matter as an existing file. `slug` sets the URL and may differ per language.
2. Link to it from other content as `@work/<key>` or `@service/<key>`; the build turns that
   into the right URL for each language.
3. `npm run previews` draws the page's link preview image.
4. `npm test`. The sitemap, `/llms.txt`, the language links and the Markdown twin
   (`<url without trailing slash>.md`) are generated and checked.

## Light and dark

The site has two palettes. Both are lists of the same tokens at the top of
`src/styles/site.css`; no other rule names a colour, so a new rule works in both as long as it
uses the tokens. The dark list is written twice, once for a device that asks for dark and
once for a visitor who chose it, and `npm test` fails if the two differ or if a rule names a
colour directly.

The device decides until the visitor uses the switch in the header. The choice is kept in
`localStorage` under `theme` and applied by a one-line script in the head, before the page is
drawn. Choosing what the device asks for anyway removes the stored choice, so the page follows
the device again. Without scripts the switch stays hidden and the device decides. Print always
uses the light palette. The link preview images are light only.

## Titles, descriptions and link previews

Every page sets its own title, description, Open Graph and Twitter tags in
`src/layouts/Base.astro`. The home pages take theirs from `HOME` in `src/lib/site.ts`, a
service page or case study from its front matter. `npm test` holds each title to 65
characters and each description to 110 to 160, and fails if two pages share one.

The image a shared link shows is drawn per page: `public/social-preview.png` and
`.de.png` for the home pages, `public/og/*.png` for the rest. What a card says is decided in
`src/lib/previews.ts` (a case study shows its `facts.result`, a service its `facts.stack`),
how it looks in `scripts/preview-card.mjs`. After changing a title, one of those facts or the
template, run `npm run previews` and commit the images with `scripts/previews.lock.json`;
`npm test` fails while a page and its image disagree. Drawing needs Playwright, which is
not a dependency of the site: `npm install --no-save playwright && npx playwright install chromium`.

LinkedIn, Slack and others keep a copy of the preview for days. To see a change at once,
run the URL through LinkedIn's Post Inspector.

## Before the brief form is live

- A way to send the brief emails, set as secrets of the Cloudflare Pages project. Either
  - **Cloudflare Email Service:** `CLOUDFLARE_EMAIL_TOKEN` (an API token with "Email Sending:
    Edit") and `CLOUDFLARE_ACCOUNT_ID`, plus `CONTACT_TO_EMAIL` set to a verified destination
    address of the account. Sending to such an address is free on every plan; it needs Email
    Routing on the domain. Any other recipient needs the paid Workers plan.
  - **Brevo:** `BREVO_API_KEY`, with the sender address verified in Brevo.

  If both are set, Cloudflare is used. Optional for both: `CONTACT_FROM_EMAIL`,
  `CONTACT_SENDER_NAME`. Without either, the endpoint answers 503 and the form falls back to
  email.
- `contact@williwolff.com` has to exist: in Cloudflare Email Routing, a rule that forwards it to
  the inbox. The site shows this address on every page (`SITE_ADDRESS` in `lib/enquiry.js`; a
  test fails if a page shows another one). Brief emails are marked by their subject,
  `[williwolff.com]`.

`POST /api/enquiry` and `POST /mcp` send one email per valid request and need no sign-in,
because agents use them. `lib/enquiry.js` caps briefs at 5 per visitor per hour and 100 per
day and answers 429 beyond that (`BRIEF_LIMIT_PER_VISITOR_HOUR` and `BRIEF_LIMIT_PER_DAY`
change the numbers). The counters live in the Function's memory, so there is nothing to set
up, and they are approximate: each running copy of the Function counts for itself. If briefs
are ever abused beyond that, the next steps are a rate-limiting rule in Cloudflare (Security
rules) or counters in a shared store.

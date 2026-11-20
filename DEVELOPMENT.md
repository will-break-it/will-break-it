# Working on williwolff.com

The site is static, built with [Astro](https://astro.build) and deployed to Cloudflare Pages
(project `wwolff`). Node version: see `.nvmrc`.

```sh
npm ci
npm run dev      # http://localhost:4321, English at /, German at /de/
npm test         # builds into dist/, then runs the tests against the built site
npm run cv       # regenerates public/cv*.md and public/cv*.json from the Typst sources
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
3. `npm test`. The sitemap, `/llms.txt`, the language links and the Markdown twin
   (`<url without trailing slash>.md`) are generated and checked.

## Before the brief form is live

- `BREVO_API_KEY` in the Cloudflare Pages project (optional: `CONTACT_TO_EMAIL`,
  `CONTACT_FROM_EMAIL`, `CONTACT_SENDER_NAME`). Without it the endpoint answers 503 and the
  form falls back to email.
- One test email to `contact+web@williwolff.com`. The site shows this tagged address and sends
  briefs to it, so that mail from the website can be told apart by its recipient (`SITE_ADDRESS`
  in `lib/enquiry.js`; a test fails if a page still shows the plain one). The tag needs plus
  addressing for the domain: in Cloudflare Email Routing it is a switch under Settings
  (Subaddressing). The CV files keep the plain address on purpose. `CONTACT_TO_EMAIL` overrides
  where briefs go, for example a tagged private address.

`POST /api/enquiry` and `POST /mcp` send one email per valid request and need no sign-in,
because agents use them. `lib/enquiry.js` caps briefs at 5 per visitor per hour and 100 per
day and answers 429 beyond that (`BRIEF_LIMIT_PER_VISITOR_HOUR` and `BRIEF_LIMIT_PER_DAY`
change the numbers). The counters live in the Function's memory, so there is nothing to set
up, and they are approximate: each running copy of the Function counts for itself. If briefs
are ever abused beyond that, the next steps are a rate-limiting rule in Cloudflare (Security
rules) or counters in a shared store.

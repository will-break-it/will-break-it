import { defineConfig } from 'astro/config';

// Static site, deployed to Cloudflare Pages. The Pages Functions in
// /functions (enquiry endpoint, MCP server, Markdown negotiation) are picked
// up by wrangler from the repository root and are not part of this build.
export default defineConfig({
    site: 'https://williwolff.com',
    output: 'static',
    build: { format: 'directory' },
    devToolbar: { enabled: false },
    // Name the browsers the stylesheet is minified for. Without this the minifier
    // keeps only one of a prefixed and a standard declaration, and the header lost
    // its blur: Safari before 18 needs -webkit-backdrop-filter, the others the
    // standard one.
    vite: { build: { cssTarget: ['chrome111', 'edge111', 'firefox113', 'safari16.2'] } },
});

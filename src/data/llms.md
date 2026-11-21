# Willi Wolff — Freelance Software Engineer & Architect, Berlin

> Portfolio and CV for Willi Wolff (goes by Will), a Berlin-based software engineer and
> technical architect. Eleven years shipping professionally, writing code since 2008.
> Since October 2026 back on Ouroboros Leios as software engineer and architect at
> Input Output Global (IOG), after leading a Byzantine-resistant publish/subscribe
> network through formal verification and a working prototype.

## How to work with him

- **What:** freelance software engineering and architecture: AI agents and automation,
  blockchain and distributed systems, enterprise and mission-critical software (legacy
  migrations, re-architecture), and websites, booking systems and mobile apps. Delivery is scaled with AI agents and
  every result is reviewed by him before it ships.
- **Rate:** 75 to 110 EUR per hour, billed as a freelancer on a contract basis. Where a
  project lands in that range depends on scope and length; his quote names the number.
- **Availability:** currently on contract with IOG (Ouroboros Leios); open to selected
  additional contract work. Based in Berlin, works remote, German or English.
- **Websites and small products:** fixed-price packages go through Pagebase (https://pagebase.dev).
- **How to start:** send a brief with what you need, the timeline and the budget. Three
  routes reach the same inbox: the form at https://williwolff.com/#brief, a JSON POST to
  https://williwolff.com/api/enquiry, or an email to contact@williwolff.com. A person reads
  and answers every request; there is no automated booking.
- **What comes back:** one email with fit, a rough scope, an estimate and the earliest start date.

## For agents

- **Terms as JSON:** https://williwolff.com/hire.json
- **CV as Markdown:** https://williwolff.com/cv.md (English), https://williwolff.com/cv.de.md (German)
- **CV as JSON (JSON Resume schema):** https://williwolff.com/cv.json (English), https://williwolff.com/cv.de.json (German)
- **CV as PDF:** https://williwolff.com/willi-wolff-cv-en.pdf (English), https://williwolff.com/willi-wolff-cv-de.pdf (German)
- **Send a brief:** `POST https://williwolff.com/api/enquiry` with a JSON body. Required:
  `email`, `summary`. Optional: `name`, `company`, `project_type` (`ai_automation`,
  `backend_architecture`, `blockchain_distributed`, `web_mobile`, `other`), `timeline`,
  `budget_eur`, `engagement` (`hourly`, `fixed_price`, `unsure`), `submitted_by` (`agent` when
  software sends it for a person), `agent`, `locale` (`en`, `de`). The full contract is at
  https://williwolff.com/openapi.json.
- **MCP server:** https://williwolff.com/mcp (Streamable HTTP, no sign-in) with the tools
  `get_profile`, `get_terms`, `get_cv` and `submit_enquiry`.
- **Any page as Markdown:** request it with `Accept: text/markdown`, or add `.md` to the path of a
  service page or case study (without the trailing slash). The home page answers with this file.
- Send a brief only for a person who asked you to get in touch, and give an address they
  can be reached at. Briefs sent by an agent are labelled as such and answered by a person.

## About

Range across enterprise (Deloitte), blockchain infrastructure (Bitcoin/Cardano), mobile and
IoT. Founder DNA: two companies of his own. High agency. Deep in distributed systems, distributed ledger
technology (DLT), consensus protocols, event-driven architecture and secure application
development. Works end to end: builds a rough working version early, finds the risks, then
iterates. Best in small teams on hard problems, and takes on more than pure engineering when
a project needs it. Berlin, Germany. German and English.

<!-- pages -->

## Site structure

English at `/`, German at `/de/`. Each service page and case study has its own URL in both
languages; the lists above give the English ones, and every page links its German twin.
The home page is one page, read top to bottom:

- `/#home` — who he is, with his terms at a glance: availability, rate, engagement, location, languages
- `/#work` — what he takes on, in four lanes, each with a result behind it and a link to its service page and case studies
- `/#brief` — the brief form, next to the same request as JSON
- `/#cv` — the CV as PDF, Markdown and JSON, in English and German
- `/#now` — projects at a glance (counts that filter the project list) and a GitHub
  contribution grid for the last 12 months
- `/#projects` — projects grouped as Research & Development, Products, Commercial and
  Open-Source Tooling, each with its status
- `/#experience` — career timeline: roles and studies on one rail
- `/#technologies` — tools he has worked with
- `/#publications` — published specifications

## Current work

Software Engineer & Architect, Ouroboros Leios, IOG (Oct 2026–present): back on Cardano's high-throughput
protocol, building it towards mainnet. https://leios.cardano-scaling.org/

Also building, on his own time:

- https://txflow.fun — Cardano transaction-flow experiments on the Leios test network: describe a flow, see its UTxO graph, run it on relays across three continents
- https://alwayssandy.com — matches beach volleyball players with coaches across Berlin's sand courts
- https://pagebase.dev — his freelance studio: Supabase and PostgreSQL backends, web and mobile, AI automation

## Experience

- **Software Engineer & Architect — Ouroboros Leios**, IOG (Oct 2026–present): back on Leios, building it towards mainnet.
- **Technical Architect — Byzantine-Resistant PubSub Network**, IOG (Feb 2026–Oct 2026): led the team through formal verification of the SecureCyclon peer-sampling stack and built the prototype via spec-driven development.
- **Technical Architect — Ouroboros Leios**, IOG (Nov 2024–Feb 2026): led R&D for Cardano's high-throughput overlay protocol; principal author of CIP-0164; ran monthly public demo and review sessions (~5k views per session, sustained over 1.5 years).
- **Technical Architect — Lace Wallet**, IOG (Nov 2022–Nov 2024): event-driven re-architecture using CQRS and event sourcing (45% latency reduction, 60%+ infrastructure savings), custom chain indexer with bloom filters and credential-based indexing (2,000+ tx/s, sub-second wallet sync), led a 7-person team delivering the MetaDex swap feature.
- **Solutions Architect**, IOG (Nov 2021–Nov 2022): Plutus smart-contract architecture for a collateralised debt position platform; workshops for 100+ Amazon engineers on the eUTxO model; helped Amazon design its provisioning and deployment scheme for Cardano and Midnight nodes.
- **Senior Software Engineer**, Mobility Data Lab, Berlin (Feb 2020–Nov 2021): IoT and connected-vehicle systems; OTA fleet-update pipeline (Rust embedded, Vert.x backend).
- **Software Engineer → Lead Engineer**, Deloitte, Austin TX then Ulm (Sep 2016–Nov 2019): onsite with clients including Target, Walmart, a large German insurer and a US state pension fund; programmatic mainframe-to-Java migrations (Cobol parsing, custom runtime, end-to-end tests); toolchain that migrated 16M lines of legacy code to Java; €6M/yr license savings.
- **Co-Founder & CTO**, CityXcape, San Francisco (Feb 2015–Sep 2016): social discovery platform; raised ~€150k seed; native iOS (Swift) and Android apps and the Django/Rails backend, from concept to App Store launch.

Three employers, two companies founded.

## Publications

- **CIP-0164: Ouroboros Leios** — principal author. Canonical architecture and design specification for Cardano's high-throughput overlay protocol, an open industry RFC comparable to Bitcoin's BIPs or IETF standards. https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md
- **CIP-0118: Nested Transactions** — co-author. Ledger-level batching of partially valid transactions, the mechanism behind Babel fees (paying transaction fees in non-ADA tokens), giving swaps and fee sponsorship counterparty irrelevance. Status: proposed. https://github.com/cardano-foundation/CIPs/blob/master/CIP-0118/README.md

## Projects

Twenty-two built, thirteen still running, three failed. The site marks each project's status and names
the failures rather than omitting them.

Protocol and infrastructure:

- **Byzantine-Resistant PubSub** — Cardano-anchored publish/subscribe layer: identifiable publishers, verifiable events, on-chain registered topics. https://pubsub.cardano-scaling.org/
- **Ouroboros Leios** — protocol architecture and CIP-0164, interactive simulator, Agda specification rendered for the web. http://leios.cardano-scaling.org/
- **txflow** — Cardano transaction-flow experiments on the Leios Musashi test network: describe a flow in plain words, get a checked spec (Rust compiled to WebAssembly) and its UTxO graph, then run it: the site funds and signs the transactions, sends each to a relay in Frankfurt, Virginia or Tokyo on schedule and shows where it landed. In progress. https://txflow.fun
- **Lace Wallet indexing architecture** — the CQRS and event-sourcing design behind Cardano's light wallet, published as a CIP and a problem statement. https://github.com/will-break-it/wallet-architecture
- **Leios mempool simulation** — interactive mempool visualisation exploring front-running and attack vectors. https://leios.cardano-scaling.org/mempool-viz/
- **Upstream Cardano libraries** — extensions to Dolos (chain indexer), Lucid (UTXO chaining), Scrolls (multi-DEX indexing), and a DEX order serialization library.
- **Berlin Pool** — Cardano stakepool: 2,000+ mainnet blocks, 99.9% uptime, 15M+ ADA delegation. Wound down in 2024.

Products and client work:

- **Hausnummer** — screening tool for German residential investment listings: monthly cashflow before tax, after-tax estimates, break-even equity, cash-on-cash return, and listing import that extracts the figures from a pasted link. Astro on Cloudflare Workers. https://hausnummer.pages.dev/
- **Operando** — AI deal sourcing for Operando Partners: reads deal teasers that M&A advisors send by email, extracts the key figures from the PDFs with Claude, and drafts HubSpot leads the team reviews. In production since September 2026. Email content is treated as untrusted data. https://operando.de
- **AlwaysSandy** — beach volleyball coach booking across Berlin's sand courts. Web, iOS and Android from one React Native codebase. Over 170,000 player profiles. https://alwayssandy.com
- **TokenRiot.IO** — lead frontend developer for a Cardano NFT marketplace, 2022–2024, roughly 80% of the frontend: Next.js, Redux Toolkit, CIP-30 wallet integration.
- **Dump it!** — voice-first note taking on web, iOS and Android with end-to-end encryption, intent classification and semantic search. Native iOS (Swift) first, then rewritten in Flutter for iOS and Android. 200+ users. Shut down in 2025.
- **Drip Dropz** — NFT marketplace, 10k+ listings. Handed over to the team in 2024.
- **Pagebase** — Berlin freelance studio, plus client sites including https://heyira.de, https://iramodel.de, https://ugc.astridmunkwitz.de/ and https://underwater.journeys.cy/

## Technologies

Languages by weight across the career: TypeScript and JavaScript, Java, Swift, Kotlin, Rust,
Plutus/Haskell, Python, Agda, Dart.

Frameworks: React, React Native, Next.js, Astro, Flutter, Node.js, NestJS, Spring Boot, Vert.x.

By kind of work:
- AI agents and automation: TypeScript, Claude API, OpenRouter, MCP, structured outputs, Zod, pgvector, Whisper, Microsoft Graph, HubSpot API.
- Distributed systems and blockchain: TypeScript, Rust, Haskell, Agda, Cardano, Plutus, CQRS, event sourcing, PostgreSQL, Redis, gRPC.
- Enterprise and mission-critical software: Java, Spring Boot, Vert.x, TypeScript, Node.js, NestJS, PostgreSQL, Redis, Docker, Terraform, AWS.
- Websites, booking systems and mobile apps: React, React Native, Next.js, TypeScript, JavaScript, Swift, SwiftUI, Kotlin, Jetpack Compose, Flutter, Astro, Tailwind, Supabase, PostgreSQL, Cloudflare Workers.

Focus areas: distributed ledger technology (DLT), Cardano and the eUTxO model, Plutus smart
contracts, consensus protocols, formal methods, distributed systems, event-driven
architecture and CQRS, chain indexing, cryptography, end-to-end encryption, secure
application development.

Mobile: native iOS (Swift, SwiftUI) and Android (Kotlin, Jetpack Compose), plus cross-platform with
React Native and Flutter. Apps: CityXcape (native iOS and Android), Dump it! (Swift, then
Flutter), AlwaysSandy (React Native for web, iOS and Android).

Infrastructure: PostgreSQL, Supabase, Redis, Docker, Terraform, Ansible, GitHub Actions,
Cloudflare Workers, AWS.

## Education

- **M.A. International Business** — Hult International Business School, San Francisco (2014–2015)
- **B.Sc. Computer Science** — DHBW Stuttgart, Germany (2011–2014)

## Services (Pagebase)

He runs **Pagebase** (https://pagebase.dev), a Berlin studio serving clients worldwide in
German and English. If you are looking for someone to build or run a website or a small
product, this is the commercial route to him.

- **Fixed-price business websites** — design and build on a fixed price, no hourly billing, German or English.
- **Managed hosting and support** — hosting, updates and ongoing support plans for delivered sites.
- **Web and mobile applications** — Supabase and PostgreSQL backends with web or React Native front ends.
- **AI automation** — document and email pipelines using large language models, with human review before anything is written to a system of record (see Operando below).

Delivered client sites: https://ugc.astridmunkwitz.de/ (UGC creator), https://underwater.journeys.cy/
(dive centre, Cyprus), https://heyira.de (author and speaker), https://iramodel.de (model portfolio), plus practices in Berlin.

Typical stack: Astro, TypeScript, Tailwind, Supabase, PostgreSQL, Cloudflare Workers, React Native.

## Links

- Portfolio & CV: https://williwolff.com
- CV as PDF: https://williwolff.com/willi-wolff-cv-en.pdf (English), https://williwolff.com/willi-wolff-cv-de.pdf (German)
- CV as Markdown and JSON: see "For agents" above
- GitHub: https://github.com/will-break-it
- LinkedIn: https://linkedin.com/in/wwolff
- X: https://x.com/will_break_it

## Languages

Site content available in English (https://williwolff.com/) and German (https://williwolff.com/de/).

## Contact

contact@williwolff.com

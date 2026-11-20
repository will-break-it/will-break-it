# Willi Wolff

Software Engineer · Technical Architect · Builder

Berlin, Germany · German and English · contact@williwolff.com · [williwolff.com](https://williwolff.com/) · [LinkedIn](https://linkedin.com/in/wwolff) · [GitHub](https://github.com/will-break-it)

Other formats: [PDF](https://williwolff.com/willi-wolff-cv-en.pdf) · [JSON](https://williwolff.com/cv.json) · [Deutsch](https://williwolff.com/cv.de.md)

## Profile

Software engineer with 10+ years across enterprise (Deloitte), blockchain infrastructure (Bitcoin/Cardano), mobile, and IoT. Currently software engineer and architect on Ouroboros Leios at IOG. Founder DNA and high agency, at home in distributed systems and secure software. I like to own problems end-to-end: build a rough working version early, find the risks, then iterate. My best work happens in small teams on hard problems, and I gladly take on more than pure engineering when a project needs it.

## Experience

### Software Engineer & Architect – Ouroboros Leios

[Input Output Global (IOG)](https://www.iog.io/) · Contract · Oct 2026 – Present

Back on [Ouroboros Leios](http://leios.cardano-scaling.org/), building Cardano's high-throughput protocol towards mainnet.

### Technical Architect – Byzantine-Resistant PubSub Network

[Input Output Global (IOG)](https://www.iog.io/) · Contract · Feb 2026 – Oct 2026

Led research and development of [Cardano PubSub](https://pubsub.cardano-scaling.org/), a Byzantine-resistant publish/subscribe network, taking a team through formal verification of a research proposal and building the prototype.

- **Technical Leadership:** Led a team of 4 engineers and researchers designing a Byzantine-resistant pub/sub overlay network
- **Formal Verification:** Took a team through formal verification of the [SecureCyclon](https://www.iog.io/papers/securecyclon-dependable-peer-sampling) peer-sampling protocol stack and built the working prototype via spec-driven development ([spec-kit](https://github.com/github/spec-kit))
- **Protocol Security:** Reevaluated peer-sampling protocols for specific security properties

### Technical Architect – Ouroboros Leios

[Input Output Global (IOG)](https://www.iog.io/) · Contract · Nov 2024 – Feb 2026

Led research and development of Ouroboros Leios, a high-throughput overlay protocol for Cardano blockchain, coordinating cross-functional team and driving toward mainnet implementation.

- **Technical Leadership & Team Coordination:** Direct team of 8 researchers and engineers across formal methods, protocol design, and prototype development
- **Defining Direction:** Translated open research into executable roadmap—authored [CIP-0164](https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md) (Cardano Improvement Proposal, industry RFC comparable to Bitcoin's BIPs or IETF standards)
- **Architecture & Strategy:** Designed simulation-driven approach validating protocol behavior before mainnet; created decision log tracking architectural choices and rationale
- **Cross-Org Coordination:** Bridge formal methods researchers, protocol engineers, and product teams—navigating complex technical trade-offs
- **Point of Contact:** Technical point of contact for the project: presented progress and findings in large internal reviews and publicly via monthly demo and review sessions for community and technical audiences (5k+ views per session, sustained over 1.5 years), the project [website](http://leios.cardano-scaling.org/), and regular reports
- **MEV Analysis:** Investigated [MEV](https://ethereum.org/en/developers/docs/mev/) (Miner Extractable Value) impact on Leios via [mempool analysis and simulation](https://leios.cardano-scaling.org/mempool-viz/)
- **Workshop Facilitation:** Organized week-long on-site workshop that reduced open research questions and aligned team on implementation strategy

### Technical Architect – Lace Wallet

[Input Output Global (IOG)](https://www.iog.io/) · Contract · Nov 2022 – Nov 2024

Led technical architecture and backend infrastructure for Lace, a next-generation Cardano wallet, delivering significant performance improvements and new revenue-generating features.

- **Backend Re-Architecture:** Re-engineered from poll-based to event-driven architecture—45% latency reduction, 60%+ infrastructure cost savings
- **Go-Live:** Took the re-architected backend to production for the public Lace 1.0 launch
- **Custom Chain Indexer:** Built indexer with bloom filters and credential-based indexing; 2,000+ tx/s ingest capacity, sub-second wallet sync
- **Industry Standards:** Authored [CIP proposal](https://github.com/will-break-it/wallet-architecture/tree/main/docs/CIP/CIP-XXXX) for wallet indexing standards adopted in ecosystem
- **Product Leadership:** Led 7-person cross-functional team (3 FE, 2 BE, 1 QA, 1 PM) delivering MetaDex swap feature
- **Shared Tooling:** Built transaction construction libraries and event-driven patterns adopted across multiple product teams
- **Technical Innovation:** Developed background web worker sync approach later adopted by team as standard pattern

### Solutions Architect

[Input Output Global (IOG)](https://www.iog.io/) · Contract · Nov 2021 – Nov 2022

Designed blockchain solutions and educated enterprise partners on Cardano's technical architecture.

- **Smart Contract Architecture:** Designed complete Plutus stack for collateralized debt position (CDP) platform
- **Technical Education:** Conducted workshops for 100+ Amazon engineers on eUTxO model, smart contracts, and dApp patterns
- **Node Deployment:** Helped Amazon design its provisioning and deployment scheme for running Cardano and Midnight nodes
- **Knowledge Transfer:** Created training materials and hands-on exercises for blockchain education

### Senior Software Engineer

Mobility Data Lab GmbH, Berlin · Feb 2020 – Nov 2021

Built IoT and data processing systems for connected vehicle platform.

- **Fleet Management:** Delivered complete OTA fleet-update pipeline for connected vehicle hardware
- **IoT Platform:** Built OTA update mechanism (Rust embedded, Vert.x backend) with rollback capabilities
- **Analytics:** Designed real-time data pipeline using ELK stack for Miles and Share Now car-sharing services
- **Go-Live:** Launched the pilot in production with 20+ vehicles

### Software Engineer → Lead Engineer & Senior Software Engineer

[Deloitte, Austin TX → Ulm, Germany](https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html) · Sep 2016 – Nov 2019

Joined as Software Engineer in Austin, Texas, then relocated to Ulm, Germany as Senior Software Engineer, where I was promoted to lead a large-scale legacy system migration for a major German insurance company.

- **Migration Toolchain:** Redesigned Cobol-to-Java architecture for functional language (ISA); 3-stage pipeline: parser → AST → Java codegen, plus runtime emulation layer preserving original ISA/IDM behavior
- **Business Impact:** Saved client €6M annually in licensing costs
- **Go-Lives:** Delivered two production go-lives on separate migration projects: a major German insurer and a US state pension fund and social security agency
- **Retail Clients:** Onsite with S&P 500 retailers Target and Walmart on programmatic mainframe-to-Java migrations (Cobol parsing, custom runtime, end-to-end tests) cutting mainframe licensing and support costs
- **Team Growth:** Promoted to Lead within 24 months; scaled team from 3 to 20 engineers
- **Global Coordination:** Coordinated with offshore teams in India; established testing standards adopted organization-wide

### Co-Founder & CTO

[CityXcape Inc., San Francisco](https://cityxcape.com/) · Feb 2015 – Sep 2016

Technical co-founder of social discovery platform for exploring cities through community-driven recommendations.

- **Product Development:** Built native iOS app (Swift) and Django/Rails backend from concept to App Store launch
- **Fundraising:** Raised ~€150k in seed funding from angel investors
- **Team Leadership:** Led technical team of 2-3 contract developers; defined product vision and roadmap

## Published Work

### CIP-0164: Ouroboros Leios

Cardano Improvement Proposal · 2025

Canonical architecture and design specification for Cardano's high-throughput overlay protocol—an open industry RFC comparable to Bitcoin's BIPs and IETF standards. Read it at [CIP-0164](https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md).

## Projects

### Ouroboros Leios – Protocol Architecture & CIP

Cardano Research · 2024 – Present

Co-authored protocol specification and architecture for Cardano's next-generation throughput layer.

- **CIP Authorship:** Principal author of [CIP-0164](https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md)—the canonical architecture design document guiding implementation teams
- **Protocol Specification:** Translated academic research into implementable specification with concrete parameters and trade-offs
- **Technical Documentation:** Created comprehensive [documentation site](https://leios.cardano-scaling.org) covering protocol mechanics, simulation results, and design rationale

### Dump it! – AI-Enhanced Note Taking

iOS, Android, Web · 2023 – 2025

Cross-platform application with end-to-end encryption and sophisticated AI processing pipeline.

- **Full-Stack:** Native iOS (Swift/SwiftUI), Android (Kotlin/Compose), and React web app with feature parity
- **E2E Encryption:** Diffie-Hellman key exchange + AES-256-GCM + iOS Secure Enclave—zero backend access to user data
- **AI Pipeline:** Two-phase LLM processing (Claude for intent, pgvector for semantic search, Whisper for speech-to-text)
- **Architecture:** Event-sourced with SSE streaming; offline-first with persistent queue sync
- **Traction:** 5k+ notes, 200+ users, 70% weekly retention; shipped to App Store and Google Play

### Pagebase – Freelance Development Agency

Founder · 2024 – Present

Berlin-based agency building Supabase/PostgreSQL backends, web and mobile apps, and AI automation.

- **Stack:** Supabase, PostgreSQL, React/React Native, edge functions, CI/CD

### Hausnummer – Property Deal Screening

Solo Project · 2026

Screening tool for German residential investment listings, built and shipped solo.

- **Modelling:** Monthly cashflow before tax as the headline figure, after-tax estimates kept separate, break-even equity and cash-on-cash return; all assumptions visible and editable
- **Stack:** Astro on Cloudflare Workers with KV; listing import extracts figures from a pasted link via browser rendering and structured output parsing

### Drip Dropz – NFT Marketplace

Cardano · 2022 – 2024

Production NFT trading platform built from scratch.

- **Frontend:** React/TypeScript SPA with CIP-30 wallet integration and background web worker sync
- **Smart Contracts:** Plutus integration for bidding, selling, swapping, and order management
- **Launch:** 10k+ NFT listings; first revenue within 48 hours
- **DevOps:** TDD practices with Jest; CI/CD pipeline for reliable deployments

### Berlin Pool – Stakepool Operations

Cardano Infrastructure · 2021 – 2024

Operated Cardano consensus nodes contributing to network decentralization.

- **Node Operations:** Produced 2,000+ mainnet blocks; maintained 99.9% uptime; 15M+ ADA delegation
- **Security:** Air-gapped cold key storage; secure key rotation procedures
- **Infrastructure:** Automated deployment with Docker, Ansible, Terraform; Prometheus/Grafana monitoring

## Technologies

- **Languages:** TypeScript (expert), Rust, Swift, Java/Kotlin, Python, Haskell/Plutus
- **Infrastructure:** Distributed systems, Event-driven, PostgreSQL, Redis, gRPC, Microservices
- **Security:** E2E encryption, Diffie-Hellman, AES-256, Secure Enclave/TEE, Key management
- **AI/ML:** LLM integration (Claude, GPT-4), Vector search, Embeddings, Whisper
- **Web & Mobile:** React, React Native, NestJS, Spring Boot, Vert.x, Swift/iOS, Kotlin/Android
- **DevOps:** Docker, Terraform, Ansible, GitHub Actions, CI/CD, AWS, Prometheus/Grafana
- **Blockchain & DLT:** Cardano (eUTxO), Plutus, CIP standards, Consensus protocols, Wallet standards
- **Leadership:** Team building, Technical strategy, Architecture docs, Workshop facilitation

## Education

- **M.A. International Business** · Hult International Business School, San Francisco · 2014 – 2015
- **B.Sc. Computer Science** · DHBW Stuttgart, Germany · 2011 – 2014

---

Last updated: 2026-11-18

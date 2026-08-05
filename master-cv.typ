// Master CV - Complete version with all details
// Use this as source of truth for role-specific CVs in private/

#set page(margin: (x: 1.4cm, y: 1.2cm))
#set text(font: "Helvetica Neue", size: 9.5pt, fill: rgb("#1f2937"))
#set par(justify: true, leading: 0.55em)

#let accent = rgb("#0d9488")
#let muted = rgb("#6b7280")

// Header
#align(center)[
  #text(size: 22pt, weight: "bold", tracking: 0.5pt)[WILLI WOLFF]
  #v(2pt)
  #text(size: 10pt, fill: muted)[Software Engineer · Technical Architect · Builder]
  #v(4pt)
  #text(size: 9pt, fill: muted)[Berlin, Germany · German & English]
  #v(2pt)
  #link("mailto:wolff.willi@gmail.com")[#text(size: 9pt, fill: accent)[Email]] #h(6pt) #link("https://linkedin.com/in/wwolff")[#text(size: 9pt, fill: accent)[LinkedIn]] #h(6pt) #link("https://github.com/will-break-it")[#text(size: 9pt, fill: accent)[GitHub]]
]

// Section heading
#let section(title) = {
  v(10pt)
  line(length: 100%, stroke: 0.3pt + rgb("#e5e7eb"))
  v(6pt)
  text(size: 9pt, weight: "bold", fill: accent, tracking: 1pt)[#upper(title)]
  v(5pt)
}

// Experience entry
#let exp(title, date, company, body) = {
  v(6pt)
  grid(
    columns: (1fr, auto),
    text(weight: "bold", size: 10pt)[#title],
    text(fill: muted, size: 9pt)[#date]
  )
  text(size: 9pt, fill: muted, style: "italic")[#company]
  v(3pt)
  body
}

// Bullet
#let b(content) = {
  grid(
    columns: (10pt, 1fr),
    gutter: 4pt,
    text(fill: accent)[•],
    content
  )
  v(1pt)
}

// === CONTENT ===

#section("Profile")

Software engineer with 10+ years across enterprise (Deloitte), blockchain infrastructure (Bitcoin/Cardano), mobile, and IoT. Currently technical architect for a Byzantine-resistant pub/sub network at IOG. Founder DNA, at home in distributed systems and secure software. I like to own problems end-to-end: build a rough working version early, find the risks, then iterate. My best work happens in small teams on hard problems, and I gladly take on more than pure engineering when a project needs it.

#section("Experience")

#exp("Technical Architect – Byzantine-Resistant PubSub Network", "Feb 2026 – Present", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Contract])[
  Leading research and development of #link("https://pubsub.cardano-scaling.org/")[#text(fill: accent)[Cardano PubSub]], a Byzantine-resistant publish/subscribe network, formally verifying a research proposal and building a prototype.
  #v(2pt)
  #b[*Technical Leadership:* Lead a team of 4 engineers and researchers designing a Byzantine-resistant pub/sub overlay network]
  #b[*Formal Verification:* Formally verifying the #link("https://www.iog.io/papers/securecyclon-dependable-peer-sampling")[#text(fill: accent)[SecureCyclon]] peer-sampling protocol stack and building a working prototype via spec-driven development (#link("https://github.com/github/spec-kit")[#text(fill: accent)[spec-kit]])]
  #b[*Protocol Security:* Reevaluating peer-sampling protocols that come with specific security properties]
]

#exp("Technical Architect – Ouroboros Leios", "Nov 2024 – Feb 2026", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Contract])[
  Led research and development of Ouroboros Leios, a high-throughput overlay protocol for Cardano blockchain, coordinating cross-functional team and driving toward mainnet implementation.
  #v(2pt)
  #b[*Technical Leadership & Team Coordination:* Direct team of 8 researchers and engineers across formal methods, protocol design, and prototype development]
  #b[*Defining Direction:* Translated open research into executable roadmap—authored #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]] #linebreak() (Cardano Improvement Proposal, industry RFC comparable to Bitcoin's BIPs or IETF standards)]
  #b[*Architecture & Strategy:* Designed simulation-driven approach validating protocol behavior before mainnet; created decision log tracking architectural choices and rationale]
  #b[*Cross-Org Coordination:* Bridge formal methods researchers, protocol engineers, and product teams—navigating complex technical trade-offs]
  #b[*Point of Contact:* Technical point of contact for the project: presented progress and findings in large internal reviews and publicly via monthly demo and review sessions for community and technical audiences (5k+ views per session, sustained over 1.5 years), the project #link("http://leios.cardano-scaling.org/")[#text(fill: accent)[website]], and regular reports]
  #b[*MEV Analysis:* Investigated #link("https://ethereum.org/en/developers/docs/mev/")[#text(fill: accent)[MEV]] (Miner Extractable Value) impact on Leios via #link("https://leios.cardano-scaling.org/mempool-viz/")[#text(fill: accent)[mempool analysis and simulation]]]
  #b[*Workshop Facilitation:* Organized week-long on-site workshop that reduced open research questions and aligned team on implementation strategy]
]

#exp("Technical Architect – Lace Wallet", "Nov 2022 – Nov 2024", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Contract])[
  Led technical architecture and backend infrastructure for Lace, a next-generation Cardano wallet, delivering significant performance improvements and new revenue-generating features.
  #v(2pt)
  #b[*Backend Re-Architecture:* Re-engineered from poll-based to event-driven architecture—45% latency reduction, 60%+ infrastructure cost savings]
  #b[*Go-Live:* Took the re-architected backend to production for the public Lace 1.0 launch]
  #b[*Custom Chain Indexer:* Built indexer with bloom filters and credential-based indexing; 2,000+ tx/s ingest capacity, sub-second wallet sync]
  #b[*Industry Standards:* Authored #link("https://github.com/will-break-it/wallet-architecture/tree/main/docs/CIP/CIP-XXXX")[#text(fill: accent)[CIP proposal]] for wallet indexing standards adopted in ecosystem]
  #b[*Product Leadership:* Led 7-person cross-functional team (3 FE, 2 BE, 1 QA, 1 PM) delivering MetaDex swap feature]
  #b[*Shared Tooling:* Built transaction construction libraries and event-driven patterns adopted across multiple product teams]
  #b[*Technical Innovation:* Developed background web worker sync approach later adopted by team as standard pattern]
]

#exp("Solutions Architect", "Nov 2021 – Nov 2022", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Contract])[
  Designed blockchain solutions and educated enterprise partners on Cardano's technical architecture.
  #v(2pt)
  #b[*Smart Contract Architecture:* Designed complete Plutus stack for collateralized debt position (CDP) platform]
  #b[*Technical Education:* Conducted workshops for 100+ Amazon engineers on eUTxO model, smart contracts, and dApp patterns]
  #b[*Knowledge Transfer:* Created training materials and hands-on exercises for blockchain education]
]

#exp("Senior Software Engineer", "Feb 2020 – Nov 2021", "Mobility Data Lab GmbH, Berlin")[
  Built IoT and data processing systems for connected vehicle platform.
  #v(2pt)
  #b[*Fleet Management:* Delivered complete OTA fleet-update pipeline for connected vehicle hardware]
  #b[*IoT Platform:* Built OTA update mechanism (Rust embedded, Vert.x backend) with rollback capabilities]
  #b[*Analytics:* Designed real-time data pipeline using ELK stack for Miles and Share Now car-sharing services]
  #b[*Go-Live:* Launched the pilot in production with 20+ vehicles]
]

#exp("Software Engineer → Lead Engineer & Senior Software Engineer", "Sep 2016 – Nov 2019", link("https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html")[Deloitte, Austin TX → Ulm, Germany])[
  Joined as Software Engineer in Austin, Texas, then relocated to Ulm, Germany as Senior Software Engineer, where I was promoted to lead a large-scale legacy system migration for a major German insurance company.
  #v(2pt)
  #b[*Migration Toolchain:* Redesigned Cobol-to-Java architecture for functional language (ISA); 3-stage pipeline: parser → AST → Java codegen, plus runtime emulation layer preserving original ISA/IDM behavior]
  #b[*Business Impact:* Saved client €6M annually in licensing costs]
  #b[*Go-Lives:* Delivered two production go-lives on separate migration projects: a major German insurer and a US state pension fund and social security agency]
  #b[*Team Growth:* Promoted to Lead within 24 months; scaled team from 3 to 20 engineers]
  #b[*Global Coordination:* Coordinated with offshore teams in India; established testing standards adopted organization-wide]
]

#exp("Co-Founder & CTO", "Feb 2015 – Sep 2016", link("https://cityxcape.com/")[CityXcape Inc., San Francisco])[
  Technical co-founder of social discovery platform for exploring cities through community-driven recommendations.
  #v(2pt)
  #b[*Product Development:* Built native iOS app (Swift) and Django/Rails backend from concept to App Store launch]
  #b[*Fundraising:* Raised ~€150k in seed funding from angel investors]
  #b[*Team Leadership:* Led technical team of 2-3 contract developers; defined product vision and roadmap]
]

#section("Published Work")

#exp("CIP-0164: Ouroboros Leios", "2025", "Cardano Improvement Proposal")[
  Canonical architecture and design specification for Cardano's high-throughput overlay protocol—an open industry RFC comparable to Bitcoin's BIPs and IETF standards. Read it at #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]].
]

#section("Projects")

#exp("Ouroboros Leios – Protocol Architecture & CIP", "2024 – Present", "Cardano Research")[
  Co-authored protocol specification and architecture for Cardano's next-generation throughput layer.
  #v(2pt)
  #b[*CIP Authorship:* Principal author of #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]]—the canonical architecture design document guiding implementation teams]
  #b[*Protocol Specification:* Translated academic research into implementable specification with concrete parameters and trade-offs]
  #b[*Technical Documentation:* Created comprehensive #link("https://leios.cardano-scaling.org")[#text(fill: accent)[documentation site]] covering protocol mechanics, simulation results, and design rationale]
]

#exp("Dump it! – AI-Enhanced Note Taking", "2023 – 2025", "iOS, Android, Web")[
  Cross-platform application with end-to-end encryption and sophisticated AI processing pipeline.
  #v(2pt)
  #b[*Full-Stack:* Native iOS (Swift/SwiftUI), Android (Kotlin/Compose), and React web app with feature parity]
  #b[*E2E Encryption:* Diffie-Hellman key exchange + AES-256-GCM + iOS Secure Enclave—zero backend access to user data]
  #b[*AI Pipeline:* Two-phase LLM processing (Claude for intent, pgvector for semantic search, Whisper for speech-to-text)]
  #b[*Architecture:* Event-sourced with SSE streaming; offline-first with persistent queue sync]
  #b[*Traction:* 5k+ notes, 200+ users, 70% weekly retention; shipped to App Store and Google Play]
]

#exp("Pagebase – Freelance Development Agency", "2024 – Present", "Founder")[
  Berlin-based agency building Supabase/PostgreSQL backends, web and mobile apps, and AI automation.
  #v(2pt)
  #b[*Stack:* Supabase, PostgreSQL, React/React Native, edge functions, CI/CD]
]

#exp("Drip Dropz – NFT Marketplace", "2022 – 2024", "Cardano")[
  Production NFT trading platform built from scratch.
  #v(2pt)
  #b[*Frontend:* React/TypeScript SPA with CIP-30 wallet integration and background web worker sync]
  #b[*Smart Contracts:* Plutus integration for bidding, selling, swapping, and order management]
  #b[*Launch:* 10k+ NFT listings; first revenue within 48 hours]
  #b[*DevOps:* TDD practices with Jest; CI/CD pipeline for reliable deployments]
]

#exp("Berlin Pool – Stakepool Operations", "2021 – 2024", "Cardano Infrastructure")[
  Operated Cardano consensus nodes contributing to network decentralization.
  #v(2pt)
  #b[*Node Operations:* Produced 2,000+ mainnet blocks; maintained 99.9% uptime; 15M+ ADA delegation]
  #b[*Security:* Air-gapped cold key storage; secure key rotation procedures]
  #b[*Infrastructure:* Automated deployment with Docker, Ansible, Terraform; Prometheus/Grafana monitoring]
]

#section("Technologies")

#let skill(category, items) = {
  text(weight: "bold", size: 9pt)[#category]
  linebreak()
  text(fill: muted, size: 9pt)[#items]
}

#grid(
  columns: (1fr, 1fr),
  gutter: (12pt, 6pt),
  skill("Languages", "TypeScript (expert), Rust, Swift, Java/Kotlin, Python, Haskell/Plutus"),
  skill("Infrastructure", "Distributed systems, Event-driven, PostgreSQL, Redis, gRPC, Microservices"),
  skill("Security", "E2E encryption, Diffie-Hellman, AES-256, Secure Enclave/TEE, Key management"),
  skill("AI/ML", "LLM integration (Claude, GPT-4), Vector search, Embeddings, Whisper"),
  skill("Web & Mobile", "React, React Native, NestJS, Spring Boot, Vert.x, Swift/iOS, Kotlin/Android"),
  skill("DevOps", "Docker, Terraform, Ansible, GitHub Actions, CI/CD, AWS, Prometheus/Grafana"),
  skill("Blockchain & DLT", "Cardano (eUTxO), Plutus, CIP standards, Consensus protocols, Wallet standards"),
  skill("Leadership", "Team building, Technical strategy, Architecture docs, Workshop facilitation"),
)

#section("Education")

#grid(
  columns: (1fr, auto),
  [*M.A. International Business* · #text(fill: muted)[Hult International Business School, San Francisco]],
  text(fill: muted)[2014 – 2015]
)
#v(2pt)
#grid(
  columns: (1fr, auto),
  [*B.Sc. Computer Science* · #text(fill: muted)[DHBW Stuttgart, Germany]],
  text(fill: muted)[2011 – 2014]
)
// Master-Lebenslauf (Deutsch) — vollständige Version mit allen Details
// Deutsche Übersetzung von master-cv.typ. Struktur identisch halten.

#set page(margin: (x: 1.4cm, y: 1.2cm))
#set text(font: "Helvetica Neue", size: 9.5pt, fill: rgb("#1f2937"), lang: "de")
#set par(justify: true, leading: 0.55em)

#let accent = rgb("#0d9488")
#let muted = rgb("#6b7280")

// Header
#align(center)[
  #text(size: 22pt, weight: "bold", tracking: 0.5pt)[WILLI WOLFF]
  #v(2pt)
  #text(size: 10pt, fill: muted)[Software Engineer · Technical Architect · Builder]
  #v(4pt)
  #text(size: 9pt, fill: muted)[Berlin, Deutschland · Deutsch & Englisch]
  #v(2pt)
  #link("mailto:wolff.willi@gmail.com")[#text(size: 9pt, fill: accent)[E-Mail]] #h(6pt) #link("https://linkedin.com/in/wwolff")[#text(size: 9pt, fill: accent)[LinkedIn]] #h(6pt) #link("https://github.com/will-break-it")[#text(size: 9pt, fill: accent)[GitHub]]
]

// Abschnittsüberschrift
#let section(title) = {
  v(10pt)
  line(length: 100%, stroke: 0.3pt + rgb("#e5e7eb"))
  v(6pt)
  text(size: 9pt, weight: "bold", fill: accent, tracking: 1pt)[#upper(title)]
  v(5pt)
}

// Erfahrungseintrag
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

// Aufzählungspunkt
#let b(content) = {
  grid(
    columns: (10pt, 1fr),
    gutter: 4pt,
    text(fill: accent)[•],
    content
  )
  v(1pt)
}

// === INHALT ===

#section("Profil")

Software Engineer mit über 10 Jahren Erfahrung, von Enterprise (Deloitte) über Blockchain-Infrastruktur (Bitcoin/Cardano) bis zu Mobile und IoT. Aktuell technischer Architekt für ein Byzantine-resistentes Pub/Sub-Netzwerk bei IOG. Gründer-DNA, zuhause in verteilten Systemen und sicherer Software. Ich übernehme Probleme End-to-End: früh eine grobe, lauffähige Version bauen, Risiken aufdecken, dann iterieren. Am besten arbeite ich in kleinen Teams an anspruchsvollen Problemen und übernehme gerne auch Aufgaben über die reine Entwicklung hinaus, wenn ein Projekt es braucht.

#section("Berufserfahrung")

#exp("Technischer Architekt – Byzantine-Resistant PubSub Network", "Feb 2026 – Heute", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Auf Vertragsbasis])[
  Leite Forschung und Entwicklung eines Byzantine-resistenten Publish/Subscribe-Netzwerks — formale Verifikation eines Forschungsvorschlags und Entwicklung eines Prototyps.
  #v(2pt)
  #b[*Technische Leitung:* Leite ein Team von 4 Ingenieuren und Forschern beim Entwurf eines Byzantine-resistenten Pub/Sub-Overlay-Netzwerks]
  #b[*Formale Verifikation:* Formale Verifikation des #link("https://www.iog.io/papers/securecyclon-dependable-peer-sampling")[#text(fill: accent)[SecureCyclon]] Peer-Sampling-Protokoll-Stacks und Entwicklung eines funktionsfähigen Prototyps mittels Spec-Driven Development (#link("https://github.com/github/spec-kit")[#text(fill: accent)[spec-kit]])]
  #b[*Protokollsicherheit:* Neubewertung von Peer-Sampling-Protokollen mit spezifischen Sicherheitseigenschaften]
]

#exp("Technischer Architekt – Ouroboros Leios", "Nov 2024 – Feb 2026", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Auf Vertragsbasis])[
  Leitete Forschung und Entwicklung von Ouroboros Leios, einem Hochdurchsatz-Overlay-Protokoll für die Cardano Blockchain, koordinierte ein cross-funktionales Team und trieb die Umsetzung Richtung Mainnet voran.
  #v(2pt)
  #b[*Technische Leitung & Teamkoordination:* Leite ein Team von 8 Forschern und Engineers über formale Methoden, Protokolldesign und Prototypentwicklung hinweg]
  #b[*Richtungsvorgabe:* Übersetzte offene Forschung in eine umsetzbare Roadmap — verfasste #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]] #linebreak() (Cardano Improvement Proposal, Industrie-RFC vergleichbar mit Bitcoins BIPs oder IETF-Standards)]
  #b[*Architektur & Strategie:* Entwarf einen simulationsgetriebenen Ansatz zur Validierung des Protokollverhaltens vor dem Mainnet; erstellte ein Decision-Log zur Nachverfolgung architektonischer Entscheidungen und deren Begründung]
  #b[*Cross-Org-Koordination:* Verbinde Forscher formaler Methoden, Protokoll-Engineers und Produktteams — navigiere komplexe technische Trade-offs]
  #b[*Ansprechpartner:* Technischer Ansprechpartner des Projekts: präsentierte Fortschritte und Ergebnisse in großen internen Reviews sowie öffentlich über monatliche Demo- und Review-Sessions für Community und technisches Publikum (5k+ Aufrufe pro Session, über 1,5 Jahre), die Projekt-#link("http://leios.cardano-scaling.org/")[#text(fill: accent)[Website]] und regelmäßige Reports]
  #b[*MEV-Analyse:* Untersuchte #link("https://ethereum.org/en/developers/docs/mev/")[#text(fill: accent)[MEV]]-Auswirkungen (Miner Extractable Value) auf Leios mittels #link("https://leios.cardano-scaling.org/mempool-viz/")[#text(fill: accent)[Mempool-Analyse und -Simulation]]]
  #b[*Workshop-Leitung:* Organisierte einen einwöchigen On-Site-Workshop, der offene Forschungsfragen reduzierte und das Team auf die Umsetzungsstrategie ausrichtete]
]

#exp("Technischer Architekt – Lace Wallet", "Nov 2022 – Nov 2024", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Auf Vertragsbasis])[
  Leitete die technische Architektur und Backend-Infrastruktur für Lace, ein Cardano-Wallet der nächsten Generation, mit erheblichen Performance-Verbesserungen und neuen umsatzgenerierenden Features.
  #v(2pt)
  #b[*Backend-Neuarchitektur:* Von poll-basierter auf event-getriebene Architektur umgestellt — 45% weniger Latenz, 60%+ Einsparungen bei Infrastrukturkosten]
  #b[*Go-Live:* Brachte das neu architektierte Backend für den öffentlichen Lace-1.0-Launch in Produktion]
  #b[*Eigener Chain-Indexer:* Indexer mit Bloom-Filtern und credential-basiertem Indexing entwickelt; 2.000+ Tx/s Ingest-Kapazität, Wallet-Sync unter einer Sekunde]
  #b[*Industriestandards:* Verfasste einen #link("https://github.com/will-break-it/wallet-architecture/tree/main/docs/CIP/CIP-XXXX")[#text(fill: accent)[CIP-Vorschlag]] für Wallet-Indexing-Standards, der im Ökosystem übernommen wurde]
  #b[*Produktleitung:* Leitete ein 7-köpfiges cross-funktionales Team (3 FE, 2 BE, 1 QA, 1 PM) bei der Auslieferung des MetaDex-Swap-Features]
  #b[*Gemeinsame Tools:* Entwickelte Bibliotheken zur Transaktionskonstruktion und event-getriebene Patterns, die von mehreren Produktteams übernommen wurden]
  #b[*Technische Innovation:* Entwickelte einen Hintergrund-Web-Worker-Sync-Ansatz, der später vom Team als Standard-Pattern übernommen wurde]
]

#exp("Solutions Architect", "Nov 2021 – Nov 2022", [#link("https://www.iog.io/")[Input Output Global (IOG)] · Auf Vertragsbasis])[
  Entwarf Blockchain-Lösungen und schulte Enterprise-Partner in Cardanos technischer Architektur.
  #v(2pt)
  #b[*Smart-Contract-Architektur:* Entwarf den kompletten Plutus-Stack für eine Collateralized-Debt-Position-(CDP)-Plattform]
  #b[*Technische Schulung:* Führte Workshops für 100+ Amazon-Engineers zum eUTxO-Modell, Smart Contracts und dApp-Patterns durch]
  #b[*Wissenstransfer:* Erstellte Schulungsmaterialien und praktische Übungen für Blockchain-Ausbildung]
]

#exp("Senior Software Engineer", "Feb 2020 – Nov 2021", "Mobility Data Lab GmbH, Berlin")[
  Entwickelte IoT- und Datenverarbeitungssysteme für eine Connected-Vehicle-Plattform.
  #v(2pt)
  #b[*Fleet Management:* Lieferte eine komplette OTA-Flotten-Update-Pipeline für Connected-Vehicle-Hardware]
  #b[*IoT-Plattform:* Entwickelte einen OTA-Update-Mechanismus (Rust embedded, Vert.x-Backend) mit Rollback-Fähigkeit]
  #b[*Analytics:* Entwarf eine Echtzeit-Datenpipeline mit ELK-Stack für die Carsharing-Dienste Miles und Share Now]
  #b[*Go-Live:* Pilot mit 20+ Fahrzeugen produktiv gestartet]
]

#exp("Software Engineer → Lead Engineer & Senior Software Engineer", "Sep 2016 – Nov 2019", link("https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html")[Deloitte, Austin TX → Ulm, Deutschland])[
  Startete als Software Engineer in Austin, Texas, wechselte dann nach Ulm, Deutschland als Senior Software Engineer, wo ich zum Lead befördert wurde, um eine groß angelegte Legacy-System-Migration für einen großen deutschen Versicherer zu leiten.
  #v(2pt)
  #b[*Migrations-Toolchain:* Redesign der Cobol-zu-Java-Architektur für eine funktionale Sprache (ISA); 3-stufige Pipeline: Parser → AST → Java-Codegen, plus Runtime-Emulationsschicht zur Wahrung des ursprünglichen ISA/IDM-Verhaltens]
  #b[*Business Impact:* Sparte dem Kunden jährlich 6 Mio. € an Lizenzkosten]
  #b[*Go-Lives:* Zwei Produktiv-Go-Lives in separaten Migrationsprojekten: ein großer deutscher Versicherer sowie Pensionsfonds und Sozialversicherung eines US-Bundesstaats]
  #b[*Team-Wachstum:* Innerhalb von 24 Monaten zum Lead befördert; Team von 3 auf 20 Engineers skaliert]
  #b[*Globale Koordination:* Koordination mit Offshore-Teams in Indien; etablierte organisationsweit übernommene Teststandards]
]

#exp("Co-Founder & CTO", "Feb 2015 – Sep 2016", link("https://cityxcape.com/")[CityXcape Inc., San Francisco])[
  Technischer Mitgründer einer Social-Discovery-Plattform zum Erkunden von Städten über Community-getriebene Empfehlungen.
  #v(2pt)
  #b[*Produktentwicklung:* Entwickelte eine native iOS-App (Swift) und ein Django/Rails-Backend vom Konzept bis zum App-Store-Launch]
  #b[*Fundraising:* Sammelte ~150k € Seed-Finanzierung von Angel-Investoren ein]
  #b[*Teamleitung:* Leitete ein technisches Team von 2-3 Vertragsentwicklern; definierte Produktvision und Roadmap]
]

#section("Veröffentlichungen")

#exp("CIP-0164: Ouroboros Leios", "2025", "Cardano Improvement Proposal")[
  Kanonische Architektur- und Design-Spezifikation für Cardanos Hochdurchsatz-Overlay-Protokoll — ein offener Industrie-RFC vergleichbar mit Bitcoins BIPs und IETF-Standards. Nachzulesen unter #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]].
]

#section("Projekte")

#exp("Ouroboros Leios – Protokollarchitektur & CIP", "2024 – Heute", "Cardano Research")[
  Co-Autor der Protokollspezifikation und Architektur für Cardanos Durchsatzschicht der nächsten Generation.
  #v(2pt)
  #b[*CIP-Autorenschaft:* Hauptautor von #link("https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md")[#text(fill: accent)[CIP-0164]] — dem kanonischen Architektur-Design-Dokument, das Implementierungsteams leitet]
  #b[*Protokollspezifikation:* Übersetzte akademische Forschung in eine implementierbare Spezifikation mit konkreten Parametern und Trade-offs]
  #b[*Technische Dokumentation:* Erstellte eine umfassende #link("https://leios.cardano-scaling.org")[#text(fill: accent)[Dokumentations-Website]] zu Protokollmechanik, Simulationsergebnissen und Design-Begründungen]
]

#exp("Dump it! – KI-gestützte Notizen", "2023 – 2025", "iOS, Android, Web")[
  Plattformübergreifende Anwendung mit Ende-zu-Ende-Verschlüsselung und ausgefeilter KI-Verarbeitungspipeline.
  #v(2pt)
  #b[*Full-Stack:* Native iOS-(Swift/SwiftUI), Android-(Kotlin/Compose) und React-Web-App mit Feature-Parität]
  #b[*E2E-Verschlüsselung:* Diffie-Hellman-Schlüsselaustausch + AES-256-GCM + iOS Secure Enclave — kein Backend-Zugriff auf Nutzerdaten]
  #b[*KI-Pipeline:* Zweiphasige LLM-Verarbeitung (Claude für Intent, pgvector für semantische Suche, Whisper für Speech-to-Text)]
  #b[*Architektur:* Event-sourced mit SSE-Streaming; offline-first mit persistenter Queue-Synchronisation]
  #b[*Traction:* 5k+ Notizen, 200+ Nutzer, 70% wöchentliche Retention; ausgeliefert im App Store und bei Google Play]
]

#exp("Pagebase – Freelance-Entwicklungsagentur", "2024 – Heute", "Gründer")[
  Berliner Agentur, die Supabase/PostgreSQL-Backends, Web- und Mobile-Apps sowie KI-Automatisierung baut.
  #v(2pt)
  #b[*Stack:* Supabase, PostgreSQL, React/React Native, Edge Functions, CI/CD]
]

#exp("Drip Dropz – NFT-Marktplatz", "2022 – 2024", "Cardano")[
  Produktive NFT-Handelsplattform von Grund auf entwickelt.
  #v(2pt)
  #b[*Frontend:* React/TypeScript-SPA mit CIP-30-Wallet-Integration und Hintergrund-Web-Worker-Sync]
  #b[*Smart Contracts:* Plutus-Integration für Bieten, Verkaufen, Swappen und Order-Management]
  #b[*Launch:* 10k+ NFT-Listings; erster Umsatz innerhalb von 48 Stunden]
  #b[*DevOps:* TDD-Praktiken mit Jest; CI/CD-Pipeline für zuverlässige Deployments]
]

#exp("Berlin Pool – Stakepool-Betrieb", "2021 – 2024", "Cardano-Infrastruktur")[
  Betrieb von Cardano-Consensus-Nodes zur Netzwerk-Dezentralisierung.
  #v(2pt)
  #b[*Node-Betrieb:* 2.000+ Mainnet-Blöcke produziert; 99,9% Uptime; 15M+ ADA Delegation]
  #b[*Sicherheit:* Air-gapped Cold-Key-Storage; sichere Key-Rotation-Verfahren]
  #b[*Infrastruktur:* Automatisiertes Deployment mit Docker, Ansible, Terraform; Prometheus/Grafana-Monitoring]
]

#section("Technologien")

#let skill(category, items) = {
  text(weight: "bold", size: 9pt)[#category]
  linebreak()
  text(fill: muted, size: 9pt)[#items]
}

#grid(
  columns: (1fr, 1fr),
  gutter: (12pt, 6pt),
  skill("Sprachen", "TypeScript (Experte), Rust, Swift, Java/Kotlin, Python, Haskell/Plutus"),
  skill("Infrastruktur", "Verteilte Systeme, Event-getrieben, PostgreSQL, Redis, gRPC, Microservices"),
  skill("Sicherheit", "E2E-Verschlüsselung, Diffie-Hellman, AES-256, Secure Enclave/TEE, Key Management"),
  skill("KI/ML", "LLM-Integration (Claude, GPT-4), Vektorsuche, Embeddings, Whisper"),
  skill("Web & Mobile", "React, React Native, NestJS, Spring Boot, Vert.x, Swift/iOS, Kotlin/Android"),
  skill("DevOps", "Docker, Terraform, Ansible, GitHub Actions, CI/CD, AWS, Prometheus/Grafana"),
  skill("Blockchain & DLT", "Cardano (eUTxO), Plutus, CIP-Standards, Consensus-Protokolle, Wallet-Standards"),
  skill("Führung", "Teamaufbau, Technische Strategie, Architektur-Dokumentation, Workshop-Leitung"),
)

#section("Ausbildung")

#grid(
  columns: (1fr, auto),
  [*M.A. International Business* · #text(fill: muted)[Hult International Business School, San Francisco]],
  text(fill: muted)[2014 – 2015]
)
#v(2pt)
#grid(
  columns: (1fr, auto),
  [*B.Sc. Informatik* · #text(fill: muted)[DHBW Stuttgart, Deutschland]],
  text(fill: muted)[2011 – 2014]
)

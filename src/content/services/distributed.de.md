---
slug: verteilte-systeme-blockchain
title: "Verteilte Systeme und Blockchain-Engineering"
description: "Freiberuflicher Architekt in Berlin für Protokolldesign, event-getriebene Backends und Chain-Indexing. Fünf Jahre Cardano bei IOG, von Wallet-Infrastruktur bis Konsensforschung."
lead: "Protokolldesign, event-getriebene Backends und Chain-Indexing. Fünf Jahre Cardano bei IOG, von Wallet-Infrastruktur bis Konsensforschung, davor Enterprise-Migrationen."
order: 2
updated: 2026-11-20
brief: blockchain_distributed
related: [lace, leios, deloitte]
proof:
  - label: "CIP-0164, die Spezifikation von Ouroboros Leios"
    href: "https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md"
  - label: "Wallet-Indexing-Architektur, veröffentlicht als CIP und Problem Statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Cardano PubSub, ein Byzantine-resistentes Publish/Subscribe-Netzwerk"
    href: "https://pubsub.cardano-scaling.org/"
---

## Was ich übernehme

- **Architektur für Systeme, die keine Events verlieren dürfen.** Event-getriebene Backends, CQRS und Event Sourcing, Push statt Polling.
- **Chain-Indexing und Wallet-Infrastruktur.** Indexer, Sync-Protokolle und Transaktionsaufbau auf Cardano und dem eUTxO-Modell.
- **Protokoll- und Spezifikationsarbeit.** Forschung in eine Spezifikation überführen, nach der ein Team implementieren kann, mit dokumentierten Abwägungen.
- **Smart-Contract-Architektur.** Plutus-Contracts und der Off-Chain-Code darum herum.
- **Technische Führung bei einem schwierigen Problem.** Ein kleines Team aus Engineers und Forschern zu einer Entscheidung und einem lauffähigen Prototyp führen.

## Wie ich arbeite

Ich schreibe das Design zuerst auf, in einer Form, über die sich streiten lässt: Problemstellung, Optionen, Entscheidung und Begründung. Dann baue ich die kleinste Version, die die riskante Annahme bestätigen oder widerlegen kann, meist eine Simulation oder ein Prototyp, bevor die eigentliche Umsetzung beginnt.

## Wo ich das gemacht habe

- **Lace Wallet, IOG.** Ich habe die Neuarchitektur vom Polling- zum event-getriebenen Backend geleitet: 45 % weniger Latenz und über 60 % geringere Infrastrukturkosten. Der eigene Chain-Indexer verarbeitet mehr als 2.000 Transaktionen pro Sekunde.
- **Ouroboros Leios, IOG.** Ich habe Forschung und Entwicklung mit einem achtköpfigen Team geleitet und bin Hauptautor von CIP-0164, der Spezifikation für Cardanos Hochdurchsatz-Protokoll.
- **Cardano PubSub, IOG.** Ich habe ein vierköpfiges Team durch die formale Verifikation eines Peer-Sampling-Protokolls geführt und den Prototyp gebaut.
- **Amazon, über IOG.** Workshops für mehr als 100 Engineers zum eUTxO-Modell und Unterstützung beim Deployment-Konzept für Cardano- und Midnight-Nodes.
- **Mobility Data Lab.** Eine Over-the-Air-Update-Pipeline für vernetzte Fahrzeuge, mit Embedded Rust auf dem Gerät und Rollback.

## Wann ich gut passe

Sie haben ein System, bei dem Korrektheit und Durchsatz beide zählen, und eine Entscheidung vor sich, die später teuer zu ändern ist. Sie soll auf Belegen beruhen und aufgeschrieben sein.

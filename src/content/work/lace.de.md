---
slug: lace-wallet-neuarchitektur
title: "Neuarchitektur des Lace-Wallet-Backends: von Polling zu Events"
description: "Fallstudie: event-getriebene Neuarchitektur des Cardano-Wallets Lace bei IOG. 45 % weniger Latenz, über 60 % geringere Infrastrukturkosten, Indexing mit 2.000+ Tx/s."
lead: "Lace ist das Light Wallet von IOG für Cardano. Das Backend fragte die Chain für jedes Wallet per Polling ab. Ich habe den Umbau zu einem event-getriebenen Design geleitet: 45 % weniger Latenz und über 60 % geringere Infrastrukturkosten."
order: 2
updated: 2026-11-20
brief: blockchain_distributed
related: [distributed]
facts:
  client: "Input Output Global (IOG)"
  role: "Technical Architect"
  period: "November 2022 bis November 2024"
  team: "Leitung eines 7-köpfigen Teams für das Swap-Feature"
  stack: "TypeScript, CQRS, Event Sourcing, Bloom-Filter"
  result: "45 % weniger Latenz, über 60 % geringere Infrastrukturkosten, 2.000+ Tx/s"
proof:
  - label: "Wallet-Indexing-Architektur: CIP-Entwurf und Problem Statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Lace Wallet"
    href: "https://www.lace.io/"
---

## Das Problem

Ein Light Wallet betreibt keinen eigenen Node. Es fragt ein Backend, was mit seinen Adressen passiert ist. Das Backend von Lace antwortete per Polling: Wallets fragten immer wieder, ob sich etwas geändert hat, und das Backend fragte jedes Mal die Chain-Daten ab.

Dieses Design wird mit jedem Nutzer langsamer und teurer. Die meisten Anfragen liefern nichts Neues, und die wichtigen kommen spät an.

## Was ich gemacht habe

Ich habe zwei Jahre lang die technische Architektur und die Backend-Infrastruktur von Lace geleitet.

- **Von Pull zu Push.** Das Backend folgt der Chain jetzt einmal und teilt den Wallets mit, was sich geändert hat. Grundlage sind CQRS und Event Sourcing: Die Chain ist ein Strom von Events, und die Sicht jedes Wallets ist eine Projektion davon.
- **Ein eigener Chain-Indexer.** Er nutzt Bloom-Filter und Credential-basiertes Indexing, um schnell zu entscheiden, welche Transaktionen welche Wallets betreffen. Er verarbeitet mehr als 2.000 Transaktionen pro Sekunde, ein Wallet synchronisiert in unter einer Sekunde.
- **Sync im Hintergrund-Worker.** Die Synchronisation läuft in einem Web Worker, damit die Oberfläche flüssig bleibt. Das Team hat das später als Standardmuster übernommen.
- **Gemeinsame Bausteine.** Bibliotheken für den Transaktionsaufbau und event-getriebene Muster, die andere Produktteams übernommen haben.

Das neue Backend ging zum öffentlichen Start von Lace 1.0 in Produktion.

## Leitung des Swap-Features

Außerdem habe ich ein siebenköpfiges Team geleitet, drei Frontend-Engineers, zwei Backend-Engineers, ein QA-Engineer und ein Produktmanager, das das Swap-Feature MetaDex geliefert hat.

## Aufgeschrieben, nicht nur gebaut

Das Design ist als Entwurf eines Cardano Improvement Proposal und als Problem Statement veröffentlicht. Jeder kann nachlesen, warum welche Entscheidung getroffen wurde, und widersprechen.

## Ergebnis

45 % weniger Latenz und über 60 % geringere Infrastrukturkosten nach dem Umstieg auf das event-getriebene Backend, dazu ein Indexer mit Reserven für mehr als 2.000 Transaktionen pro Sekunde.

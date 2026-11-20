---
slug: ouroboros-leios-cip-0164
title: "Ouroboros Leios: von offener Forschung zu CIP-0164"
description: "Fallstudie: Leitung von Forschung und Entwicklung für Ouroboros Leios, Cardanos Hochdurchsatz-Protokoll, bei IOG, und Autorschaft von CIP-0164, der öffentlichen Spezifikation."
lead: "Ouroboros Leios ist das Protokoll, das Cardanos Durchsatz erhöht. Ich habe Forschung und Entwicklung bei IOG mit einem achtköpfigen Team geleitet und bin Hauptautor von CIP-0164, der Spezifikation, nach der die Teams implementieren."
order: 3
updated: 2026-11-20
brief: blockchain_distributed
related: [distributed]
facts:
  client: "Input Output Global (IOG)"
  role: "Technical Architect. Seit Oktober 2026 wieder als Engineer und Architekt bei Leios"
  period: "November 2024 bis Februar 2026"
  team: "8 Forscher und Engineers"
  stack: "Protokolldesign, Simulation, Agda, technisches Schreiben"
  result: "CIP-0164, eine öffentliche Spezifikation mit konkreten Parametern"
proof:
  - label: "CIP-0164: Ouroboros Leios"
    href: "https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md"
  - label: "Projektseite mit Simulator und Dokumentation"
    href: "https://leios.cardano-scaling.org/"
  - label: "Mempool-Analyse und Simulation"
    href: "https://leios.cardano-scaling.org/mempool-viz/"
---

## Das Problem

Leios begann als Forschungspapier. Ein Papier beweist, dass ein Protokoll funktionieren kann. Es sagt nicht, welche Parameter zu wählen sind, was das Netzwerk tragen kann, wie sich das Design unter Angriffen verhält oder was ein Engineering-Team zuerst bauen soll.

Zwischen dem Papier und einem Mainnet-Release lag eine lange Liste offener Fragen, verteilt auf Forscher für formale Methoden, Protokoll-Engineers und Produktteams, die jeweils einen anderen Teil sahen.

## Was ich gemacht habe

Ich habe fünfzehn Monate lang Forschung und Entwicklung geleitet und war der technische Ansprechpartner für das Projekt.

- **Forschung in eine Roadmap überführt.** Ich habe die offenen Fragen in einen umsetzbaren Plan übersetzt und CIP-0164 geschrieben, das Cardano Improvement Proposal, das die Architektur festlegt. Ein CIP ist ein offener Industrie-RFC, vergleichbar mit Bitcoins BIPs oder IETF-Standards.
- **Zuerst per Simulation validiert.** Wir haben das Protokollverhalten in der Simulation geprüft, bevor wir uns auf eine Implementierung festgelegt haben, und ich habe ein Entscheidungslog mit jeder Architekturentscheidung und ihrer Begründung geführt.
- **Die Disziplinen verbunden.** Ich habe zwischen Forschern für formale Methoden, Protokoll-Engineers und Produktteams vermittelt, um Abwägungen zu klären, die keine Gruppe allein entscheiden konnte.
- **Angriffsfläche analysiert.** Ich habe den Einfluss von MEV auf Leios über Mempool-Analyse und eine interaktive Simulation untersucht.
- **Den Workshop geleitet, der das Team entblockt hat.** Ein einwöchiger Workshop vor Ort hat die offenen Forschungsfragen reduziert und das Team auf eine Implementierungsstrategie ausgerichtet.

## Öffentlich arbeiten

Ich habe den Fortschritt in großen internen Reviews und in monatlichen öffentlichen Demo- und Review-Sessions vorgestellt, mit rund 5.000 Aufrufen pro Session über anderthalb Jahre. Die Projekt-Website mit interaktivem Simulator und der für das Web aufbereiteten formalen Spezifikation ist aus derselben Arbeit entstanden.

## Ergebnis

CIP-0164 ist das maßgebliche Designdokument für Leios. Es gibt den Implementierungsteams konkrete Parameter und dokumentierte Abwägungen statt eines Papiers, das sie auslegen müssen. Seit Oktober 2026 bin ich wieder im Projekt und baue es in Richtung Mainnet.

---
slug: ki-agenten-automatisierung
title: "KI-Agenten und Automatisierung, die sich prüfen lassen"
description: "Freelancer in Berlin für LLM-Pipelines, die Dokumente und E-Mails lesen, Daten extrahieren und Datensätze vorbereiten. Ein Mensch prüft, bevor gespeichert wird."
lead: "Ich baue Pipelines auf Basis großer Sprachmodelle, die Dokumente und E-Mails lesen, das Wesentliche extrahieren und den Datensatz vorbereiten. Ein Mensch gibt frei, bevor etwas in ein System geschrieben wird, auf das Sie sich verlassen."
order: 1
updated: 2026-11-20
brief: ai_automation
related: [operando]
facts:
  stack: "TypeScript, Claude API, OpenRouter, MCP, Structured Outputs, Zod, pgvector, Whisper, Microsoft Graph, HubSpot API"
proof:
  - label: "Operando Deal Sourcing, produktiv seit September 2026"
    href: "https://operando.de"
  - label: "txflow: ein Sprachmodell schreibt Spezifikationen, Rust-Code prüft sie"
    href: "https://txflow.fun"
  - label: "Der MCP-Server dieser Website"
    href: "https://williwolff.com/mcp"
---

## Was ich übernehme

- **Eingang von Dokumenten und E-Mails.** PDFs, Anhänge und Postfächer lesen und daraus strukturierte Datensätze in CRM, ERP oder Datenbank machen.
- **Agenten mit Werkzeugen.** Agenten, die Ihre APIs aufrufen, mit typisierten Ein- und Ausgaben und einer klaren Liste dessen, was sie dürfen und was nicht.
- **MCP-Server und Integrationen.** Ein bestehendes Produkt oder eine Datenquelle für Assistenten wie Claude und ChatGPT nutzbar machen.
- **Suche über eigene Inhalte.** Embeddings, Vektorsuche und Spracherkennung, wenn das Wiederfinden das eigentliche Problem ist.

## Wie ich es baue

Das Modell ist der einfache Teil. Die Arbeit steckt in allem darum herum.

1. **Typisierte Ausgaben.** Jede Modellantwort wird gegen ein Schema geprüft. Was nicht passt, wird verworfen und nicht geraten.
2. **Fremde Eingaben bleiben Daten.** Text aus einer E-Mail oder einem PDF wird nie als Anweisung befolgt.
3. **Ein Mensch entscheidet.** Die Pipeline bereitet vor, ein Mensch prüft, erst dann wird gespeichert oder gesendet.
4. **Gemessen statt vermutet.** Ein fester Satz echter Beispiele zeigt, ob eine Änderung die Extraktion verbessert oder verschlechtert hat.

Ich beginne mit einer ersten Version auf Ihren echten Dokumenten. So zeigen sich die Risiken, bevor das Budget verbraucht ist.

## Wo ich das gemacht habe

Für Operando Partners habe ich eine Pipeline gebaut, die Deal-Teaser aus dem E-Mail-Eingang liest, mit Claude die Kennzahlen aus den PDFs zieht und HubSpot-Leads als Entwurf anlegt, die das Team prüft. Sie läuft seit September 2026 produktiv.

In Dump it!, meiner eigenen Notiz-App, klassifizierte eine zweistufige Pipeline die Absicht mit Claude, durchsuchte Notizen mit pgvector und transkribierte Sprache mit Whisper. Für Hausnummer habe ich einen Import gebaut, der Kennzahlen einer Immobilienanzeige aus einem eingefügten Link in ein strukturiertes Modell überführt.

## Was es nicht ist

Ich verkaufe keine Plattform und kein Chatbot-Produkt. Sie bekommen Code in Ihrem Repository, der auf Ihrer Infrastruktur läuft und den Ihr Team lesen und ändern kann.

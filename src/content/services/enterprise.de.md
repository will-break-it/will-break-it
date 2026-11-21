---
slug: enterprise-software-geschaeftskritisch
title: "Enterprise-Software für geschäftskritische Systeme"
description: "Freelance Engineer und Architekt in Berlin für Enterprise-Systeme, die nicht ausfallen dürfen: Legacy-Migration, Umbau und verifizierte Software."
lead: "Für Systeme, von denen ein Unternehmen jeden Tag abhängt: Kernsysteme von Versicherern und Pensionsfonds, ein Wallet-Backend in Produktion, Software, die Fahrzeuge auf der Straße aktualisiert. Ich baue, migriere und modernisiere sie, mit dem Nachweis, dass sie weiterhin tun, was sie taten."
order: 3
updated: 2026-11-21
brief: backend_architecture
related: [deloitte, lace]
facts:
  stack: "Java, Spring Boot, Vert.x, TypeScript, Node.js, NestJS, PostgreSQL, Redis, Docker, Terraform, AWS"
proof:
  - label: "Wallet-Indexing-Architektur, veröffentlicht als CIP und Problem Statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Deloitte Systems Delivery and Modernization"
    href: "https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html"
  - label: "SecureCyclon, das Peer-Sampling-Protokoll, das mein Team formal verifiziert hat"
    href: "https://www.iog.io/papers/securecyclon-dependable-peer-sampling"
---

## Was ich übernehme

- **Enterprise-Backends.** Services und Datenpipelines für führende Systeme, in Java und TypeScript, gebaut für jahrelangen Betrieb.
- **Legacy-Migration.** Alten Code mit Werkzeugen auf eine aktuelle Plattform bringen, statt ihn von Hand neu zu schreiben: Parsing, Codegenerierung und eine Laufzeit, die das alte Verhalten bewahrt.
- **Umbau eines laufenden Systems.** Den Teil ersetzen, der Sie begrenzt, zum Beispiel Polling durch Events, während das System in Produktion bleibt.
- **Software, die verifiziert und nicht nur getestet ist.** End-to-End-Tests, die Neu mit Alt vergleichen, Spezifikationen vor dem Code und, wo es sich lohnt, formale Verifikation.
- **Architektur-Reviews und technische Leitung.** Das System lesen, wie es ist, die Optionen mit ihren Abwägungen aufschreiben und die Umstellung mit Ihrem Team bis in Produktion führen.

## Wie ich arbeite

Ich beginne mit dem System, wie es ist: dem Code, den Daten und den Störungen. Dann schreibe ich ein Design, über das sich streiten lässt, und baue den riskantesten Teil zuerst. Alt und Neu laufen nebeneinander und werden verglichen, bevor umgeschaltet wird.

## Wo ich das gemacht habe

- **Deloitte, für einen großen deutschen Versicherer.** Als Lead Engineer habe ich die programmatische Migration von 16 Millionen Zeilen Mainframe-Code nach Java geleitet. Sie spart dem Versicherer 6 Millionen EUR Lizenzkosten pro Jahr. Das Team wuchs von 3 auf 20 Engineers.
- **Deloitte, für Pensionsfonds und Sozialversicherung eines US-Bundesstaats, Target und Walmart.** Mainframe-Migrationen nach Java mit Cobol-Parsing, eigener Laufzeit und End-to-End-Tests, darunter ein zweiter Go-Live.
- **Lace Wallet, IOG.** Ich habe den Umbau des Backends von Polling auf Events geleitet: 45 % weniger Latenz und über 60 % geringere Infrastrukturkosten, produktiv zum öffentlichen Start von Lace 1.0.
- **Cardano PubSub, IOG.** Ich habe ein Team von vier Personen durch die formale Verifikation eines Peer-Sampling-Protokolls geführt und den Prototyp aus der Spezifikation gebaut.
- **Mobility Data Lab.** Eine Over-the-Air-Update-Pipeline für vernetzte Fahrzeuge, mit Embedded Rust auf dem Gerät und Rollback, gestartet in einem Pilot mit mehr als 20 Fahrzeugen.

Die Arbeit bei Deloitte war als Angestellter, im Team. Ich nenne sie, weil dieselben Fähigkeiten heute für Projektarbeit gelten.

## Wann ich gut passe

Ihr System muss weiterlaufen, während es sich ändert, und ein Fehler wäre teuer. Sie wollen jeden Schritt geprüft gegen das, was das System vorher tat, und die Entscheidungen schriftlich.

---
slug: mainframe-java-migration
title: "16 Millionen Zeilen Mainframe-Code nach Java migriert"
description: "Fallstudie: programmatische Cobol- und Mainframe-Migrationen nach Java bei Deloitte für einen deutschen Versicherer, einen US-Pensionsfonds, Target und Walmart. 6 Mio. EUR Ersparnis pro Jahr."
lead: "Bei Deloitte habe ich an programmatischen Migrationen gearbeitet, die Mainframe-Anwendungen nach Java überführen, ohne sie von Hand neu zu schreiben. Als Lead Engineer habe ich die Migration von 16 Millionen Zeilen Code für einen deutschen Versicherer geleitet. Sie spart dem Kunden 6 Millionen EUR Lizenzkosten pro Jahr."
order: 4
updated: 2026-11-20
brief: backend_architecture
related: [enterprise]
facts:
  client: "Deloitte, für einen großen deutschen Versicherer, einen US-Pensionsfonds mit Sozialversicherungsbehörde, Target und Walmart"
  role: "Software Engineer, dann Lead Engineer (angestellt)"
  period: "September 2016 bis November 2019"
  team: "Von 3 auf 20 Engineers gewachsen, mit Offshore-Teams in Indien"
  stack: "Java, Cobol, Toolchain aus Parser und Codegenerierung, Laufzeit-Emulation"
  result: "16 Mio. Zeilen migriert, 6 Mio. EUR Lizenzkosten pro Jahr gespart, zwei Go-Lives"
proof:
  - label: "Deloitte Systems Delivery and Modernization"
    href: "https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html"
---

## Das Problem

Große Versicherer, Pensionsfonds und Händler betreiben ihre Kernsysteme noch auf Mainframes. Der Code ist Jahrzehnte alt, die Lizenzen sind teuer, und die Menschen, die ihn pflegen können, gehen in Rente. Millionen Zeilen von Hand neu zu schreiben dauert Jahre und bringt neue Fehler in eine Logik, die lange korrekt war.

## Der Ansatz

Eine programmatische Migration übersetzt den alten Code maschinell. Das übersetzte Programm muss sich exakt wie das Original verhalten, damit der Fachbereich den Wechsel nicht bemerkt.

- **Eine dreistufige Toolchain.** Ein Parser liest den Legacy-Quelltext in einen Syntaxbaum, ein Codegenerator schreibt daraus Java. Diese Architektur habe ich beim deutschen Versicherer für eine funktionale Legacy-Sprache neu entworfen.
- **Eine Laufzeit, die sich wie der Mainframe verhält.** Eine Emulationsschicht bewahrt das Verhalten der ursprünglichen Umgebung, sodass das generierte Java dieselben Ergebnisse liefert.
- **Tests von Ende zu Ende.** Das migrierte System wird mit End-to-End-Tests gegen das Original geprüft. Die Teststandards, die wir gesetzt haben, wurden organisationsweit übernommen.

## Mein Anteil

Ich bin als Software Engineer in Austin, Texas, eingestiegen und habe vor Ort bei Target und Walmart an Mainframe-Migrationen nach Java gearbeitet: Cobol-Parsing, die eigene Laufzeit und End-to-End-Tests.

Danach bin ich nach Ulm gewechselt und wurde innerhalb von 24 Monaten zum Lead befördert. Dort habe ich die Migration für einen großen deutschen Versicherer geleitet, das Team von 3 auf 20 Engineers ausgebaut und mit Offshore-Teams in Indien koordiniert.

## Ergebnis

- 16 Millionen Zeilen Legacy-Code nach Java migriert.
- 6 Millionen EUR Lizenzkosten pro Jahr für den Versicherer gespart.
- Zwei Go-Lives in getrennten Projekten: der deutsche Versicherer sowie ein US-Pensionsfonds mit Sozialversicherungsbehörde.

Das war Arbeit als Angestellter bei Deloitte, im Team. Ich nenne sie hier, weil dieselben Fähigkeiten heute für Projektarbeit gelten: ein großes Legacy-System lesen, es sicher verändern und belegen, dass es weiterhin tut, was es tat.

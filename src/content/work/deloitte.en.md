---
slug: mainframe-to-java-migration
title: "Migrating 16 million lines of mainframe code to Java"
description: "Case study: programmatic Cobol and mainframe-to-Java migrations at Deloitte for a German insurer, a US state pension fund, Target and Walmart. 6M EUR saved per year."
lead: "At Deloitte I worked on programmatic migrations that move mainframe applications to Java without rewriting them by hand. As lead engineer I ran the migration of 16 million lines of code for a German insurer, which saves the client 6 million EUR a year in licence costs."
order: 4
updated: 2026-11-20
brief: backend_architecture
related: [enterprise]
facts:
  client: "Deloitte, for a major German insurer, a US state pension fund and social security agency, Target and Walmart"
  role: "Software Engineer, then Lead Engineer (employed)"
  period: "September 2016 to November 2019"
  team: "Grew from 3 to 20 engineers, with offshore teams in India"
  stack: "Java, Cobol, parser and code generation toolchain, runtime emulation"
  result: "16M lines migrated, 6M EUR licence cost saved per year, two production go-lives"
proof:
  - label: "Deloitte systems delivery and modernization"
    href: "https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html"
---

## The problem

Large insurers, pension funds and retailers still run core systems on mainframes. The code is decades old, the licences are expensive, and the people who can maintain it are retiring. Rewriting millions of lines by hand takes years and introduces new errors into logic that has been correct for a long time.

## The approach

A programmatic migration translates the old code by machine. The translated program must behave exactly like the original, so the business does not notice the change.

- **A three-stage toolchain.** A parser reads the legacy source into a syntax tree, and a code generator writes Java from it. I redesigned this architecture for a functional legacy language at the German insurer.
- **A runtime that behaves like the mainframe.** An emulation layer preserves the behaviour of the original environment, so the generated Java produces the same results.
- **Tests from end to end.** The migrated system is checked against the original with end-to-end tests. The testing standards we set were adopted across the organisation.

## My part

I joined as a software engineer in Austin, Texas, and worked onsite with Target and Walmart on mainframe-to-Java migrations: Cobol parsing, the custom runtime and end-to-end tests.

I then moved to Ulm, Germany, and was promoted to lead within 24 months. There I led the migration for a major German insurer, grew the team from 3 to 20 engineers and coordinated with offshore teams in India.

## Result

- 16 million lines of legacy code migrated to Java.
- 6 million EUR saved per year in licence costs for the insurer.
- Two production go-lives on separate projects: the German insurer, and a US state pension fund and social security agency.

This was work as an employee of Deloitte, in teams. I name it here because the same skills apply to contract work today: reading a large legacy system, changing it safely and proving that it still does what it did.

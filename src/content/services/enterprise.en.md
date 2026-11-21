---
slug: enterprise-mission-critical-software
title: "Enterprise software for mission-critical systems"
description: "Freelance engineer and architect in Berlin for enterprise systems that must not fail: legacy migrations, re-architecture and verified software."
lead: "For systems a business depends on every day: core insurance and pension platforms, a wallet backend in production, software that updates vehicles on the road. I build, migrate and re-architect them, with proof that they still do what they did."
order: 3
updated: 2026-11-21
brief: backend_architecture
related: [deloitte, lace]
facts:
  stack: "Java, Spring Boot, Vert.x, TypeScript, Node.js, NestJS, PostgreSQL, Redis, Docker, Terraform, AWS"
proof:
  - label: "Wallet indexing architecture, published as a CIP and a problem statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Deloitte systems delivery and modernization"
    href: "https://www.deloitte.com/global/en/services/consulting/services/systems-delivery-modernization.html"
  - label: "SecureCyclon, the peer-sampling protocol my team formally verified"
    href: "https://www.iog.io/papers/securecyclon-dependable-peer-sampling"
---

## What I take on

- **Enterprise backends.** Services and data pipelines for systems of record, in Java and TypeScript, built to be operated for years.
- **Legacy migration.** Moving old code to a current platform with tooling instead of rewriting it by hand: parsing, code generation and a runtime that keeps the old behaviour.
- **Re-architecture of a running system.** Replacing the part that limits you, for example polling with events, while the system stays in production.
- **Software that is verified, not just tested.** End-to-end tests that compare new with old, specifications written before the code and, where it is worth it, formal verification.
- **Architecture reviews and technical lead.** Reading the system as it is, writing down the options with their trade-offs, and leading the change with your team until it is in production.

## How I work

I start with the system as it is: the code, the data and the incidents. Then I write one design that others can argue with, and build the riskiest part first. Old and new run side by side and are compared before anything is switched over.

## Where I have done this

- **Deloitte, for a major German insurer.** As lead engineer I ran the programmatic migration of 16 million lines of mainframe code to Java. It saves the insurer 6 million EUR a year in licence costs. The team grew from 3 to 20 engineers.
- **Deloitte, for a US state pension fund and social security agency, Target and Walmart.** Mainframe-to-Java migrations with Cobol parsing, a custom runtime and end-to-end tests, including a second production go-live.
- **Lace wallet, IOG.** I led the re-architecture of the backend from polling to events: 45% lower latency and over 60% lower infrastructure cost, in production for the public Lace 1.0 launch.
- **Cardano PubSub, IOG.** I led a team of four through formal verification of a peer-sampling protocol stack and built the prototype from the specification.
- **Mobility Data Lab.** An over-the-air update pipeline for connected vehicles, with embedded Rust on the device and rollback, launched in a pilot with more than 20 vehicles.

The Deloitte work was as an employee, in teams. I name it because the same skills apply to contract work today.

## When I am a good fit

Your system must keep running while it changes, and a mistake would be expensive. You want each step checked against what the system did before, and the decisions written down.

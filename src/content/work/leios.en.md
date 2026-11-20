---
slug: ouroboros-leios-cip-0164
title: "Ouroboros Leios: from open research to CIP-0164"
description: "Case study: leading research and development of Ouroboros Leios, Cardano's high-throughput protocol, at IOG, and writing CIP-0164, its public specification."
lead: "Ouroboros Leios is the protocol that raises Cardano's throughput. I led its research and development at IOG with a team of eight and am the principal author of CIP-0164, the specification implementation teams build from."
order: 3
updated: 2026-11-20
brief: blockchain_distributed
related: [distributed]
facts:
  client: "Input Output Global (IOG)"
  role: "Technical Architect. Back on Leios as engineer and architect since October 2026"
  period: "November 2024 to February 2026"
  team: "8 researchers and engineers"
  stack: "Protocol design, simulation, Agda, technical writing"
  result: "CIP-0164, a public specification with concrete parameters"
proof:
  - label: "CIP-0164: Ouroboros Leios"
    href: "https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md"
  - label: "Project site with simulator and documentation"
    href: "https://leios.cardano-scaling.org/"
  - label: "Mempool analysis and simulation"
    href: "https://leios.cardano-scaling.org/mempool-viz/"
---

## The problem

Leios began as a research paper. A paper proves that a protocol can work. It does not say which parameters to choose, what the network can carry, how the design behaves under attack, or what an engineering team should build first.

Between the paper and a mainnet release sat a long list of open questions, spread across researchers in formal methods, protocol engineers and product teams who each saw a different part.

## What I did

I led research and development for fifteen months and was the technical point of contact for the project.

- **Turned research into a roadmap.** I translated the open questions into an executable plan and wrote CIP-0164, the Cardano Improvement Proposal that defines the architecture. A CIP is an open industry RFC, comparable to Bitcoin's BIPs or IETF standards.
- **Validated by simulation first.** We tested protocol behaviour in simulation before committing to an implementation, and I kept a decision log of each architectural choice and its reason.
- **Connected the disciplines.** I worked between formal methods researchers, protocol engineers and product teams to settle trade-offs that no single group could decide alone.
- **Analysed attack surface.** I investigated the impact of MEV on Leios through mempool analysis and an interactive simulation.
- **Ran the workshop that unblocked the team.** A week-long on-site workshop reduced the open research questions and aligned the team on an implementation strategy.

## Working in public

I presented progress in large internal reviews and in monthly public demo and review sessions, with around 5,000 views per session over a year and a half. The project website, with an interactive simulator and the formal specification rendered for the web, came out of the same effort.

## Result

CIP-0164 is the canonical design document for Leios. It gives implementation teams concrete parameters and written trade-offs instead of a paper to interpret. Since October 2026 I am back on the project, building it towards mainnet.

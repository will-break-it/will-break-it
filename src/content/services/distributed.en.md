---
slug: distributed-systems-blockchain
title: "Distributed systems and blockchain engineering"
description: "Freelance architect in Berlin for protocol design, event-driven backends and chain indexing. Five years on Cardano at IOG, from wallets to consensus research."
lead: "Protocol design, event-driven backends and chain indexing. Five years on Cardano at IOG, from wallet infrastructure to consensus research, and enterprise migrations before that."
order: 2
updated: 2026-11-20
brief: blockchain_distributed
related: [lace, leios, deloitte]
facts:
  stack: "TypeScript, Rust, Haskell, Agda, Cardano, Plutus, CQRS, event sourcing, PostgreSQL, Redis, gRPC"
proof:
  - label: "CIP-0164, the Ouroboros Leios specification"
    href: "https://github.com/cardano-scaling/CIPs/blob/leios/CIP-0164/README.md"
  - label: "Wallet indexing architecture, published as a CIP and a problem statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Cardano PubSub, a Byzantine-resistant publish/subscribe network"
    href: "https://pubsub.cardano-scaling.org/"
---

## What I take on

- **Architecture for systems that must not lose events.** Event-driven backends, CQRS and event sourcing, replacing polling with push.
- **Chain indexing and wallet infrastructure.** Indexers, sync protocols and transaction construction on Cardano and the eUTxO model.
- **Protocol and specification work.** Turning research into a specification an implementation team can build from, with the trade-offs written down.
- **Smart contract architecture.** Plutus contract design and the off-chain code around it.
- **Technical leadership for a hard problem.** Leading a small team of engineers and researchers to a decision and a working prototype.

## How I work

I write the design down first, in a form others can argue with: a problem statement, the options, the decision and why. Then I build the smallest version that can prove or break the risky assumption, usually a simulation or a prototype, before the full implementation starts.

## Where I have done this

- **Lace wallet, IOG.** I led the re-architecture from a poll-based to an event-driven backend: 45% lower latency and over 60% lower infrastructure cost. The custom chain indexer ingests more than 2,000 transactions per second.
- **Ouroboros Leios, IOG.** I led research and development with a team of eight and am the principal author of CIP-0164, the specification for Cardano's high-throughput protocol.
- **Cardano PubSub, IOG.** I led a team of four through formal verification of a peer-sampling protocol stack and built the prototype.
- **Amazon, through IOG.** Workshops for more than 100 engineers on the eUTxO model, and help designing their deployment scheme for Cardano and Midnight nodes.
- **Mobility Data Lab.** An over-the-air update pipeline for connected vehicles, with embedded Rust on the device and rollback.

## When I am a good fit

You have a system where correctness and throughput both matter, and a decision to make that will be expensive to reverse. You want it made with evidence and written down.

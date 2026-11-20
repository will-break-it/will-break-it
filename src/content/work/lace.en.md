---
slug: lace-wallet-rearchitecture
title: "Re-architecting the Lace wallet backend from polling to events"
description: "Case study: an event-driven re-architecture of the Lace Cardano wallet backend at IOG. 45% lower latency, over 60% lower infrastructure cost, 2,000+ tx/s indexing."
lead: "Lace is IOG's light wallet for Cardano. Its backend polled the chain for every wallet. I led the move to an event-driven design that cut latency by 45% and infrastructure cost by more than 60%."
order: 2
updated: 2026-11-20
brief: blockchain_distributed
related: [distributed]
facts:
  client: "Input Output Global (IOG)"
  role: "Technical Architect"
  period: "November 2022 to November 2024"
  team: "Led a cross-functional team of 7 on the swap feature"
  stack: "TypeScript, CQRS, event sourcing, bloom filters"
  result: "45% lower latency, 60%+ lower infrastructure cost, 2,000+ tx/s ingest"
proof:
  - label: "Wallet indexing architecture: CIP draft and problem statement"
    href: "https://github.com/will-break-it/wallet-architecture"
  - label: "Lace wallet"
    href: "https://www.lace.io/"
---

## The problem

A light wallet does not run a full node. It asks a backend what happened to its addresses. Lace's backend answered by polling: wallets asked again and again whether anything had changed, and the backend queried the chain data each time.

That design gets slower and more expensive with every user. Most of the requests return nothing new, and the ones that matter arrive late.

## What I did

I led the technical architecture and the backend infrastructure for Lace over two years.

- **From pull to push.** The backend now follows the chain once and tells wallets what changed. It is built on CQRS and event sourcing: the chain is a stream of events, and each wallet's view is a projection of it.
- **A custom chain indexer.** It uses bloom filters and credential-based indexing to decide quickly which transactions concern which wallets. It ingests more than 2,000 transactions per second, and a wallet syncs in under a second.
- **Sync in a background worker.** Wallet sync moved into a web worker so that the interface stays responsive. The team later adopted this as its standard pattern.
- **Shared building blocks.** Transaction construction libraries and event-driven patterns that other product teams took over.

The re-architected backend went to production for the public Lace 1.0 launch.

## Leading the swap feature

I also led a team of seven, three frontend engineers, two backend engineers, one QA engineer and a product manager, that delivered the MetaDex swap feature.

## Written down, not just built

The design is published as a Cardano Improvement Proposal draft and a problem statement. Anyone can read why each decision was made and argue with it.

## Result

45% lower latency and more than 60% lower infrastructure cost after the move to the event-driven backend, and an indexer with headroom for more than 2,000 transactions per second.

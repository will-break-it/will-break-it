---
slug: ai-agents-automation
title: "AI agents and automation, built to be checked"
description: "Freelance engineer in Berlin for LLM pipelines that read documents and email, extract data and draft records, with human review before anything is saved."
lead: "I build pipelines on large language models that read documents and email, extract what matters and draft the record. A person approves before anything is written to a system you rely on."
order: 1
updated: 2026-11-20
brief: ai_automation
related: [operando]
proof:
  - label: "Operando deal sourcing, in production since September 2026"
    href: "https://operando.de"
  - label: "txflow, a language model writing specs that Rust code verifies"
    href: "https://txflow.fun"
  - label: "This site's own MCP server"
    href: "https://williwolff.com/mcp"
---

## What I take on

- **Document and email intake.** Reading PDFs, attachments and inboxes, and turning them into structured records in a CRM, an ERP or a database.
- **Agents with tools.** Agents that call your APIs, with typed inputs and outputs and a clear list of what they may and may not do.
- **MCP servers and integrations.** Making an existing product or data source usable by assistants such as Claude and ChatGPT.
- **Search over your own content.** Embeddings, vector search and speech-to-text, where retrieval is the real problem.

## How I build it

The model is the easy part. The work is in everything around it.

1. **Typed outputs.** Every model answer is parsed against a schema. What does not fit is rejected, not guessed.
2. **Untrusted input stays data.** Text from an email or a PDF is never followed as an instruction.
3. **A person decides.** The pipeline drafts, a person reviews, and only then is anything saved or sent.
4. **Measured, not assumed.** A fixed set of real examples shows whether a change made extraction better or worse.

I start with a rough version on your real documents. That shows where the risks are before the budget is spent.

## Where I have done this

For Operando Partners I built a pipeline that reads deal teasers arriving by email, extracts the key figures from the PDFs with Claude and drafts HubSpot leads for the team to review. It has run in production since September 2026.

In Dump it!, my own note-taking app, a two-phase pipeline classified intent with Claude, searched notes with pgvector and transcribed speech with Whisper. For Hausnummer I built a listing import that extracts property figures from a pasted link into a structured model.

## What it is not

I do not sell a platform or a chatbot product. You get code in your repository, running on your infrastructure, that your team can read and change.

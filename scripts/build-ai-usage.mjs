#!/usr/bin/env node
// Rolls up local Claude Code transcripts into data/ai-usage.json.
//
// Unlike build-activity.mjs this CANNOT run in CI. The transcripts live in
// ~/.claude/projects on the machine that did the work, and nothing uploads
// them anywhere. So this is a local script, run by hand or from a launchd
// agent, and the file it writes is committed like any other source.
//
// Two rules govern everything below.
//
// COUNTS ONLY. The transcripts contain prompts, source code, client work and
// file paths. Project directories are named after their path, which here means
// client names and, in one case, a home address. None of that leaves this
// script. What gets written out is numbers: how many messages, how many
// tokens, how many times each tool ran. No paths, no names, no content.
//
// NEVER RECOMPUTE FROM SCRATCH. Claude Code prunes old transcripts, so the
// source is a moving window roughly six weeks wide, not an archive. A full
// rescan next month would return a SMALLER total than today's, and publishing
// that would walk the numbers backwards. So each run merges into the file that
// is already there: days already recorded keep the values they were recorded
// with, and only genuinely new days get added. The committed file is the
// archive; ~/.claude/projects is just the feed.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'ai-usage.json');
const SOURCE = process.env.CLAUDE_PROJECTS || join(homedir(), '.claude', 'projects');

// Tools worth naming individually. Everything else lands in "other", because a
// long tail of one-offs says nothing and the MCP entries in particular carry
// vendor names that have no business being published.
const NAMED = new Set(['Bash', 'Edit', 'Read', 'Write', 'Agent', 'WebFetch', 'WebSearch', 'Task']);

function* walk(dir) {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const e of entries) {
        const p = join(dir, e.name);
        if (e.isDirectory()) yield* walk(p);
        else if (e.isFile() && e.name.endsWith('.jsonl')) yield p;
    }
}

// One bucket per calendar day, in whatever timezone the machine was in when
// the work happened. That is the right frame for "days I worked", which is
// what this measures, rather than UTC.
const day = (iso) => new Date(iso).toLocaleDateString('en-CA');

function scan() {
    const byDay = new Map();
    const tools = new Map();
    const models = new Map();

    const bucket = (d) => {
        if (!byDay.has(d)) {
            byDay.set(d, {
                date: d,
                prompts: 0,
                actions: 0,
                sessions: new Set(),
                input: 0,
                output: 0,
                cacheRead: 0,
                cacheWrite: 0,
            });
        }
        return byDay.get(d);
    };

    let files = 0;
    for (const file of walk(SOURCE)) {
        files++;
        let text;
        try {
            text = readFileSync(file, 'utf8');
        } catch {
            continue;
        }
        for (const line of text.split('\n')) {
            if (!line) continue;
            let rec;
            try {
                rec = JSON.parse(line);
            } catch {
                // Transcripts are appended to live, so the last line of an
                // open session is routinely half-written. Skip it.
                continue;
            }
            if (!rec.timestamp) continue;
            const d = day(rec.timestamp);

            // A prompt is a turn the human typed. promptId is what marks
            // those; tool results and injected reminders arrive as user
            // records too and would otherwise be counted as instructions.
            if (rec.type === 'user' && rec.promptId && typeof rec.message?.content === 'string') {
                bucket(d).prompts++;
                continue;
            }
            if (rec.type !== 'assistant') continue;

            const b = bucket(d);
            b.actions++;
            if (rec.sessionId) b.sessions.add(rec.sessionId);

            const u = rec.message?.usage || {};
            b.input += u.input_tokens || 0;
            b.output += u.output_tokens || 0;
            b.cacheRead += u.cache_read_input_tokens || 0;
            b.cacheWrite += u.cache_creation_input_tokens || 0;

            const model = rec.message?.model;
            if (model && !model.startsWith('<')) models.set(model, (models.get(model) || 0) + 1);

            for (const c of rec.message?.content || []) {
                if (c?.type !== 'tool_use') continue;
                const name = NAMED.has(c.name) ? c.name : 'other';
                tools.set(name, (tools.get(name) || 0) + 1);
            }
        }
    }

    const days = [...byDay.values()]
        .map(({ sessions, ...rest }) => ({ ...rest, sessions: sessions.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return { files, days, tools, models };
}

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
const scanned = scan();

if (!scanned.days.length) {
    // An empty scan means the source moved or the machine is not the one that
    // did the work. Writing that out would erase the archive.
    throw new Error(`no transcripts found under ${SOURCE}`);
}

// Days already in the archive win. They were recorded when the transcripts for
// them still existed; a later scan sees a pruned remnant, or nothing at all,
// and would only ever revise them downwards.
const merged = new Map();
for (const d of previous?.days || []) merged.set(d.date, d);
for (const d of scanned.days) if (!merged.has(d.date)) merged.set(d.date, d);

// The newest day is the exception: it is still being written to, so the value
// recorded an hour ago is genuinely stale and the fresh number is the better
// one. Only ever revise it upwards, never down.
const newest = scanned.days[scanned.days.length - 1];
const held = merged.get(newest.date);
if (held && newest.actions >= held.actions) merged.set(newest.date, newest);

const days = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));

const sum = (key) => days.reduce((n, d) => n + d[key], 0);
const tokens = {
    input: sum('input'),
    output: sum('output'),
    cacheRead: sum('cacheRead'),
    cacheWrite: sum('cacheWrite'),
};
tokens.total = tokens.input + tokens.output + tokens.cacheRead + tokens.cacheWrite;

// Tool and model counts are whole-history rollups that the day buckets do not
// carry, so they cannot be merged the way days are. Keep the larger of the two,
// which for a pruning source is almost always the archived one.
const rollup = (name, fresh) => {
    const old = previous?.[name] || {};
    const out = { ...old };
    for (const [k, v] of fresh) if (!(k in out) || v > out[k]) out[k] = v;
    return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
};

const prompts = sum('prompts');
const actions = sum('actions');

const out = {
    generated: new Date().toISOString(),
    // Says plainly that this is an archive with a start date, not a claim
    // about all time. The site prints it.
    since: days[0].date,
    totals: {
        prompts,
        actions,
        sessions: sum('sessions'),
        activeDays: days.length,
        // The number the whole thing is really about: how much work one
        // instruction turns into.
        actionsPerPrompt: prompts ? Math.round((actions / prompts) * 10) / 10 : 0,
        tokens,
    },
    tools: rollup('tools', scanned.tools),
    models: rollup('models', scanned.models),
    days,
};

// Same guard as build-activity.mjs, for the same reason: a run that silently
// sees less than it used to must not be allowed to publish the shortfall. Here
// the likely cause is a pruned source rather than a de-scoped token, but the
// failure looks identical from the outside.
if (previous?.totals) {
    const shrank = ['prompts', 'actions'].filter((k) => out.totals[k] < previous.totals[k]);
    if (shrank.length) {
        throw new Error(
            `refusing to write: ${shrank
                .map((k) => `${k} ${previous.totals[k]} -> ${out.totals[k]}`)
                .join(', ')}`
        );
    }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const M = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : `${(n / 1e6).toFixed(1)}M`);
process.stderr.write(
    `read ${scanned.files} transcripts\n` +
        `${days.length} active days since ${out.since}` +
        `${previous ? ` (+${days.length - (previous.days?.length || 0)} new)` : ''}\n` +
        `${prompts} instructions -> ${actions} actions (${out.totals.actionsPerPrompt}x)\n` +
        `${M(tokens.total)} tokens processed, ${M(tokens.output)} generated\n`
);

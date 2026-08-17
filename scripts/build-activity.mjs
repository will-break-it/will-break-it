#!/usr/bin/env node
// Aggregates GitHub contribution data into data/activity.json.
//
// Deliberately coarse: day-level data is used only to derive aggregates and is
// dropped before writing. The output file cannot express "nothing happened on
// this day", because no day survives into it. Commits land in private repos,
// get squashed on merge, or happen on other forges, so a per-day grid would
// claim idle days that were not idle.
//
// Usage:
//   GH_TOKEN=$(gh auth token) node scripts/build-activity.mjs
//
// Token needs read:user to include private contributions as counts. Without
// it the script still works and marks the output scope as "public".

import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const LOGIN = 'will-break-it';
const OUT = 'data/activity.json';
const TOKEN = process.env.GH_ACTIVITY_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('No token. Set GH_ACTIVITY_TOKEN, GH_TOKEN or GITHUB_TOKEN.');
  process.exit(1);
}

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'will-break-it-activity',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
const monthKey = (day) => day.slice(0, 7);

// --- account creation, so we know how far back to walk -----------------------

const profile = await gql(
  `query($login:String!){ user(login:$login){ createdAt name } }`,
  { login: LOGIN }
);
const createdAt = new Date(profile.user.createdAt);
const now = new Date();

// --- one contributionsCollection call per year -------------------------------
// The API caps a collection at one year, so history has to be walked yearly.

const YEAR_QUERY = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){
    contributionsCollection(from:$from,to:$to){
      restrictedContributionsCount
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ date contributionCount } }
      }
    }
  }
}`;

const years = [];
const dayIndex = new Map(); // date -> count, scratch only, never written out

for (let y = createdAt.getUTCFullYear(); y <= now.getUTCFullYear(); y++) {
  const from = new Date(Date.UTC(y, 0, 1));
  const to = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
  const data = await gql(YEAR_QUERY, {
    login: LOGIN,
    from: iso(from < createdAt ? createdAt : from),
    to: iso(to > now ? now : to),
  });
  const c = data.user.contributionsCollection;

  years.push({
    year: y,
    total: c.contributionCalendar.totalContributions,
    private: c.restrictedContributionsCount,
    commits: c.totalCommitContributions,
    prs: c.totalPullRequestContributions,
    reviews: c.totalPullRequestReviewContributions,
  });

  for (const week of c.contributionCalendar.weeks) {
    for (const d of week.contributionDays) {
      if (d.contributionCount > 0) dayIndex.set(d.date, d.contributionCount);
    }
  }
  process.stderr.write(`  ${y}: ${c.contributionCalendar.totalContributions}\n`);
}

// --- derive month buckets for the trailing 12 months ------------------------

const months = [];
const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
cursor.setUTCMonth(cursor.getUTCMonth() - 11);
for (let i = 0; i < 12; i++) {
  const key = cursor.toISOString().slice(0, 7);
  let total = 0;
  for (const [date, count] of dayIndex) {
    if (monthKey(date) === key) total += count;
  }
  months.push({ month: key, total });
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
}

// --- month buckets across the whole history ---------------------------------
// Same rule as the trailing window: months, never days. A month with nothing
// recorded is left out entirely rather than written as zero, so the file still
// cannot claim an idle stretch it has no way of knowing about.

const monthlyTotals = new Map();
for (const [date, count] of dayIndex) {
  const key = monthKey(date);
  monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + count);
}
const monthly = [...monthlyTotals.entries()]
  .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  .map(([month, total]) => ({ month, total }));

// --- aggregates that describe presence, never absence ----------------------

const twelveMonthsAgo = new Date(now);
twelveMonthsAgo.setUTCFullYear(twelveMonthsAgo.getUTCFullYear() - 1);

let last12 = 0;
const activeWeeks = new Set();
for (const [date, count] of dayIndex) {
  const d = new Date(`${date}T00:00:00Z`);
  if (d >= twelveMonthsAgo && d <= now) {
    last12 += count;
    // ISO-ish week bucket; only used to count weeks that had activity
    const week = new Date(d);
    week.setUTCDate(week.getUTCDate() - week.getUTCDay());
    activeWeeks.add(week.toISOString().slice(0, 10));
  }
}

// Consecutive days ending today or yesterday. A streak is a claim about days
// that DID have activity, so it is safe to publish; absence is never implied.
let streak = 0;
const probe = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
if (!dayIndex.has(probe.toISOString().slice(0, 10))) probe.setUTCDate(probe.getUTCDate() - 1);
while (dayIndex.has(probe.toISOString().slice(0, 10))) {
  streak++;
  probe.setUTCDate(probe.getUTCDate() - 1);
}

// --- language mix across own repos, bytes only, no repo names --------------

const REPO_QUERY = `query($login:String!,$cursor:String){
  user(login:$login){
    repositories(first:100, after:$cursor, ownerAffiliations:[OWNER], isFork:false,
                 orderBy:{field:PUSHED_AT,direction:DESC}){
      pageInfo{ hasNextPage endCursor }
      nodes{
        name url isPrivate pushedAt
        primaryLanguage{ name }
        languages(first:12){ edges{ size node{ name } } }
      }
    }
  }
}`;

const bytes = new Map();
let repoCount = 0;
let publicRepos = [];
let lastPush = null;
let cursorRepo = null;

do {
  const data = await gql(REPO_QUERY, { login: LOGIN, cursor: cursorRepo });
  const page = data.user.repositories;
  for (const r of page.nodes) {
    repoCount++;
    for (const e of r.languages.edges) {
      bytes.set(e.node.name, (bytes.get(e.node.name) || 0) + e.size);
    }
    if (!lastPush || r.pushedAt > lastPush.pushedAt) {
      lastPush = { pushedAt: r.pushedAt, isPrivate: r.isPrivate, name: r.name, url: r.url };
    }
    if (!r.isPrivate) {
      publicRepos.push({
        name: r.name,
        url: r.url,
        pushedAt: r.pushedAt,
        language: r.primaryLanguage?.name ?? null,
      });
    }
  }
  cursorRepo = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
} while (cursorRepo);

const totalBytes = [...bytes.values()].reduce((a, b) => a + b, 0);
const languages = [...bytes.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([name, size]) => ({ name, share: Math.round((size / totalBytes) * 1000) / 10 }));

publicRepos.sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1));

// --- emit -----------------------------------------------------------------
// Private repo names never leave this script; only counts and language bytes.

// restrictedContributionsCount means "contributions the caller cannot see the
// detail of". Granting repo scope therefore DRIVES IT DOWN, because those
// contributions stop being restricted: this run reports 96 where a token
// without repo reported 6,217, for the same underlying work. Detecting scope
// from that number alone would flip to "public" the moment it legitimately hits
// zero and trip the downgrade guard forever. Seeing private repositories is the
// reliable signal.
const seesPrivateRepos = repoCount > publicRepos.length;
const hasPrivateVisibility = seesPrivateRepos || years.some((y) => y.private > 0);

const out = {
  generated: iso(now),
  login: LOGIN,
  scope: hasPrivateVisibility ? 'public+private' : 'public',
  since: profile.user.createdAt.slice(0, 10),
  last12Months: {
    total: last12,
    activeWeeks: activeWeeks.size,
    weeksInWindow: 52,
    months, // month buckets only; no day granularity in this file
  },
  streakDays: streak,
  totals: {
    contributions: years.reduce((a, y) => a + y.total, 0),
    private: years.reduce((a, y) => a + y.private, 0),
    commits: years.reduce((a, y) => a + y.commits, 0),
    pullRequests: years.reduce((a, y) => a + y.prs, 0),
    reviews: years.reduce((a, y) => a + y.reviews, 0),
    repositories: repoCount,
    publicRepositories: publicRepos.length,
  },
  years,
  monthly, // whole history, month buckets only
  languages,
  lastPush: lastPush
    ? {
        at: lastPush.pushedAt,
        // A private push is reported as a timestamp with no identifying detail.
        repo: lastPush.isPrivate ? null : lastPush.name,
        url: lastPush.isPrivate ? null : lastPush.url,
        private: lastPush.isPrivate,
      }
    : null,
  recentPublic: publicRepos.slice(0, 6),
};

// Never downgrade a full record to a public-only one. Without the PAT this
// script still succeeds, it just cannot see private contributions, and
// committing that result would silently drop the published totals by roughly
// 70%. If the file on disk already knows about private work and this run does
// not, the run is the thing that is wrong.
if (existsSync(OUT)) {
  const previous = JSON.parse(readFileSync(OUT, 'utf8'));
  const lostPrivateCounts = out.scope === 'public' && previous.scope === 'public+private';
  // Contribution counts and repository visibility come from different scopes,
  // so a token can keep one and lose the other. Losing most of the repositories
  // silently changes repo count, language mix and the last-push timestamp.
  const lostRepos = out.totals.repositories < previous.totals.repositories * 0.6;
  if (lostPrivateCounts || lostRepos) {
    console.error(
      'Refusing to publish a smaller view of the same account.\n' +
      `  scope       ${previous.scope} -> ${out.scope}\n` +
      `  repositories ${previous.totals.repositories} -> ${out.totals.repositories}\n` +
      'GH_ACTIVITY_TOKEN is missing or under-scoped. A classic PAT needs repo + read:user.'
    );
    process.exit(1);
  }
}

const serialized = `${JSON.stringify(out, null, 2)}\n`;

// Ignore the timestamp when deciding whether anything actually changed, so the
// nightly job does not commit an identical file with a new date every night.
const comparable = (text) => text.replace(/"generated": "[^"]*",\n/, '');
if (existsSync(OUT) && comparable(readFileSync(OUT, 'utf8')) === comparable(serialized)) {
  process.stderr.write('activity.json unchanged\n');
  process.exit(0);
}

writeFileSync(OUT, serialized);
process.stderr.write(`wrote ${OUT} (${out.totals.contributions} contributions, scope ${out.scope})\n`);

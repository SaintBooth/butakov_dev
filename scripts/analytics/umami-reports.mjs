#!/usr/bin/env node
// Idempotent sync of REPORTS/SEGMENTS into Umami. Env: STATS_GATE_USER, STATS_GATE_PASS, UMAMI_API_KEY.
// Usage: node scripts/analytics/umami-reports.mjs [--dry-run]
import { REPORTS, SEGMENTS } from './reports.config.mjs';

const ORIGIN = 'https://stats.butakov.dev';
const WEBSITE_ID = '920e10b9-bb76-476e-bdc2-770a23f7f9ef';
const PAGE_SIZE = 200;
const dryRun = process.argv.includes('--dry-run');

const { STATS_GATE_USER, STATS_GATE_PASS, UMAMI_API_KEY } = process.env;
if (!STATS_GATE_USER || !STATS_GATE_PASS || !UMAMI_API_KEY) {
  console.error('missing env: STATS_GATE_USER, STATS_GATE_PASS, UMAMI_API_KEY');
  process.exit(1);
}

// The gate (Basic) and Umami (Bearer) both read Authorization: trade Basic for the gate cookie first.
async function gateCookie() {
  const basic = Buffer.from(`${STATS_GATE_USER}:${STATS_GATE_PASS}`).toString('base64');
  const res = await fetch(`${ORIGIN}/`, {
    headers: { Authorization: `Basic ${basic}` },
    redirect: 'manual',
  });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith('__Host-stats_gate='));
  if (!cookie) throw new Error(`gate refused (${res.status})`);
  return cookie.split(';')[0];
}

const cookie = await gateCookie();

async function api(method, path, body) {
  const res = await fetch(`${ORIGIN}${path}`, {
    method,
    headers: {
      Cookie: cookie,
      Authorization: `Bearer ${UMAMI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function sync(label, existing, items, create, update) {
  const byName = new Map(existing.map((x) => [x.name, x.id]));
  for (const item of items) {
    const id = byName.get(item.name);
    console.log(`${dryRun ? '[dry] ' : ''}${label} ${id ? 'update' : 'create'}: ${item.name}`);
    if (!dryRun) await (id ? update(id, item) : create(item));
  }
}

const reports = await api('GET', `/api/reports?websiteId=${WEBSITE_ID}&pageSize=${PAGE_SIZE}`);
await sync(
  'report',
  reports.data,
  REPORTS,
  (r) => api('POST', '/api/reports', { websiteId: WEBSITE_ID, ...r }),
  (id, r) => api('POST', `/api/reports/${id}`, { websiteId: WEBSITE_ID, ...r })
);

const segBase = `/api/websites/${WEBSITE_ID}/segments`;
const segments = await api('GET', `${segBase}?type=segment&pageSize=${PAGE_SIZE}`);
await sync(
  'segment',
  segments.data ?? segments,
  SEGMENTS,
  (s) => api('POST', segBase, { type: 'segment', ...s }),
  (id, s) => api('POST', `${segBase}/${id}`, { type: 'segment', ...s })
);

console.log('done');

// Entry point of the Umami bundle on stats.butakov.dev (Netangels runs it via APP_PATH).
//
// The gate runs in the same process as Next on purpose: loopback is shared by every
// tenant of the hosting, so an internal port behind a proxy would let neighbours
// reach the dashboard without credentials.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGate, isPublicRequest } from './gate.mjs';

const DEFAULTS = {
  TRACKER_SCRIPT_NAME: 'p.js',
  COLLECT_API_ENDPOINT: '/api/p',
  CLIENT_IP_HEADER: 'x-real-ip',
  DISABLE_TELEMETRY: '1',
  DISABLE_UPDATES: '1',
};

const dir = path.dirname(fileURLToPath(import.meta.url));
process.chdir(dir);
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';
for (const [key, value] of Object.entries(DEFAULTS)) process.env[key] = process.env[key] || value;
// The panel provisions DB_CONNECTION_STRING; Umami and Prisma read DATABASE_URL.
process.env.DATABASE_URL = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;
// The official image ships the musl schema engine; the host is glibc, so migrations
// use an engine installed for this platform next to the bundle.
const schemaEngine = path.join(dir, 'engines/schema-engine');
if (existsSync(schemaEngine) && !process.env.PRISMA_SCHEMA_ENGINE_BINARY) {
  process.env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEngine;
}

const port = Number(process.env.APP_PORT || process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const names = {
  scriptName: process.env.TRACKER_SCRIPT_NAME.replace(/^\/+/, ''),
  collectPath: process.env.COLLECT_API_ENDPOINT,
};
const ipHeader = process.env.CLIENT_IP_HEADER.toLowerCase();

function runUmamiScript(script) {
  execFileSync(process.execPath, [script], {
    stdio: 'inherit',
    env: { ...process.env, PATH: `${path.join(dir, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}` },
  });
}

if (!process.env.STATS_SKIP_DB_CHECK) runUmamiScript('scripts/check-db.js');
runUmamiScript('scripts/update-tracker.js');

let gate = null;
try {
  gate = createGate({
    user: process.env.STATS_GATE_USER,
    pass: process.env.STATS_GATE_PASS,
    secret: process.env.STATS_GATE_SECRET,
  });
} catch (error) {
  // Fail closed: the tracker keeps collecting, the dashboard stays unreachable.
  console.error(`${error.message}; dashboard is disabled until the panel env is set`);
}

const require = createRequire(import.meta.url);
const { config } = JSON.parse(readFileSync(path.join(dir, '.next/required-server-files.json'), 'utf8'));
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(config);
const next = require('next');
const app = next({ dev: false, dir, hostname, port, conf: config });
const handle = app.getRequestHandler();

function deny(res, status, message, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(message);
}

// Next may set its own cookies; keep ours alongside instead of being overwritten.
function withCookie(res, cookie) {
  const setHeader = res.setHeader.bind(res);
  res.setHeader = (name, value) =>
    name.toLowerCase() === 'set-cookie' ? setHeader(name, [cookie, ...[].concat(value)]) : setHeader(name, value);
  setHeader('Set-Cookie', cookie);
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const { pathname } = new URL(req.url ?? '/', 'http://stats.local');

  if (isPublicRequest(req.method ?? 'GET', pathname, names)) return handle(req, res);
  if (!gate) return deny(res, 503, 'Dashboard is not configured');

  const ip = String(req.headers[ipHeader] ?? req.socket.remoteAddress ?? 'unknown');
  if (gate.isLockedOut(ip)) {
    console.warn(`stats gate: locked out ${ip} ${req.method} ${pathname}`);
    return deny(res, 429, 'Too many attempts, try again later');
  }

  const result = gate.check({ authorization: req.headers.authorization, cookie: req.headers.cookie });
  if (!result.ok) {
    const scheme = req.headers.authorization?.split(' ')[0] ?? 'none';
    const hasCookie = req.headers.cookie?.includes('__Host-stats_gate=') ?? false;
    console.warn(`stats gate: 401 ${ip} ${req.method} ${pathname} auth=${scheme} cookie=${hasCookie}`);
    if (scheme === 'Basic') gate.recordFailure(ip);
    return deny(res, 401, 'Authentication required', { 'WWW-Authenticate': 'Basic realm="stats", charset="UTF-8"' });
  }

  if (result.setCookie) withCookie(res, result.setCookie);
  return handle(req, res);
});

app.prepare().then(() => {
  server.listen(port, hostname, () => console.log(`stats listening on ${hostname}:${port}`));
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

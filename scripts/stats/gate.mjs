import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = '__Host-stats_gate';
const COOKIE_VERSION = 'v1';
const SESSION_MS = 30 * 24 * 3600 * 1000;
const MIN_SECRET_LENGTH = 32;
const LOCKOUT_FAILURES = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const RECORDER_CONFIG = new RegExp(`^/api/websites/${UUID}/recorder$`);
// Umami's middleware rewrites the custom names onto these, so they must pass too.
const TRACKER_SCRIPTS = ['/script.js', '/recorder.js'];
const COLLECT_PATHS = ['/api/send', '/api/record'];

/**
 * Paths the tracker on butakov.dev must reach without credentials. Everything else —
 * the dashboard, its API and the login form — sits behind the gate.
 *
 * @param {string} method
 * @param {string} pathname
 * @param {{ scriptName: string, collectPath: string }} names
 */
export function isPublicRequest(method, pathname, { scriptName, collectPath }) {
  if (pathname.includes('..')) return false;
  const read = method === 'GET' || method === 'HEAD';
  const write = method === 'POST' || method === 'OPTIONS';

  if (read && (pathname === `/${scriptName}` || TRACKER_SCRIPTS.includes(pathname))) return true;
  if (write && (pathname === collectPath || COLLECT_PATHS.includes(pathname))) return true;
  return (read || method === 'OPTIONS') && RECORDER_CONFIG.test(pathname);
}

function digest(value) {
  return createHash('sha256').update(value).digest();
}

function sameText(a, b) {
  return timingSafeEqual(digest(a), digest(b));
}

function readCookie(header, name) {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

/**
 * Basic auth once, then a signed cookie: the Umami UI calls its API with
 * `Authorization: Bearer`, which replaces the browser's cached basic credentials.
 *
 * @param {{ user: string, pass: string, secret: string, now?: () => number }} options
 */
export function createGate({ user, pass, secret, now = Date.now }) {
  if (!user || !pass) throw new Error('stats gate: user and password are required');
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`stats gate: secret must be at least ${MIN_SECRET_LENGTH} characters`);
  }

  // The password takes part in the signature so that changing it signs everyone out.
  const sign = (expires) =>
    createHmac('sha256', secret).update(`${COOKIE_VERSION}\n${user}\n${pass}\n${expires}`).digest('base64url');

  const failures = new Map();

  function validCookie(value) {
    if (!value) return false;
    const [version, expires, signature] = value.split('.');
    if (version !== COOKIE_VERSION || !/^\d+$/.test(expires ?? '') || !signature) return false;
    if (Number(expires) <= now()) return false;
    return sameText(signature, sign(expires));
  }

  function validBasic(header) {
    if (!header?.startsWith('Basic ')) return false;
    const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
    const split = decoded.indexOf(':');
    if (split < 0) return false;
    // Both comparisons run regardless, so timing does not reveal which half was wrong.
    const userOk = sameText(decoded.slice(0, split), user);
    const passOk = sameText(decoded.slice(split + 1), pass);
    return userOk && passOk;
  }

  function issueCookie() {
    const expires = String(now() + SESSION_MS);
    const maxAge = Math.floor(SESSION_MS / 1000);
    return `${COOKIE_NAME}=${COOKIE_VERSION}.${expires}.${sign(expires)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
  }

  return {
    /** @param {{ authorization: string | undefined, cookie: string | undefined }} headers */
    check({ authorization, cookie }) {
      if (validCookie(readCookie(cookie, COOKIE_NAME))) return { ok: true };
      if (validBasic(authorization)) return { ok: true, setCookie: issueCookie() };
      return { ok: false };
    },

    /** @param {string} ip */
    recordFailure(ip) {
      const entry = failures.get(ip);
      if (!entry || entry.resetAt <= now()) {
        failures.set(ip, { count: 1, resetAt: now() + LOCKOUT_WINDOW_MS });
      } else {
        entry.count += 1;
      }
    },

    /** @param {string} ip */
    isLockedOut(ip) {
      const entry = failures.get(ip);
      return !!entry && entry.resetAt > now() && entry.count >= LOCKOUT_FAILURES;
    },
  };
}

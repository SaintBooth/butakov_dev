import { describe, expect, it } from 'vitest';
import { createGate, isPublicRequest } from './gate.mjs';

const WEBSITE_ID = '3f0c8a52-6a0e-4f2e-9d55-0b1c2d3e4f50';
const PUBLIC = { scriptName: 'p.js', collectPath: '/api/p' };
const PASS = 'correct horse battery staple';

function basic(user: string, pass: string) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function gate(now = 1_000_000) {
  return createGate({ user: 'owner', pass: PASS, secret: 'x'.repeat(48), now: () => now });
}

function issuedCookie(g = gate()) {
  return g
    .check({ authorization: basic('owner', PASS), cookie: undefined })
    .setCookie!.split(';')[0];
}

describe('isPublicRequest', () => {
  it.each([
    ['GET', '/p.js'],
    ['GET', '/recorder.js'],
    ['GET', '/script.js'],
    ['POST', '/api/send'],
    ['POST', '/api/p'],
    ['OPTIONS', '/api/p'],
    ['POST', '/api/record'],
    ['GET', `/api/websites/${WEBSITE_ID}/recorder`],
  ])('lets the tracker reach %s %s', (method, path) => {
    expect(isPublicRequest(method, path, PUBLIC)).toBe(true);
  });

  it.each([
    ['GET', '/'],
    ['GET', '/login'],
    ['POST', '/api/auth/login'],
    ['GET', '/api/send'],
    ['GET', `/api/websites/${WEBSITE_ID}`],
    ['GET', `/api/websites/${WEBSITE_ID}/stats`],
    ['POST', `/api/websites/${WEBSITE_ID}/recorder`],
    ['DELETE', '/api/p'],
    ['GET', '/p.js/../login'],
  ])('keeps %s %s behind the gate', (method, path) => {
    expect(isPublicRequest(method, path, PUBLIC)).toBe(false);
  });
});

describe('createGate', () => {
  it('rejects a request without credentials', () => {
    expect(gate().check({ authorization: undefined, cookie: undefined }).ok).toBe(false);
  });

  it('rejects wrong basic credentials', () => {
    expect(gate().check({ authorization: basic('owner', 'nope'), cookie: undefined }).ok).toBe(
      false
    );
  });

  it('accepts right basic credentials and issues a session cookie', () => {
    const r = gate().check({ authorization: basic('owner', PASS), cookie: undefined });
    expect(r.ok).toBe(true);
    expect(r.setCookie).toMatch(/^__Host-stats_gate=v1\.\d+\.[\w-]+; /);
    expect(r.setCookie).toContain('HttpOnly');
    expect(r.setCookie).toContain('Secure');
    expect(r.setCookie).toContain('SameSite=Strict');
  });

  it('accepts the issued cookie while the ui sends bearer tokens', () => {
    const g = gate();
    const r = g.check({
      authorization: 'Bearer umami-token',
      cookie: `other=1; ${issuedCookie(g)}`,
    });
    expect(r).toEqual({ ok: true });
  });

  it('rejects an expired cookie', () => {
    const cookie = issuedCookie(gate(0));
    expect(gate(31 * 24 * 3600 * 1000).check({ authorization: undefined, cookie }).ok).toBe(false);
  });

  it('rejects a cookie signed with another secret', () => {
    const other = createGate({
      user: 'owner',
      pass: PASS,
      secret: 'y'.repeat(48),
      now: () => 1_000_000,
    });
    expect(gate().check({ authorization: undefined, cookie: issuedCookie(other) }).ok).toBe(false);
  });

  it('rejects a tampered expiry', () => {
    const [name, value] = issuedCookie().split('=');
    const [v, , sig] = value.split('.');
    const forged = `${name}=${v}.${Number.MAX_SAFE_INTEGER}.${sig}`;
    expect(gate().check({ authorization: undefined, cookie: forged }).ok).toBe(false);
  });

  it('locks out an ip after repeated failures', () => {
    const g = gate();
    for (let i = 0; i < 10; i++) g.recordFailure('1.2.3.4');
    expect(g.isLockedOut('1.2.3.4')).toBe(true);
    expect(g.isLockedOut('5.6.7.8')).toBe(false);
  });

  it('refuses to build without a strong secret or a user', () => {
    expect(() => createGate({ user: 'u', pass: 'p', secret: 'short' })).toThrow();
    expect(() => createGate({ user: '', pass: 'p', secret: 'x'.repeat(48) })).toThrow();
  });
});

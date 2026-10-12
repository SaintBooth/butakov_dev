import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseWorkshopEnv } from './workshopEnv';

const base = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/db',
  WORKSHOP_FORM_SECRET: 'a'.repeat(32),
  WORKSHOP_ADMIN_TOKEN: 'b'.repeat(32),
};

describe('parseWorkshopEnv', () => {
  it('accepts the minimal set with the mailer off by default', () => {
    const r = parseWorkshopEnv(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.env.WORKSHOP_MAILER_ENABLED).toBe(false);
  });

  it('falls back to DB_CONNECTION_STRING injected by the hosting panel', () => {
    const { DATABASE_URL: _unused, ...rest } = base;
    const r = parseWorkshopEnv({ ...rest, DB_CONNECTION_STRING: 'postgres://h/panel' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.env.DATABASE_URL).toBe('postgres://h/panel');
  });

  it('lets DATABASE_URL win over DB_CONNECTION_STRING and ignores an empty one', () => {
    const both = parseWorkshopEnv({ ...base, DB_CONNECTION_STRING: 'postgres://h/panel' });
    if (both.ok) expect(both.env.DATABASE_URL).toBe(base.DATABASE_URL);
    else throw new Error(both.error);
    const empty = parseWorkshopEnv({
      ...base,
      DATABASE_URL: '',
      DB_CONNECTION_STRING: 'postgres://h/panel',
    });
    if (empty.ok) expect(empty.env.DATABASE_URL).toBe('postgres://h/panel');
    else throw new Error(empty.error);
  });

  it('is invalid when neither variable is set', () => {
    const { DATABASE_URL: _unused, ...rest } = base;
    const r = parseWorkshopEnv(rest);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('DATABASE_URL');
  });

  it('rejects a short form secret and names the variable, not its value', () => {
    const r = parseWorkshopEnv({ ...base, WORKSHOP_FORM_SECRET: 'short' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain('WORKSHOP_FORM_SECRET');
      expect(r.error).not.toContain('short');
    }
  });

  it('parses the mailer flag to a boolean and treats an empty value as off', () => {
    const smtp = {
      SMTP_HOST: 'h',
      SMTP_PORT: '465',
      SMTP_USER: 'u',
      SMTP_PASS: 'p',
      MAIL_FROM: 'a@b.ru',
    };
    const on = parseWorkshopEnv({ ...base, ...smtp, WORKSHOP_MAILER_ENABLED: 'true' });
    expect(on.ok && on.env.WORKSHOP_MAILER_ENABLED).toBe(true);
    const empty = parseWorkshopEnv({ ...base, WORKSHOP_MAILER_ENABLED: '' });
    expect(empty.ok && empty.env.WORKSHOP_MAILER_ENABLED).toBe(false);
    expect(parseWorkshopEnv({ ...base, WORKSHOP_MAILER_ENABLED: 'yes' }).ok).toBe(false);
  });

  it('requires SMTP settings when the mailer is enabled', () => {
    const r = parseWorkshopEnv({ ...base, WORKSHOP_MAILER_ENABLED: 'true' });
    expect(r.ok).toBe(false);
  });

  it('accepts a full mailer configuration', () => {
    const r = parseWorkshopEnv({
      ...base,
      WORKSHOP_MAILER_ENABLED: 'true',
      SMTP_HOST: 'mail.netangels.ru',
      SMTP_PORT: '465',
      SMTP_USER: 'workshop@butakov.dev',
      SMTP_PASS: 'secret',
      MAIL_FROM: 'Александр Бутаков <workshop@butakov.dev>',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.env.SMTP_PORT).toBe(465);
  });

  it('treats empty optional variables as unset instead of disabling the feature', () => {
    const r = parseWorkshopEnv({
      ...base,
      SMTP_HOST: '',
      SMTP_PORT: '',
      TELEGRAM_BOT_TOKEN: '',
      WORKSHOP_IP_HEADER: '',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.env.SMTP_HOST).toBeUndefined();
      expect(r.env.SMTP_PORT).toBeUndefined();
    }
  });
});

describe('parseWorkshopEnv secrets', () => {
  it('rejects a short admin token and names the variable, not its value', () => {
    const r = parseWorkshopEnv({ ...base, WORKSHOP_ADMIN_TOKEN: 'c'.repeat(31) });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain('WORKSHOP_ADMIN_TOKEN');
      expect(r.error).not.toContain('c'.repeat(31));
    }
  });

  it('accepts an admin token of exactly the minimum length', () => {
    expect(parseWorkshopEnv({ ...base, WORKSHOP_ADMIN_TOKEN: 'c'.repeat(32) }).ok).toBe(true);
  });
});

describe('parseWorkshopEnv partial SMTP', () => {
  const smtp: Record<string, string> = {
    SMTP_HOST: 'h',
    SMTP_PORT: '465',
    SMTP_USER: 'u',
    SMTP_PASS: 'p',
    MAIL_FROM: 'a@b.ru',
  };

  it.each(Object.keys(smtp))('rejects the enabled mailer without %s', (missing) => {
    const { [missing]: _omitted, ...rest } = smtp;
    const r = parseWorkshopEnv({ ...base, ...rest, WORKSHOP_MAILER_ENABLED: 'true' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('WORKSHOP_MAILER_ENABLED');
  });

  it('never echoes the SMTP password when the configuration is rejected', () => {
    const r = parseWorkshopEnv({
      ...base,
      SMTP_PASS: 'hunter2-secret',
      WORKSHOP_MAILER_ENABLED: 'true',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).not.toContain('hunter2-secret');
  });
});

describe('TELEGRAM_WEBHOOK_SECRET', () => {
  it('rejects a short secret', () => {
    expect(parseWorkshopEnv({ ...base, TELEGRAM_WEBHOOK_SECRET: 'short' }).ok).toBe(false);
  });
  it('treats an empty value as absent', () => {
    const r = parseWorkshopEnv({ ...base, TELEGRAM_WEBHOOK_SECRET: '' });
    expect(r.ok && r.env.TELEGRAM_WEBHOOK_SECRET).toBeUndefined();
  });
  it('accepts a 43-char base64url secret', () => {
    expect(
      parseWorkshopEnv({ ...base, TELEGRAM_WEBHOOK_SECRET: 'Ab_-'.repeat(10) + 'xyz' }).ok
    ).toBe(true);
  });
});

describe('getWorkshopEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadFresh() {
    vi.resetModules();
    return (await import('./workshopEnv')).getWorkshopEnv;
  }

  it('returns null and logs the variable names when the environment is invalid', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('WORKSHOP_FORM_SECRET', 'x');
    vi.stubEnv('WORKSHOP_ADMIN_TOKEN', 'y');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getWorkshopEnv = await loadFresh();

    expect(getWorkshopEnv()).toBeNull();
    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0][0])).toContain('WORKSHOP_FORM_SECRET');
  });

  it('parses once and keeps serving the cached result', async () => {
    vi.stubEnv('DATABASE_URL', base.DATABASE_URL);
    vi.stubEnv('WORKSHOP_FORM_SECRET', base.WORKSHOP_FORM_SECRET);
    vi.stubEnv('WORKSHOP_ADMIN_TOKEN', base.WORKSHOP_ADMIN_TOKEN);
    const getWorkshopEnv = await loadFresh();

    const first = getWorkshopEnv();
    expect(first?.DATABASE_URL).toBe(base.DATABASE_URL);
    vi.stubEnv('DATABASE_URL', 'postgres://changed');
    expect(getWorkshopEnv()).toBe(first);
  });

  it('caches the failure too, so a broken environment is logged only once', async () => {
    vi.stubEnv('DATABASE_URL', '');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getWorkshopEnv = await loadFresh();

    getWorkshopEnv();
    getWorkshopEnv();
    expect(log).toHaveBeenCalledTimes(1);
  });
});

describe('TELEGRAM_BOT_MODE', () => {
  it('defaults to polling when absent or empty', () => {
    const a = parseWorkshopEnv(base);
    const b = parseWorkshopEnv({ ...base, TELEGRAM_BOT_MODE: '' });
    expect(a.ok && a.env.TELEGRAM_BOT_MODE).toBe('polling');
    expect(b.ok && b.env.TELEGRAM_BOT_MODE).toBe('polling');
  });
  it('accepts webhook', () => {
    const r = parseWorkshopEnv({ ...base, TELEGRAM_BOT_MODE: 'webhook' });
    expect(r.ok && r.env.TELEGRAM_BOT_MODE).toBe('webhook');
  });
  it('rejects anything else', () => {
    expect(parseWorkshopEnv({ ...base, TELEGRAM_BOT_MODE: 'push' }).ok).toBe(false);
  });
});

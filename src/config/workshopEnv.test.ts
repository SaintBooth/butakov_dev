import { describe, expect, it } from 'vitest';
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

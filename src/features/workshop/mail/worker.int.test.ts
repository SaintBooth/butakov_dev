import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { registerParticipant } from '../server/registerParticipant';
import type { OutgoingMail } from './compose';
import { runMailerTick } from './worker';

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  await seedSession(sql);
  await registerParticipant(
    sql,
    'ai-test',
    {
      fullName: 'Иван',
      email: 'ivan@x.ru',
      company: 'ООО',
      positionLevel: 'head',
      challenges: [],
      topics: [],
      consentPd: true,
      consentMarketing: false,
      consentPortfolio: false,
    },
    {
      version: 'v',
      hashes: { pd_processing: 'a', marketing: 'b', portfolio: 'c' },
      ip: null,
      userAgent: null,
    },
    new Date()
  );
});
afterAll(async () => {
  await sql.end();
});

const noopNotify = async () => {};

describe('runMailerTick', () => {
  it('sends only due jobs and issues a manage token', async () => {
    const sent: OutgoingMail[] = [];
    const r = await runMailerTick({
      db: sql,
      send: async (m) => void sent.push(m),
      now: () => new Date(),
      notify: noopNotify,
    });
    expect(r).toEqual({ sent: 1, cancelled: 0, failed: 0 });
    expect(sent[0].subject).toContain('Вы зарегистрированы');
    const tokens = await sql`SELECT purpose FROM workshop_tokens`;
    expect(tokens.map((t) => t.purpose)).toEqual(['manage']);
  });

  it('cancels jobs of a cancelled registration', async () => {
    await sql`UPDATE workshop_registrations SET status = 'cancelled'`;
    const sent: OutgoingMail[] = [];
    const r = await runMailerTick({
      db: sql,
      send: async (m) => void sent.push(m),
      now: () => new Date(),
      notify: noopNotify,
    });
    expect(r.cancelled).toBe(1);
    expect(sent).toHaveLength(0);
  });

  it('schedules a retry on SMTP failure and gives up after the last one', async () => {
    const failing = {
      db: sql,
      send: async () => {
        throw new Error('smtp down');
      },
      now: () => new Date(),
      notify: noopNotify,
    };
    await runMailerTick(failing);
    const [job] =
      await sql`SELECT status, attempts, last_error FROM workshop_email_jobs WHERE kind = 'confirmation'`;
    expect(job).toMatchObject({ status: 'pending', attempts: 1, lastError: 'smtp down' });

    await sql`UPDATE workshop_email_jobs SET attempts = 4, send_at = now() - interval '1 second' WHERE kind = 'confirmation'`;
    const pings: string[] = [];
    await runMailerTick({ ...failing, notify: async (text: string) => void pings.push(text) });
    const [dead] = await sql`SELECT status FROM workshop_email_jobs WHERE kind = 'confirmation'`;
    expect(dead.status).toBe('failed');
    expect(pings).toHaveLength(1);
  });
});

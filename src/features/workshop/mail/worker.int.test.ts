import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { registerParticipant } from '../server/registerParticipant';
import type { OutgoingMail } from './compose';
import { runMailerTick } from './worker';

vi.mock('./compose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./compose')>();
  return {
    ...actual,
    composeEmail: (ctx: Parameters<typeof actual.composeEmail>[0]) => {
      if (ctx.to === 'poison@x.ru') throw new Error('compose failed for poison@x.ru');
      return actual.composeEmail(ctx);
    },
  };
});

// Lets a test make token issuing fail with a real SQL error, which aborts the transaction.
const sqlFault = vi.hoisted(() => ({ onIssue: false }));
vi.mock('../db/tokens', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/tokens')>();
  return {
    ...actual,
    issueToken: async (...args: Parameters<typeof actual.issueToken>) => {
      if (sqlFault.onIssue) await args[0]`SELECT * FROM workshop_no_such_table`;
      return actual.issueToken(...args);
    },
  };
});

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
    expect(job).toMatchObject({ status: 'pending', attempts: 1, lastError: 'Error' });
    // The manage token issued for the failed attempt must not outlive it.
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM workshop_tokens`;
    expect(n).toBe(0);

    await sql`UPDATE workshop_email_jobs SET attempts = 4, send_at = now() - interval '1 second' WHERE kind = 'confirmation'`;
    const pings: string[] = [];
    await runMailerTick({ ...failing, notify: async (text: string) => void pings.push(text) });
    const [dead] = await sql`SELECT status FROM workshop_email_jobs WHERE kind = 'confirmation'`;
    expect(dead.status).toBe('failed');
    expect(pings).toHaveLength(1);
  });
  it('keeps earlier jobs sent when a later job fails to compose, and stores no address', async () => {
    const [{ id: sessionId }] = await sql`SELECT id FROM workshop_sessions`;
    const [{ id: participantId }] = await sql`
      INSERT INTO workshop_participants (email, full_name)
      VALUES ('poison@x.ru', 'Яд') RETURNING id`;
    const [{ id: registrationId }] = await sql`
      INSERT INTO workshop_registrations (participant_id, session_id, company, position_level)
      VALUES (${participantId}, ${sessionId}, 'ООО', 'head') RETURNING id`;
    await sql`UPDATE workshop_email_jobs SET send_at = now() - interval '1 minute' WHERE kind = 'confirmation'`;
    await sql`
      INSERT INTO workshop_email_jobs (registration_id, kind, send_at)
      VALUES (${registrationId}, 'confirmation', now() - interval '30 seconds')`;

    const sent: OutgoingMail[] = [];
    const r = await runMailerTick({
      db: sql,
      send: async (m) => void sent.push(m),
      now: () => new Date(),
      notify: noopNotify,
    });
    expect(r.sent).toBe(1);
    expect(sent.map((m) => m.to)).toEqual(['ivan@x.ru']);
    const jobs = await sql`
      SELECT j.status, j.attempts, j.last_error, j.registration_id
      FROM workshop_email_jobs j WHERE j.kind = 'confirmation' ORDER BY j.id`;
    expect(jobs[0]).toMatchObject({ status: 'sent' });
    expect(jobs[1]).toMatchObject({ status: 'pending', attempts: 1, lastError: 'Error' });
    expect(JSON.stringify(jobs)).not.toContain('poison@x.ru');
  });

  it('stores only error class, code and response code, never the message', async () => {
    const err = Object.assign(new Error('rejected ivan@x.ru'), {
      code: 'EENVELOPE',
      responseCode: 550,
    });
    await runMailerTick({
      db: sql,
      send: async () => {
        throw err;
      },
      now: () => new Date(),
      notify: noopNotify,
    });
    const [job] = await sql`SELECT last_error FROM workshop_email_jobs WHERE kind = 'confirmation'`;
    expect(job.lastError).toBe('Error:EENVELOPE:550');
  });

  it('turns a SQL error while issuing links into a normal retry', async () => {
    sqlFault.onIssue = true;
    try {
      const r = await runMailerTick({
        db: sql,
        send: async () => {},
        now: () => new Date(),
        notify: noopNotify,
      });
      expect(r).toEqual({ sent: 0, cancelled: 0, failed: 0 });
    } finally {
      sqlFault.onIssue = false;
    }
    const [job] =
      await sql`SELECT status, attempts, last_error FROM workshop_email_jobs WHERE kind = 'confirmation'`;
    expect(job).toMatchObject({ status: 'pending', attempts: 1, lastError: 'PostgresError:42P01' });
  });
});

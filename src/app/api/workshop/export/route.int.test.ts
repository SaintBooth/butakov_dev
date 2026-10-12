import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkshopEnv } from '@/config/workshopEnv';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import { issueViewLink } from '@/features/workshop/db/viewLinks';
import { GET } from './route';

const ADMIN_TOKEN = 'a'.repeat(32);
const hooks = vi.hoisted(() => ({ db: null as unknown }));

vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('@/config/workshopEnv', () => ({
  getWorkshopEnv: () => ({ WORKSHOP_ADMIN_TOKEN: 'a'.repeat(32) }) as WorkshopEnv,
}));
vi.mock('@/features/workshop/db/client', () => ({ getDb: () => hooks.db }));

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  hooks.db = sql;
  await seedSession(sql);
});
afterAll(async () => {
  await sql.end();
});

const call = (query: string, authorization: string | null = `Bearer ${ADMIN_TOKEN}`) =>
  GET(
    new Request(`http://localhost/api/workshop/export?${query}`, {
      headers: authorization ? { authorization } : {},
    })
  );

describe('export route', () => {
  it('refuses a request without the admin token and never caches the answer', async () => {
    const res = await call('session=ai-test&kind=summary', null);
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects an unknown kind and a malformed session', async () => {
    expect((await call('session=ai-test&kind=everything')).status).toBe(400);
    expect((await call('session=../etc&kind=summary')).status).toBe(400);
  });

  it('answers 404 for an unknown session', async () => {
    expect((await call('session=nope-nope&kind=summary')).status).toBe(404);
  });

  it('serves the program kind as a download with answers of active registrations only', async () => {
    await seedRegistration(sql, 'active@x.ru', {
      positionLevel: 'head',
      industry: 'it',
      taskText: 'Поиск по регламентам',
      topics: ['rag'],
    });
    await seedRegistration(sql, 'gone@x.ru', { taskText: 'Отменённая заявка' });
    await sql`
      UPDATE workshop_registrations SET status = 'cancelled'
      WHERE participant_id = (SELECT id FROM workshop_participants WHERE email = 'gone@x.ru')`;

    const res = await call('session=ai-test&kind=program');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="ai-test-program.csv"'
    );
    expect(res.headers.get('cache-control')).toBe('no-store');

    const bytes = new Uint8Array(await res.arrayBuffer());
    // Excel needs the BOM to read UTF-8 Cyrillic; text() would strip it, so the bytes are checked.
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const body = new TextDecoder().decode(bytes);
    expect(body.startsWith('Position level,Industry,AI level,Task,Challenges,Topics')).toBe(true);
    expect(body).toContain('Поиск по регламентам');
    expect(body).not.toContain('Отменённая заявка');
    expect(body).not.toContain('@x.ru');
  });

  it('neutralises spreadsheet formulas in the program export', async () => {
    await seedRegistration(sql, 'evil@x.ru', { taskText: '=HYPERLINK("http://evil.example","x")' });

    const body = await (await call('session=ai-test&kind=program')).text();
    expect(body).toContain(`"'=HYPERLINK(""http://evil.example"",""x"")"`);
    expect(body).not.toMatch(/(^|,|\r\n)=HYPERLINK/);
  });

  it('neutralises formulas in the attendee export', async () => {
    await seedRegistration(sql, 'a@x.ru', { fullName: '=1+1', consentPortfolio: true });
    await sql`UPDATE workshop_registrations SET status = 'attended', attended_at = now()`;

    const body = await (await call('session=ai-test&kind=attendees')).text();
    expect(body).toContain("'=1+1");
    expect(body).not.toMatch(/(^|,|\r\n)=1\+1/);
  });
});

describe('export with a view link', () => {
  beforeEach(async () => {
    // Reset globals for each test
    delete (globalThis as any).__workshopViewLinkFailures;
  });

  it("serves the CSV for the token's own session", async () => {
    const session = await seedSession(sql, { slug: 'ses-a' });
    const t = await issueViewLink(sql, session.id, new Date());
    const res = await GET(
      new Request(`http://localhost/api/workshop/export?session=ses-a&kind=summary&t=${t}`)
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
  });

  it('refuses the token for another session', async () => {
    const ses_a = await seedSession(sql, { slug: 'ses-a' });
    await seedSession(sql, { slug: 'ses-b' });
    const t = await issueViewLink(sql, ses_a.id, new Date());
    expect(
      (
        await GET(
          new Request(`http://localhost/api/workshop/export?session=ses-b&kind=summary&t=${t}`)
        )
      ).status
    ).toBe(404);
  });

  it('still requires a bearer token without t', async () => {
    await seedSession(sql, { slug: 'ses-a' });
    expect(
      (await GET(new Request(`http://localhost/api/workshop/export?session=ses-a&kind=summary`)))
        .status
    ).toBe(401);
  });
});

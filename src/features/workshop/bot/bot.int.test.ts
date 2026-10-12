import type { Sql } from 'postgres';
import type { Update, UserFromGetMe } from 'grammy/types';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import { createWorkshopBot } from './bot';
import { moscowParts, slugBase } from './parse';

const OWNER = 111;
const D = 86_400_000;
const BOT_INFO = {
  id: 1,
  is_bot: true,
  first_name: 'b',
  username: 'b_bot',
  can_join_groups: false,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
} as UserFromGetMe;

let sql: Sql;
let calls: { method: string; payload: Record<string, unknown> }[];
let send: (u: Omit<Update, 'update_id'>) => Promise<void>;
let uid = 1;
let editFailure: string | null = null;
// Real time: seedRegistration stamps rows with new Date(), and the wizard refuses past dates.
const now = new Date();

// Stands in for the network, below every API transformer, so `calls` holds exactly what Telegram would receive.
const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({
    method: String(url).split('/').pop() as string,
    payload: JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>,
  });
  if (editFailure && String(url).endsWith('/editMessageText'))
    return new Response(JSON.stringify({ ok: false, error_code: 400, description: editFailure }), {
      status: 400,
    });
  const result = { message_id: 1, date: 0, chat: { id: OWNER, type: 'private' } };
  return new Response(JSON.stringify({ ok: true, result }));
};

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  calls = [];
  editFailure = null;
  const bot = createWorkshopBot({
    token: '1:fake',
    ownerId: OWNER,
    db: sql,
    now: () => now,
    botInfo: BOT_INFO,
    client: { fetch: fakeFetch as never },
  });
  send = (u) => bot.handleUpdate({ update_id: uid++, ...u } as Update);
});
afterAll(async () => {
  await sql.end();
});

const from = (id = OWNER) => ({ id, is_bot: false, first_name: 'x' });
const chat = { id: OWNER, type: 'private' as const, first_name: 'x' };
const text = (t: string, id = OWNER) =>
  ({
    message: {
      message_id: uid,
      date: 0,
      chat,
      from: from(id),
      text: t,
      ...(t.startsWith('/')
        ? { entities: [{ type: 'bot_command', offset: 0, length: t.length }] }
        : {}),
    },
  }) as Omit<Update, 'update_id'>;
const press = (data: string, inChat: { id: number; type: string } = chat) =>
  ({
    callback_query: {
      id: String(uid),
      chat_instance: 'c',
      data,
      from: from(),
      message: { message_id: 5, date: 0, chat: inChat, text: 'x' },
    },
  }) as Omit<Update, 'update_id'>;
const texts = () =>
  calls.filter((c) => typeof c.payload.text === 'string').map((c) => c.payload.text as string);
const dayInput = (d: Date) => {
  const p = moscowParts(d);
  return `${p.day}.${p.month} 19:00`;
};

describe('workshop bot', () => {
  it('ignores strangers completely', async () => {
    await send(text('/start', 999));
    expect(calls).toEqual([]);
  });

  it('never sends a link preview', async () => {
    const s = await seedSession(sql);
    await send(text('/start'));
    await send(press(`c:${s.id}`));
    await send(press(`l:${s.id}`));
    const sent = calls.filter((c) => c.method === 'sendMessage' || c.method === 'editMessageText');
    expect(sent.length).toBeGreaterThanOrEqual(3);
    for (const c of sent) expect(c.payload.link_preview_options).toEqual({ is_disabled: true });
  });

  it('creates a workshop through the wizard and rejects bad input on the way', async () => {
    const day = new Date(now.getTime() + 20 * D);
    await send(press('n'));
    await send(text('ИИ в бизнесе'));
    await send(text(dayInput(day)));
    await send(press('w:120'));
    await send(text('http://bad'));
    await send(text('https://telemost.yandex.ru/j/1'));
    await send(press('w:30'));
    await send(press('ok'));
    const [s] = await sql<{ slug: string; capacity: number; startsAt: Date; endsAt: Date }[]>`
      SELECT slug, capacity, starts_at, ends_at FROM workshop_sessions`;
    expect(s.slug).toBe(slugBase(s.startsAt));
    expect(s.capacity).toBe(30);
    expect(s.endsAt.getTime() - s.startsAt.getTime()).toBe(120 * 60_000);
    expect(texts().join('\n')).toContain('Нужна ссылка');
    expect(texts().slice(-1)[0]).toContain(`/ru/workshop/${s.slug}`);
  });

  it('shows participants as initials and hands out a site link', async () => {
    const ses = await seedSession(sql);
    await seedRegistration(sql, 'anna@x.ru', { fullName: 'Анна Кузнецова' });
    await send(press(`u:${ses.id}:0`));
    expect(texts().join('\n')).toContain('Анна К.');
    expect(texts().join('\n')).not.toContain('Кузнецова');
    expect(texts().join('\n')).not.toContain('anna@x.ru');
    await send(press(`l:${ses.id}`));
    expect(texts().slice(-1)[0]).toMatch(/\/ru\/workshop\/ai-test\/admin\?t=/);
  });

  it('toggles registration', async () => {
    const ses = await seedSession(sql);
    await send(press(`t:${ses.id}`));
    const [row] = await sql`SELECT registration_open FROM workshop_sessions`;
    expect(row.registrationOpen).toBe(false);
  });

  it('reschedules after confirmation', async () => {
    const ses = await seedSession(sql);
    await seedRegistration(sql, 'a@x.ru');
    await send(press(`f:${ses.id}:time`));
    await send(text(dayInput(new Date(now.getTime() + 15 * D))));
    await send(press('w:90'));
    expect(texts().slice(-1)[0]).toContain('1 человек получит письмо');
    await send(press(`rs:${ses.id}`));
    const [j] = await sql`SELECT status FROM workshop_email_jobs WHERE kind = 'rescheduled'`;
    expect(j.status).toBe('pending');
  });

  describe('reschedule confirmation is bound to its own button', () => {
    const toConfirm = async () => {
      const ses = await seedSession(sql);
      await seedRegistration(sql, 'a@x.ru');
      await send(press(`f:${ses.id}:time`));
      await send(text(dayInput(new Date(now.getTime() + 15 * D))));
      await send(press('w:90'));
      return ses;
    };
    const rescheduledJobs = () =>
      sql`SELECT id FROM workshop_email_jobs WHERE kind = 'rescheduled'`;

    it('a stale create button does not reschedule', async () => {
      await toConfirm();
      await send(press('ok'));
      expect(await rescheduledJobs()).toHaveLength(0);
    });

    it('a button for another session does nothing', async () => {
      const ses = await toConfirm();
      await send(press(`rs:${ses.id + 1}`));
      expect(await rescheduledJobs()).toHaveLength(0);
    });

    it('a second tap on the same button runs once', async () => {
      const ses = await toConfirm();
      await Promise.all([send(press(`rs:${ses.id}`)), send(press(`rs:${ses.id}`))]);
      expect(await rescheduledJobs()).toHaveLength(1);
    });
  });

  it('a double tap on create makes one workshop', async () => {
    const day = new Date(now.getTime() + 20 * D);
    await send(press('n'));
    await send(text('ИИ в бизнесе'));
    await send(text(dayInput(day)));
    await send(press('w:120'));
    await send(text('https://telemost.yandex.ru/j/1'));
    await send(press('w:30'));
    await Promise.all([send(press('ok')), send(press('ok'))]);
    expect(await sql`SELECT id FROM workshop_sessions`).toHaveLength(1);
  });

  it('ignores the owner in a group chat', async () => {
    const group = { id: -5, type: 'supergroup' };
    await send(press('m', group));
    await send({
      message: { message_id: 9, date: 0, chat: group, from: from(), text: 'hi' },
    } as Omit<Update, 'update_id'>);
    expect(calls).toEqual([]);
  });

  it('stays quiet when Telegram says the message is not modified', async () => {
    const s = await seedSession(sql);
    editFailure = 'Bad Request: message is not modified';
    await send(press(`c:${s.id}`));
    expect(calls.map((c) => c.method)).not.toContain('sendMessage');
  });

  it('reports other edit failures', async () => {
    const s = await seedSession(sql);
    editFailure = 'Bad Request: something else';
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await send(press(`c:${s.id}`));
    log.mockRestore();
    expect(texts().slice(-1)[0]).toContain('Не получилось');
  });

  it('refuses a capacity below the registered count', async () => {
    const ses = await seedSession(sql);
    await seedRegistration(sql, 'a@x.ru');
    await seedRegistration(sql, 'b@x.ru');
    await send(press(`f:${ses.id}:capacity`));
    await send(text('1'));
    expect(texts().slice(-1)[0]).toContain('Записано больше');
  });

  it('cancel clears the dialog', async () => {
    await send(press('n'));
    await send(press('x'));
    await send(text('просто текст'));
    expect(texts().slice(-1)[0]).toContain('Ближайшие воркшопы');
  });
});

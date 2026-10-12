import type { Sql } from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb } from '@/test/db';
import type { Dialog } from '../bot/dialog';
import { clearDialog, loadDialog, saveDialog } from './botDialogs';

let sql: Sql;
beforeAll(async () => {
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

const d: Dialog = { kind: 'create', step: 'start', draft: { title: 'ИИ' } };

describe('bot dialogs', () => {
  it('round-trips and expires', async () => {
    const now = new Date();
    await saveDialog(sql, 42, d, now);
    expect(await loadDialog(sql, 42, now)).toEqual(d);
    expect(await loadDialog(sql, 42, new Date(now.getTime() + 31 * 60_000))).toBeNull();
  });
  it('drops a row that no longer matches the schema', async () => {
    await sql`INSERT INTO workshop_bot_dialogs (chat_id, state) VALUES (7, '{"kind":"old"}')`;
    expect(await loadDialog(sql, 7, new Date())).toBeNull();
  });
  it('clears', async () => {
    await saveDialog(sql, 42, d, new Date());
    await clearDialog(sql, 42);
    expect(await loadDialog(sql, 42, new Date())).toBeNull();
  });
});

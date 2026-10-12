import type { Sql, TransactionSql } from 'postgres';
import { BOT } from '@/config/workshop';
import { dialogSchema, type Dialog } from '../bot/dialog';

type Db = Sql | TransactionSql;

export async function loadDialog(db: Db, chatId: number, now: Date): Promise<Dialog | null> {
  const [row] = await db<{ state: unknown; updatedAt: Date }[]>`
    SELECT state, updated_at FROM workshop_bot_dialogs WHERE chat_id = ${chatId}`;
  if (!row || now.getTime() - row.updatedAt.getTime() > BOT.dialogTtlMs) return null;
  // A deploy may change the shape; an old row counts as no dialog rather than a crash.
  const parsed = dialogSchema.safeParse(row.state);
  return parsed.success ? parsed.data : null;
}

export async function saveDialog(db: Db, chatId: number, dialog: Dialog, now: Date): Promise<void> {
  await db`
    INSERT INTO workshop_bot_dialogs (chat_id, state, updated_at)
    VALUES (${chatId}, ${db.json(dialog as unknown as any)}, ${now})
    ON CONFLICT (chat_id) DO UPDATE SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at`;
}

export async function clearDialog(db: Db, chatId: number): Promise<void> {
  await db`DELETE FROM workshop_bot_dialogs WHERE chat_id = ${chatId}`;
}

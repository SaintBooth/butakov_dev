import type { Sql, TransactionSql } from 'postgres';
import { BOT } from '@/config/workshop';
import { dialogSchema, type Dialog } from '../bot/dialog';

type Db = Sql | TransactionSql;

type DialogRow = { state: unknown; updatedAt: Date };

function readDialog(row: DialogRow | undefined, now: Date): Dialog | null {
  if (!row || now.getTime() - row.updatedAt.getTime() > BOT.dialogTtlMs) return null;
  // A deploy may change the shape; an old row counts as no dialog rather than a crash.
  const parsed = dialogSchema.safeParse(row.state);
  return parsed.success ? parsed.data : null;
}

export async function loadDialog(db: Db, chatId: number, now: Date): Promise<Dialog | null> {
  const [row] = await db<DialogRow[]>`
    SELECT state, updated_at FROM workshop_bot_dialogs WHERE chat_id = ${chatId}`;
  return readDialog(row, now);
}

// Remove-and-return in one statement: of two concurrent confirms only one gets the dialog.
export async function takeDialog(db: Db, chatId: number, now: Date): Promise<Dialog | null> {
  const [row] = await db<DialogRow[]>`
    DELETE FROM workshop_bot_dialogs WHERE chat_id = ${chatId} RETURNING state, updated_at`;
  return readDialog(row, now);
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

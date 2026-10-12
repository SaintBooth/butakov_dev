import type { Sql, TransactionSql } from 'postgres';
import { BOT, TOKEN_MAX_LENGTH } from '@/config/workshop';
import { createToken, hashToken } from '../domain/tokens';

type Db = Sql | TransactionSql;

export async function issueViewLink(db: Db, sessionId: number, now: Date): Promise<string> {
  const { token, hash } = createToken();
  await db`
    INSERT INTO workshop_view_links (token_sha256, session_id, expires_at)
    VALUES (${hash}, ${sessionId}, ${new Date(now.getTime() + BOT.viewLinkTtlMs)})`;
  return token;
}

export async function findViewLinkSession(
  db: Db,
  token: string,
  now: Date
): Promise<number | null> {
  if (token.length === 0 || token.length > TOKEN_MAX_LENGTH) return null;
  const [row] = await db<{ sessionId: number }[]>`
    SELECT session_id FROM workshop_view_links
    WHERE token_sha256 = ${hashToken(token)} AND expires_at > ${now}`;
  return row?.sessionId ?? null;
}

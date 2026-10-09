import type { Sql, TransactionSql } from 'postgres';
import type { RegistrationStatus } from '../domain/emailPlan';
import { createToken, tokenExpiry, type TokenPurpose } from '../domain/tokens';

export interface TokenContext {
  tokenId: number;
  purpose: TokenPurpose;
  expiresAt: Date;
  usedAt: Date | null;
  registrationId: number;
  registrationStatus: RegistrationStatus;
  participantId: number;
  fullName: string;
  sessionId: number;
  sessionSlug: string;
  sessionTitle: string;
  sessionStartsAt: Date;
  sessionEndsAt: Date;
}

export async function insertToken(
  db: Sql | TransactionSql,
  t: { registrationId: number; purpose: TokenPurpose; tokenSha256: string; expiresAt: Date }
): Promise<void> {
  await db`INSERT INTO workshop_tokens ${db(t, 'registrationId', 'purpose', 'tokenSha256', 'expiresAt')}`;
}

export async function issueToken(
  db: Sql | TransactionSql,
  registrationId: number,
  purpose: TokenPurpose,
  sessionEndsAt: Date,
  now: Date
): Promise<string> {
  const { token, hash } = createToken();
  await insertToken(db, {
    registrationId,
    purpose,
    tokenSha256: hash,
    expiresAt: tokenExpiry(purpose, sessionEndsAt, now),
  });
  return token;
}

export async function findToken(
  db: Sql | TransactionSql,
  tokenSha256: string,
  purpose: TokenPurpose
): Promise<TokenContext | null> {
  const [row] = await db<TokenContext[]>`
    SELECT t.id AS token_id, t.purpose, t.expires_at, t.used_at,
           r.id AS registration_id, r.status AS registration_status,
           p.id AS participant_id, p.full_name,
           s.id AS session_id, s.slug AS session_slug, s.title AS session_title,
           s.starts_at AS session_starts_at, s.ends_at AS session_ends_at
    FROM workshop_tokens t
    JOIN workshop_registrations r ON r.id = t.registration_id
    JOIN workshop_participants p ON p.id = r.participant_id
    JOIN workshop_sessions s ON s.id = r.session_id
    WHERE t.token_sha256 = ${tokenSha256} AND t.purpose = ${purpose}`;
  return row ?? null;
}

export async function markTokenUsed(db: Sql, tokenId: number, now: Date): Promise<void> {
  await db`UPDATE workshop_tokens SET used_at = ${now} WHERE id = ${tokenId}`;
}

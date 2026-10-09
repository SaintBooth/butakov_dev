import type { Sql, TransactionSql } from 'postgres';
import type { ConsentEvent, ConsentKind } from '../domain/consents';

export interface ConsentInsert {
  participantId: number;
  registrationId: number | null;
  kind: ConsentKind;
  granted: boolean;
  textVersion: string;
  textSha256: string;
  ip: string | null;
  userAgent: string | null;
}

export async function insertConsents(
  db: Sql | TransactionSql,
  rows: ConsentInsert[]
): Promise<void> {
  if (rows.length === 0) return;
  await db`INSERT INTO workshop_consents ${db(
    rows,
    'participantId',
    'registrationId',
    'kind',
    'granted',
    'textVersion',
    'textSha256',
    'ip',
    'userAgent'
  )}`;
}

export async function listConsentEvents(
  db: Sql | TransactionSql,
  participantId: number
): Promise<ConsentEvent[]> {
  return db<ConsentEvent[]>`
    SELECT kind, granted, created_at FROM workshop_consents
    WHERE participant_id = ${participantId} ORDER BY id`;
}

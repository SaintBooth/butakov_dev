import type { Sql, TransactionSql } from 'postgres';

export interface WorkshopSession {
  id: number;
  slug: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string;
  materialsUrl: string | null;
  checkinCode: string;
  capacity: number;
  registrationOpen: boolean;
}

export async function findSessionBySlug(
  db: Sql | TransactionSql,
  slug: string
): Promise<WorkshopSession | null> {
  const [row] = await db<WorkshopSession[]>`
    SELECT id, slug, title, starts_at, ends_at, meeting_url, materials_url,
           checkin_code, capacity, registration_open
    FROM workshop_sessions WHERE slug = ${slug}`;
  return row ?? null;
}

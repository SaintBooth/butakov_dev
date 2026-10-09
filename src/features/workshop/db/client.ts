import postgres, { type Sql } from 'postgres';
import { getWorkshopEnv } from '@/config/workshopEnv';

const POOL_SIZE = 5;
let db: Sql | null = null;

export function getDb(): Sql | null {
  if (db) return db;
  const env = getWorkshopEnv();
  if (!env) return null;
  db = postgres(env.DATABASE_URL, {
    max: POOL_SIZE,
    transform: postgres.camel,
    onnotice: () => {},
  });
  return db;
}

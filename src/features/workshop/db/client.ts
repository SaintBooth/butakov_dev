import postgres, { type Sql } from 'postgres';
import { getWorkshopEnv } from '@/config/workshopEnv';

const POOL_SIZE = 5;
// On globalThis so that dev hot reloads do not open a new pool per module re-evaluation.
const globals = globalThis as typeof globalThis & { __workshopDb?: Sql };

export function getDb(): Sql | null {
  if (globals.__workshopDb) return globals.__workshopDb;
  const env = getWorkshopEnv();
  if (!env) return null;
  globals.__workshopDb = postgres(env.DATABASE_URL, {
    max: POOL_SIZE,
    transform: postgres.camel,
    onnotice: () => {},
  });
  return globals.__workshopDb;
}

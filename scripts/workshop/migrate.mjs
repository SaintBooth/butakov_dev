import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMigrations, connect } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sql = connect();
try {
  const ran = await applyMigrations(sql, join(root, 'db', 'migrations'));
  console.log(ran.length ? `applied: ${ran.join(', ')}` : 'up to date');
} finally {
  await sql.end();
}

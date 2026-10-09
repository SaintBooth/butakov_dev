import { parseArgs } from 'node:util';
import { connect } from './lib.mjs';

const { values } = parseArgs({ options: { slug: { type: 'string' }, url: { type: 'string' } } });
if (!values.slug || !values.url?.startsWith('https://')) {
  console.error('usage: node scripts/workshop/set-materials.mjs --slug <slug> --url https://...');
  process.exit(1);
}

const sql = connect();
try {
  const rows = await sql`UPDATE workshop_sessions SET materials_url = ${values.url} WHERE slug = ${values.slug} RETURNING id`;
  console.log(rows.length ? 'materials set' : 'no such session');
} finally {
  await sql.end();
}

import { parseArgs } from 'node:util';
import { connect, generateCheckinCode } from './lib.mjs';

const SITE_URL = process.env.SITE_URL ?? 'https://butakov.dev';
const USAGE = `usage: node scripts/workshop/create-session.mjs --slug ai-2026-10 --title "ИИ в бизнесе и жизни" \\
  --starts 2026-10-20T15:00:00+03:00 --ends 2026-10-20T17:00:00+03:00 --meeting https://telemost.yandex.ru/j/... [--capacity 30]`;

const { values } = parseArgs({
  options: {
    slug: { type: 'string' },
    title: { type: 'string' },
    starts: { type: 'string' },
    ends: { type: 'string' },
    meeting: { type: 'string' },
    capacity: { type: 'string', default: '30' },
  },
});

if (!values.slug || !values.title || !values.starts || !values.ends || !values.meeting) {
  console.error(USAGE);
  process.exit(1);
}

const sql = connect();
try {
  const code = generateCheckinCode();
  const [s] = await sql`
    INSERT INTO workshop_sessions (slug, title, starts_at, ends_at, meeting_url, checkin_code, capacity)
    VALUES (${values.slug}, ${values.title}, ${new Date(values.starts)}, ${new Date(values.ends)},
            ${values.meeting}, ${code}, ${Number(values.capacity)})
    RETURNING id`;
  console.log(`session #${s.id} created`);
  console.log(`registration: ${SITE_URL}/ru/workshop/${values.slug}`);
  console.log(`check-in:     ${SITE_URL}/ru/workshop/${values.slug}/checkin`);
  console.log(`check-in code for the last slide: ${code}`);
} finally {
  await sql.end();
}

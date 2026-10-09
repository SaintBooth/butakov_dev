import { connect, generateCheckinCode, parseCreateSessionArgs, readSiteUrl } from './lib.mjs';

let session;
let siteUrl;
try {
  session = parseCreateSessionArgs(process.argv.slice(2));
  siteUrl = readSiteUrl();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const sql = connect();
try {
  const code = generateCheckinCode();
  const row = { ...session, checkinCode: code };
  const [s] = await sql`INSERT INTO workshop_sessions ${sql(row)} RETURNING id`;
  console.log(`session #${s.id} created`);
  console.log(`registration: ${siteUrl}/ru/workshop/${session.slug}`);
  console.log(`check-in:     ${siteUrl}/ru/workshop/${session.slug}/checkin`);
  console.log(`check-in code for the last slide: ${code}`);
} finally {
  await sql.end();
}

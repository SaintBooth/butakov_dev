import { parseArgs } from 'node:util';
import { connect, purgeParticipants } from './lib.mjs';

// Dry run unless --apply: deleting personal data cannot be undone.
const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } });
const sql = connect();
try {
  const ids = await purgeParticipants(sql, { dryRun: !values.apply });
  console.log(`${values.apply ? 'purged' : 'would purge'} ${ids.length} participant(s)`);
  if (!values.apply && ids.length > 0) {
    console.log('export kind=summary for the affected sessions first, then rerun with --apply');
  }
} finally {
  await sql.end();
}

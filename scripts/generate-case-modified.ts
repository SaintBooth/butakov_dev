// Build step: freezes each article's last content-edit date from git into a manifest.
// Journal pages render per request on the host, where there is no .git, so they read this file.
import fs from 'fs';
import path from 'path';
import { CASE_MODIFIED_MANIFEST, gitContentEditDate } from '../src/utils/caseModified.ts';

const casesDir = path.join(process.cwd(), 'content', 'cases');
const manifest: Record<string, string> = {};

for (const locale of fs.readdirSync(casesDir)) {
  const dir = path.join(casesDir, locale);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const date = gitContentEditDate(path.join(dir, file));
    if (date) manifest[`${locale}/${file.replace(/\.mdx$/, '')}`] = date;
  }
}

fs.writeFileSync(
  path.join(process.cwd(), CASE_MODIFIED_MANIFEST),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(`case-modified: ${Object.keys(manifest).length} edited articles`);

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/** Written at build time by scripts/generate-case-modified.ts; keys are "<locale>/<slug>". */
export const CASE_MODIFIED_MANIFEST = 'content/cases/modified.json';

// Commits that only reformat text (em-dash sweeps, prettier) shouldn't tell crawlers the article changed.
const COSMETIC_SUBJECT = /^(style|chore)(\(|:|!)/;

/**
 * Picks the date of the latest meaningful edit from `git log --format='%cs %s'` output
 * (newest first). Returns null when there is no such commit.
 */
export function pickContentEditDate(gitLog: string): string | null {
  for (const line of gitLog.split('\n')) {
    const match = line.match(/^(\d{4}-\d{2}-\d{2}) (.*)$/);
    if (match && !COSMETIC_SUBJECT.test(match[2])) return match[1];
  }
  return null;
}

/** Latest of the given YYYY-MM-DD dates; ISO dates compare correctly as strings. */
export function latestDate(...dates: Array<string | null | undefined>): string {
  return dates.filter((d): d is string => !!d).reduce((a, b) => (b > a ? b : a));
}

/**
 * Date of the last content edit of a file, from git history. Only modifications count
 * (--diff-filter=M): the commit that added the file is the publication, already in `date`.
 * Needs full history at build time (CI checkout uses fetch-depth: 0); without git or history
 * it returns null and callers fall back to the frontmatter date.
 */
export function gitContentEditDate(filePath: string): string | null {
  try {
    const log = execFileSync('git', ['log', '--diff-filter=M', '--format=%cs %s', '--', filePath], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return pickContentEditDate(log);
  } catch {
    return null;
  }
}

let manifest: Record<string, string> | null | undefined;

/**
 * Last content-edit date of an article: from the build manifest in production (no .git
 * on the host), straight from git in dev where the manifest may be stale or missing.
 */
export function caseEditDate(locale: string, slug: string, filePath: string): string | null {
  if (manifest === undefined) {
    try {
      const file = path.join(process.cwd(), CASE_MODIFIED_MANIFEST);
      manifest = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, string>;
    } catch {
      manifest = null;
    }
  }
  if (manifest && process.env.NODE_ENV === 'production')
    return manifest[`${locale}/${slug}`] ?? null;
  return gitContentEditDate(filePath);
}

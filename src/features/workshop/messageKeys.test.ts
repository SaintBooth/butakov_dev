import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import messages from '../../../messages/ru.json';

const SRC = join(__dirname, '..', '..');
const ROOTS = ['features/workshop', 'app/[locale]/workshop', 'app/api/workshop'];
// schema.ts receives a translator from its callers instead of creating one.
const INJECTED_NAMESPACE: Record<string, string> = { 'features/workshop/schema.ts': 'workshop' };

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

function lookup(path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      messages
    );
}

interface Declaration {
  variable: string;
  namespace: string;
  index: number;
}

const DECLARATION =
  /const (\w+) = (?:await )?(?:useTranslations\(\s*'([^']+)'\s*\)|getTranslations\(\{[^}]*namespace:\s*'([^']+)'[^}]*\}\)|createTranslator\(\{[^}]*namespace:\s*'([^']+)'[^}]*\}\))/g;

function declarations(source: string): Declaration[] {
  return [...source.matchAll(DECLARATION)].map((m) => ({
    variable: m[1],
    namespace: m[2] ?? m[3] ?? m[4],
    index: m.index ?? 0,
  }));
}

interface Used {
  file: string;
  key: string;
  dynamic: boolean;
}

function usedKeys(file: string): Used[] {
  const source = readFileSync(file, 'utf8');
  const rel = relative(SRC, file).split(sep).join('/');
  const decls = declarations(source);
  const injected = INJECTED_NAMESPACE[rel];
  const found: Used[] = [];
  const variables = new Set(decls.map((d) => d.variable));
  if (injected) variables.add('t');

  for (const variable of variables) {
    const call = new RegExp(`\\b${variable}(?:\\.rich|\\.raw)?\\(\\s*(['\`])([^'\`]+)\\1`, 'g');
    for (const m of source.matchAll(call)) {
      const at = m.index ?? 0;
      // The nearest declaration above the call decides the namespace (a file may redeclare `t`).
      const above = decls.filter((d) => d.variable === variable && d.index < at);
      const decl = above[above.length - 1];
      const namespace = decl?.namespace ?? injected;
      if (!namespace) continue;
      const raw = m[2];
      const dynamic = raw.includes('${');
      const key = dynamic ? raw.slice(0, raw.indexOf('${')) : raw;
      // A key that starts with a placeholder cannot be resolved statically.
      if (!key) continue;
      found.push({ file: rel, key: `${namespace}.${key}`, dynamic });
    }
  }
  return found;
}

const used = ROOTS.flatMap((root) => sourceFiles(join(SRC, root))).flatMap(usedKeys);

describe('workshop translation keys', () => {
  it('finds the keys the code uses', () => {
    expect(used.length).toBeGreaterThan(100);
  });

  it('has every statically referenced key in messages/ru.json', () => {
    const missing = used
      .filter((u) => !u.dynamic)
      .filter((u) => typeof lookup(u.key) !== 'string')
      .map((u) => `${u.file}: ${u.key}`);
    expect(missing).toEqual([]);
  });

  it('has a message group behind every key built from a prefix', () => {
    const missing = used
      .filter((u) => u.dynamic)
      .filter((u) => !lookup(u.key.replace(/\.$/, '')))
      .map((u) => `${u.file}: ${u.key}`);
    expect(missing).toEqual([]);
  });
});

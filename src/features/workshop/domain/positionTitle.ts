import { POSITION_TITLES } from '@/data/positionTitles';

export function normalizePosition(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[.,;]+$/, '')
    .trim();
}

const BY_RUSSIAN = new Map(
  POSITION_TITLES.flatMap(([english, variants]) =>
    variants.map((v) => [normalizePosition(v), english] as const)
  )
);

// Exact match only: guessing a partial title ("руководитель отдела ...") would put a wrong
// English title into evidence documents, which is worse than leaving the field for the person.
export function translatePosition(russian: string): string | null {
  return BY_RUSSIAN.get(normalizePosition(russian)) ?? null;
}

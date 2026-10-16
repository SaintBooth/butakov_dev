import type { LandingId } from './landings';

/**
 * Article tags → the service landing an article links to. Landings were
 * "discovered, not crawled" in GSC: contextual links from articles that
 * already rank are what gives them crawl priority. First matching rule wins,
 * so narrower intents (store build, AI) come before the generic support bucket.
 */
const RULES: ReadonlyArray<{ landing: LandingId; tags: readonly string[] }> = [
  { landing: 'ai', tags: ['AI', 'LLM', 'ИИ'] },
  { landing: 'web-dev', tags: ['WooCommerce', 'Claude Code'] },
  { landing: 'web-apps', tags: ['React', 'Vite', 'Next.js', 'Django'] },
  {
    landing: 'support',
    tags: [
      'WordPress',
      'Bitrix',
      '1C Bitrix',
      'BitrixVM',
      'Redis',
      'PHP 8',
      'PHP 8.3',
      'MySQL',
      'Umami',
      'Analytics',
      'Аналитика',
    ],
  },
];

export function landingForTags(tags: readonly string[]): LandingId | null {
  const rule = RULES.find((r) => r.tags.some((t) => tags.includes(t)));
  return rule?.landing ?? null;
}

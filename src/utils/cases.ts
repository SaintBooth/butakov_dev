import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import { z } from 'zod';
import { CodeBlock, Alert } from '@/components/mdx';

export interface CaseHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

// Zod schema validates frontmatter at build time — catches typos and missing fields
export const CaseFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  tags: z.array(z.string()),
  metric: z.string().min(1),
  excerpt: z.string().min(1),
  image: z.string().startsWith('/').optional(),
});

export type CaseFrontmatter = z.infer<typeof CaseFrontmatterSchema>;

export function getCaseSlugs(locale: string): string[] {
  const dir = path.join(process.cwd(), 'content', 'cases', locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''));
}

export async function getCaseBySlug(locale: string, slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'cases', locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, 'utf-8');

  const result = await compileMDX<unknown>({
    source,
    options: { parseFrontmatter: true, mdxOptions: { rehypePlugins: [rehypeSlug] } },
    components: {
      // Replace default <pre> with Shiki-powered CodeBlock
      pre: CodeBlock as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
      Alert,
    },
  });

  // Throws at build time if any MDX file has wrong/missing fields
  const frontmatter = CaseFrontmatterSchema.parse(result.frontmatter);
  const headings = extractHeadings(source);
  const readingTime = estimateReadingTime(source);
  return { content: result.content, frontmatter, headings, readingTime };
}

// Mirrors rehype-slug's id generation (same github-slugger algorithm) so TOC anchors match
function extractHeadings(source: string): CaseHeading[] {
  const slugger = new GithubSlugger();
  const lines = source.split('\n');
  const headings: CaseHeading[] = [];

  for (const line of lines) {
    const match = line.match(/^(##|###)\s+(.+)$/);
    if (!match) continue;
    const depth = match[1].length === 2 ? 2 : 3;
    const text = match[2].trim();
    headings.push({ depth, text, id: slugger.slug(text) });
  }

  return headings;
}

const WORDS_PER_MINUTE = 200;

function estimateReadingTime(source: string): number {
  const body = source
    .replace(/^---[\s\S]*?---/, '') // frontmatter
    .replace(/```[\s\S]*?```/g, '') // code fences (not read at reading pace)
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/<[^>]+>/g, ''); // JSX/MDX component tags
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export interface RelatedCase {
  slug: string;
  frontmatter: CaseFrontmatter;
}

export async function getRelatedCases(
  locale: string,
  currentSlug: string,
  currentTags: string[],
  limit = 3
): Promise<RelatedCase[]> {
  const all = await getAllCaseFrontmatters(locale);
  const others = all.filter((c) => c.slug !== currentSlug);

  const scored = others
    .map((c) => ({
      ...c,
      sharedTags: c.frontmatter.tags.filter((tag) => currentTags.includes(tag)).length,
    }))
    .sort(
      (a, b) => b.sharedTags - a.sharedTags || b.frontmatter.date.localeCompare(a.frontmatter.date)
    );

  return scored.slice(0, limit).map(({ slug, frontmatter }) => ({ slug, frontmatter }));
}

export async function getAllCaseFrontmatters(locale: string) {
  const slugs = getCaseSlugs(locale);
  const cases = await Promise.all(
    slugs.map(async (slug) => {
      const result = await getCaseBySlug(locale, slug);
      return { slug, frontmatter: result?.frontmatter };
    })
  );
  return (
    cases.filter((c) => c.frontmatter) as Array<{
      slug: string;
      frontmatter: CaseFrontmatter;
    }>
  ).sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { z } from 'zod';
import { CodeBlock, Alert } from '@/components/mdx';

// Zod schema validates frontmatter at build time — catches typos and missing fields
export const CaseFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  tags: z.array(z.string()),
  metric: z.string().min(1),
  excerpt: z.string().min(1),
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
    options: { parseFrontmatter: true },
    components: {
      // Replace default <pre> with Shiki-powered CodeBlock
      pre: CodeBlock as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
      Alert,
    },
  });

  // Throws at build time if any MDX file has wrong/missing fields
  const frontmatter = CaseFrontmatterSchema.parse(result.frontmatter);
  return { content: result.content, frontmatter };
}

export async function getAllCaseFrontmatters(locale: string) {
  const slugs = getCaseSlugs(locale);
  const cases = await Promise.all(
    slugs.map(async (slug) => {
      const result = await getCaseBySlug(locale, slug);
      return { slug, frontmatter: result?.frontmatter };
    })
  );
  return cases.filter((c) => c.frontmatter) as Array<{
    slug: string;
    frontmatter: CaseFrontmatter;
  }>;
}

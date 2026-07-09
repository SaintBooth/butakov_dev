import type { CaseHeading } from '@/utils/cases';

interface ArticleTocProps {
  title: string;
  headings: CaseHeading[];
  className?: string;
}

export function ArticleToc({ title, headings, className }: ArticleTocProps) {
  if (headings.length === 0) return null;

  const items = headings.map((heading, index) => ({
    ...heading,
    number:
      heading.depth === 2 ? headings.slice(0, index + 1).filter((h) => h.depth === 2).length : 0,
  }));

  return (
    <nav aria-label={title} className={className}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{title}</p>
      <ol className="space-y-2 text-sm">
        {items.map((heading) => (
          <li key={heading.id} className={heading.depth === 3 ? 'ml-4' : ''}>
            <a
              href={`#${heading.id}`}
              className="text-slate-600 hover:text-teal-600 transition-colors"
            >
              {heading.depth === 2 ? `${heading.number}. ${heading.text}` : `• ${heading.text}`}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export async function CodeBlock({ children, className }: CodeBlockProps) {
  const lang = className?.replace('language-', '') ?? 'text';
  const code = String(children ?? '').trim();

  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark',
  });

  return (
    <div
      className="rounded-xl overflow-x-auto border border-slate-700/40 shadow-sm my-4 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

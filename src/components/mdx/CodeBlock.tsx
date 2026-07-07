import { isValidElement } from 'react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export async function CodeBlock({ children, className }: CodeBlockProps) {
  // MDX renders ```lang fences as <pre><code className="language-lang">text</code></pre>,
  // so both the code text and the language class live on the inner <code> element
  const codeElement = isValidElement<CodeBlockProps>(children) ? children : null;
  const lang = (codeElement?.props.className ?? className)?.replace('language-', '') || 'text';
  const code = String(codeElement?.props.children ?? children ?? '').trim();

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

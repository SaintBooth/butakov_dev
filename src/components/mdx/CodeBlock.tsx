import { isValidElement } from 'react';
import { codeToHtml } from 'shiki';
import { CopyButton } from './CopyButton';

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
    theme: 'github-light',
    colorReplacements: {
      // github-light ships a plain white canvas; match the site's slate-50 panels instead
      '#fff': '#f8fafc',
      '#ffffff': '#f8fafc',
    },
  });

  return (
    <div className="group relative rounded-xl border border-slate-200 overflow-hidden my-5 text-sm leading-relaxed [&_pre]:p-4 [&_pre]:overflow-x-auto">
      <CopyButton code={code} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

import { isValidElement } from 'react';
import { codeToHtml } from 'shiki';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

const LANG_LABELS: Record<string, string> = {
  nginx: 'Nginx',
  php: 'PHP',
  bash: 'Bash',
  sh: 'Shell',
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  python: 'Python',
  py: 'Python',
  css: 'CSS',
  html: 'HTML',
  text: 'Text',
};

export async function CodeBlock({ children, className }: CodeBlockProps) {
  // MDX renders ```lang fences as <pre><code className="language-lang">text</code></pre>,
  // so both the code text and the language class live on the inner <code> element
  const codeElement = isValidElement<CodeBlockProps>(children) ? children : null;
  const lang = (codeElement?.props.className ?? className)?.replace('language-', '') || 'text';
  const code = String(codeElement?.props.children ?? children ?? '').trim();

  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark-default',
  });

  const label = LANG_LABELS[lang] ?? lang;

  return (
    <div className="group relative my-5 rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden text-sm leading-relaxed shadow-lg shadow-black/20">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22]">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <CopyButton code={code} />
      </div>
      <div
        className="[&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function renderTextWithCodeBlocks(text, baseKey) {
  if (!text) return null;

  const parts = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const [fullMatch, , codeContent] = match;
    const start = match.index;

    if (start > lastIndex) {
      const plainText = text.slice(lastIndex, start).trim();
      if (plainText) {
        parts.push(
          <p key={`${baseKey}-text-${start}`} className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
            {plainText}
          </p>
        );
      }
    }

    parts.push(
      <pre key={`${baseKey}-code-${start}`} className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto border border-slate-700/40 shadow-sm">
        <code>{codeContent.trim()}</code>
      </pre>
    );

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    const tailText = text.slice(lastIndex).trim();
    if (tailText) {
      parts.push(
        <p key={`${baseKey}-text-tail`} className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
          {tailText}
        </p>
      );
    }
  }

  return <div className="space-y-4">{parts}</div>;
}

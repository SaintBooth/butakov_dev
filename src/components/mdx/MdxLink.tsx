import type { AnchorHTMLAttributes } from 'react';

const EXTERNAL_HREF = /^https?:\/\//;

// External sources in articles: new tab, and nofollow so they don't pass link weight
export function MdxLink({ href = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!EXTERNAL_HREF.test(href)) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="nofollow noopener noreferrer" {...props} />;
}

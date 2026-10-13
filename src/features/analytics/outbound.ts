import type { OutboundKind } from './events';

const KNOWN_HOSTS: Readonly<Record<string, OutboundKind>> = {
  't.me': 'telegram',
  'telegram.me': 'telegram',
  'github.com': 'github',
  'promptspace.ru': 'promptspace',
};

export interface OutboundLink {
  kind: OutboundKind;
  host: string;
}

export function classifyLink(href: string, siteHost: string): OutboundLink | null {
  let url: URL;
  try {
    url = new URL(href, `https://${siteHost}`);
  } catch {
    return null;
  }
  if (url.protocol === 'mailto:') return { kind: 'email', host: 'mailto' };
  if (url.protocol === 'tel:') return { kind: 'phone', host: 'tel' };
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^www\./, '');
  if (host === siteHost || host.endsWith(`.${siteHost}`)) return null;
  return {
    kind: Object.prototype.hasOwnProperty.call(KNOWN_HOSTS, host) ? KNOWN_HOSTS[host] : 'external',
    host,
  };
}

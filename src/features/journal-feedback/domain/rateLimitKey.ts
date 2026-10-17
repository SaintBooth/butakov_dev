import { isIPv4, isIPv6 } from 'node:net';

const IPV4_MAPPED = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i;

function ipv6Groups(ip: string): string[] {
  const [head, tail = ''] = ip.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const zeros = ip.includes('::') ? Array(8 - left.length - right.length).fill('0') : [];
  return [...left, ...zeros, ...right].map((g) => g.toLowerCase().replace(/^0+(?=.)/, ''));
}

// One household or office shares a /24 (IPv4) or /64 (IPv6, the usual per-subscriber block);
// keying on the full address would let an IPv6 client rotate past the limit.
export function rateLimitKey(ip: string | null): string | null {
  if (!ip) return null;
  const mapped = IPV4_MAPPED.exec(ip)?.[1];
  const v4 = mapped ?? (isIPv4(ip) ? ip : null);
  if (v4) return `v4:${v4.split('.').slice(0, 3).join('.')}`;
  if (isIPv6(ip)) return `v6:${ipv6Groups(ip).slice(0, 4).join(':')}`;
  return null;
}

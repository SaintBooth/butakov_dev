import { isIP } from 'node:net';

export function getClientIp(headers: Headers, headerName: string | undefined): string | null {
  if (!headerName) return null;
  const first = headers.get(headerName)?.split(',')[0]?.trim();
  return first && isIP(first) ? first : null;
}

// Driver and provider messages quote rows and recipient addresses, so only the error class and
// codes are ever stored or logged.
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return 'UnknownError';
  const { code, responseCode } = err as Error & { code?: unknown; responseCode?: unknown };
  return [err.name, code, responseCode]
    .filter((p): p is string | number => typeof p === 'string' || typeof p === 'number')
    .join(':');
}

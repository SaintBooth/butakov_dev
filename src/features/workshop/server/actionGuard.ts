import { describeError } from './describeError';

// A transient database failure would otherwise reach the visitor as a raw server-action error.
// Only a static tag and the error class/code are logged: the payload is personal data.
// Must not wrap redirect()/notFound(), which work by throwing.
export async function guardDb<T>(tag: string, onError: () => T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error(`[workshop] ${tag} failed:`, describeError(err));
    return onError();
  }
}

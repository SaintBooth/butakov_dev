import { createHmac } from 'node:crypto';

// Keyed off the workshop secret so no extra env has to be provisioned, and the stored hash
// cannot be tied back to the browser's id without it. Rotating WORKSHOP_FORM_SECRET therefore
// re-keys every voter: past votes stay, but a returning reader is counted anew.
export function voterHash(secret: string, voterId: string): string {
  const key = createHmac('sha256', secret).update('journal-feedback-voter').digest();
  return createHmac('sha256', key).update(voterId).digest('hex');
}

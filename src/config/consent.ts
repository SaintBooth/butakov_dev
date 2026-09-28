export const CONSENT_STORAGE_KEY = 'cookie-consent';

export type ConsentValue = 'accepted' | 'declined';

// Storage can throw (private mode, blocked site data); treat that as "no answer yet".
export function readConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Choice just won't persist; the notice reappears next visit.
  }
}

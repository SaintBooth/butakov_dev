'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { readConsent, writeConsent, type ConsentValue } from '@/config/consent';
import { PrivacyModalTrigger } from '@/features/privacy/PrivacyModalTrigger';

const subscribeNoop = () => () => {};

/**
 * Notice-mode cookie banner (152-FZ): analytics runs by default, the visitor
 * can opt out. Non-modal on purpose: it never steals focus or blocks the page.
 */
export function CookieNotice() {
  const t = useTranslations('cookieNotice');
  // The stored choice isn't known on the server: the server snapshot hides the
  // banner so visitors who already answered never see it flash.
  const stored = useSyncExternalStore(
    subscribeNoop,
    () => readConsent() ?? 'unanswered',
    () => 'server'
  );
  const [dismissed, setDismissed] = useState(false);

  if (stored !== 'unanswered' || dismissed) return null;

  const choose = (value: ConsentValue) => {
    writeConsent(value);
    setDismissed(true);
  };

  return (
    <section
      aria-label={t('label')}
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-md md:bottom-6 md:p-5"
    >
      <p className="text-sm leading-relaxed text-slate-700">
        {t('text')}{' '}
        <PrivacyModalTrigger className="font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-900">
          {t('policy')}
        </PrivacyModalTrigger>
        .
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => choose('accepted')}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
        >
          {t('accept')}
        </button>
        <button
          type="button"
          onClick={() => choose('declined')}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          {t('decline')}
        </button>
      </div>
    </section>
  );
}

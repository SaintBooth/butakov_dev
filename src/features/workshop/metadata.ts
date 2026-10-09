import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';

// Token and check-in pages are private: titled for the tab, never indexed.
export async function workshopPageMetadata(
  key: 'checkin' | 'feedback' | 'followup' | 'manage'
): Promise<Metadata> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop.meta' });
  return { title: t(key), robots: { index: false, follow: false } };
}

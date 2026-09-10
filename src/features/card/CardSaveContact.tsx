'use client';

import { Contact, Mail, MessageSquare, Phone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { CONTACT } from '@/config/contact';
import { reachGoal } from './analytics';

const iconBtn =
  'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-transform duration-100 active:scale-95 [@media(hover:hover)]:hover:border-teal-300';

export default function CardSaveContact() {
  const t = useTranslations('card.save');
  const locale = useLocale();

  return (
    <div
      className="card-enter flex items-center gap-2"
      style={{ ['--card-enter-delay' as string]: '50ms' }}
    >
      <a
        href={`/${locale}/card/contact.vcf`}
        onClick={() => reachGoal('card_vcard')}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-transform duration-100 active:scale-95 [@media(hover:hover)]:hover:bg-teal-600"
      >
        <Contact className="h-4 w-4" />
        {t('contact')}
      </a>
      <a href={`tel:${CONTACT.phoneE164}`} aria-label={t('call')} className={iconBtn}>
        <Phone className="h-4 w-4" />
      </a>
      <a href={`mailto:${CONTACT.email}`} aria-label={t('email')} className={iconBtn}>
        <Mail className="h-4 w-4" />
      </a>
      <a
        href={CONTACT.telegramUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={t('telegram')}
        onClick={() => reachGoal('card_telegram')}
        className={iconBtn}
      >
        <MessageSquare className="h-4 w-4" />
      </a>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { CONTACT } from '@/config/contact';

const GLYPH =
  'M576.27,450.32h0c0,79.98-64.83,144.81-144.81,144.81h-5.36c-79.98,0-144.81-64.83-144.81-144.81v-193.61h-108.34s0,188.31,0,188.31c0,139.82,113.34,253.16,253.16,253.16h0c124.24,0,227.56-89.49,249.05-207.53l-98.88-40.33Z';
const GLYPH2 =
  'M469.54,153.87l-45.5,102.84h152.22v193.61h0c61.09-18.57,102.84-74.91,102.84-138.76v-12.67c0-80.1-64.93-145.03-145.03-145.03h-64.54Z';

export default async function CardIdentity() {
  const t = await getTranslations('card.identity');

  return (
    <div className="card-enter flex items-center gap-3">
      <svg viewBox="0 0 852.05 852.05" className="h-11 w-11 shrink-0" aria-hidden="true">
        <rect x="0" y="0" width="852.05" height="852.05" rx="426.02" fill="#101729" />
        <path d={GLYPH} fill="#61d1c8" />
        <path d={GLYPH2} fill="#61d1c8" />
      </svg>
      <div>
        <p className="text-lg font-bold leading-tight tracking-tight text-slate-900">
          {CONTACT.name}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-500">{t('role')}</p>
      </div>
    </div>
  );
}

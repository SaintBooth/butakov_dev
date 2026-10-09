'use client';

import { useTranslations } from 'next-intl';
import { WORKSHOP_PATHS } from '@/config/workshop';
import type { FieldErrors } from '../schema';
import { Consent } from './Consent';
import { sectionTitleClass } from './formStyles';

export function RegistrationConsents({ errors }: { errors: FieldErrors }) {
  const t = useTranslations('workshop');
  return (
    <section className="flex flex-col gap-3">
      <h2 className={sectionTitleClass}>{t('register.sections.consents')}</h2>
      <Consent name="consentPd" required error={errors.consentPd}>
        {t.rich('consents.pd', {
          link: (chunks) => (
            <a
              href={WORKSHOP_PATHS.privacy}
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 underline"
            >
              {chunks}
            </a>
          ),
        })}
      </Consent>
      <Consent name="consentMarketing">{t('consents.marketing')}</Consent>
      <Consent name="consentPortfolio">{t('consents.portfolio')}</Consent>
    </section>
  );
}

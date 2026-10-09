'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import type { FormState } from '../actions/register';
import { Consent } from './Consent';
import { Notice } from './Notice';
import { ScaleField } from './ScaleField';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export function FeedbackForm({
  action,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const t = useTranslations('workshop');
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });
  if (state.status === 'success') return <Notice tone="success">{t('feedback.success')}</Notice>;
  const errors = state.status === 'error' ? state.fieldErrors : {};
  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <ScaleField
        name="recommendScore"
        min={0}
        max={10}
        label={t('feedback.recommend')}
        lowLabel={t('feedback.recommendLow')}
        highLabel={t('feedback.recommendHigh')}
        error={errors.recommendScore}
      />
      <ScaleField
        name="applicability"
        min={1}
        max={5}
        label={t('feedback.applicability')}
        lowLabel={t('feedback.applicabilityLow')}
        highLabel={t('feedback.applicabilityHigh')}
        error={errors.applicability}
      />
      <TextField
        name="mostUseful"
        multiline
        maxLength={1000}
        label={t('feedback.mostUseful')}
        error={errors.mostUseful}
      />
      <TextField
        name="planToImplement"
        multiline
        maxLength={1000}
        label={t('feedback.planToImplement')}
        error={errors.planToImplement}
      />
      <TextField
        name="testimonial"
        multiline
        maxLength={1000}
        label={t('feedback.testimonial')}
        error={errors.testimonial}
      />
      <Consent name="consentQuote">{t('consents.quote')}</Consent>
      <Consent name="wantsReview">{t('feedback.wantsReview')}</Consent>
      <Consent name="followupOk">{t('feedback.followupOk')}</Consent>
      {state.status === 'error' && state.formError && (
        <Notice tone="error">{state.formError}</Notice>
      )}
      <SubmitButton
        label={t('feedback.submit')}
        pendingLabel={t('register.submitting')}
        pending={pending}
      />
    </form>
  );
}

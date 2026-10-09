'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import type { FormState } from '../actions/register';
import { Notice } from './Notice';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export function CheckinForm({
  action,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const t = useTranslations('workshop');
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });
  const errors = state.status === 'error' ? state.fieldErrors : {};
  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <TextField
        name="email"
        type="email"
        label={t('checkin.email')}
        required
        autoComplete="email"
        error={errors.email}
      />
      <TextField
        name="code"
        label={t('checkin.code')}
        required
        maxLength={6}
        autoComplete="off"
        error={errors.code}
      />
      {state.status === 'error' && state.formError && (
        <Notice tone="error">{state.formError}</Notice>
      )}
      <SubmitButton
        pending={pending}
        label={t('checkin.submit')}
        pendingLabel={t('register.submitting')}
      />
    </form>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { startTransition, useActionState, type FormEvent } from 'react';
import { CHECKIN_CODE_LENGTH } from '@/config/workshop';
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

  // Submitted by hand rather than via <form action>: React 19 resets uncontrolled fields after a
  // form action, which would wipe the user's answers on every server-side error.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  const errors = state.status === 'error' ? state.fieldErrors : {};
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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
        maxLength={CHECKIN_CODE_LENGTH}
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

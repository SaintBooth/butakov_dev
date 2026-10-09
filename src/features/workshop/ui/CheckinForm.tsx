'use client';

import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useEffect, type FormEvent } from 'react';
import { CHECKIN_CODE_LENGTH } from '@/config/workshop';
import type { CheckinState } from '../actions/checkin';
import { Notice } from './Notice';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export function CheckinForm({
  action,
}: {
  action: (prev: CheckinState, fd: FormData) => Promise<CheckinState>;
}) {
  const t = useTranslations('workshop');
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });

  // A full load, not router.push: the token URL must never be seen by the running Metrika.
  useEffect(() => {
    if (state.status === 'checked_in') window.location.assign(state.feedbackUrl);
  }, [state]);

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

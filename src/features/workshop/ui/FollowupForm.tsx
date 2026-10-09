'use client';

import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { FIELD_LIMITS } from '@/config/workshop';
import type { FormState } from '../actions/register';
import {
  createFollowupSchema,
  issuesToFieldErrors,
  readFollowupForm,
  type FieldErrors,
} from '../schema';
import { Consent } from './Consent';
import { Notice } from './Notice';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export function FollowupForm({
  action,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const t = useTranslations('workshop');
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  if (state.status === 'success') return <Notice tone="success">{t('followup.success')}</Notice>;

  // Submitted by hand rather than via <form action>: React 19 resets uncontrolled fields after a
  // form action, which would wipe the user's answers on every server-side error.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Same schema as the server: fail fast in the browser; the server re-validates anyway.
    const r = createFollowupSchema(t).safeParse(readFollowupForm(fd));
    if (!r.success) {
      setClientErrors(issuesToFieldErrors(r.error.issues));
      return;
    }
    setClientErrors(null);
    startTransition(() => formAction(fd));
  };

  const errors = clientErrors ?? (state.status === 'error' ? state.fieldErrors : {});
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        name="implemented"
        multiline
        maxLength={FIELD_LIMITS.followupText}
        label={t('followup.implemented')}
        error={errors.implemented}
      />
      <TextField
        name="result"
        multiline
        maxLength={FIELD_LIMITS.followupText}
        label={t('followup.result')}
        error={errors.result}
      />
      <Consent name="letterOk">{t('followup.letterOk')}</Consent>
      {state.status === 'error' && state.formError && (
        <Notice tone="error">{state.formError}</Notice>
      )}
      <SubmitButton
        label={t('followup.submit')}
        pendingLabel={t('register.submitting')}
        pending={pending}
      />
    </form>
  );
}

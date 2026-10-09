'use client';

import { CalendarPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useState, type FormEvent } from 'react';
import type { FormState } from '../actions/register';
import {
  createRegistrationSchema,
  issuesToFieldErrors,
  readRegistrationForm,
  type FieldErrors,
} from '../schema';
import { Notice } from './Notice';
import { RegistrationConsents } from './RegistrationConsents';
import { RegistrationNeeds } from './RegistrationNeeds';
import { RegistrationProfile } from './RegistrationProfile';
import { SubmitButton } from './SubmitButton';

interface RegistrationFormProps {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  stamp: string;
  icsHref: string;
}

export function RegistrationForm({ action, stamp, icsHref }: RegistrationFormProps) {
  const t = useTranslations('workshop');
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  if (state.status === 'success') {
    return (
      <Notice tone="success">
        <p className="font-bold">{t('register.success.title')}</p>
        <p className="mt-1">{t('register.success.body')}</p>
        <a
          href={icsHref}
          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-teal-700 underline"
        >
          <CalendarPlus className="h-4 w-4" />
          {t('register.success.calendar')}
        </a>
      </Notice>
    );
  }

  // Submitted by hand rather than via <form action>: React 19 resets uncontrolled fields after a
  // form action, which would wipe the user's answers on every server-side error.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Same schema as the server: fail fast in the browser; the server re-validates anyway.
    const r = createRegistrationSchema(t).safeParse(readRegistrationForm(fd));
    if (!r.success) {
      setClientErrors(issuesToFieldErrors(r.error.issues));
      return;
    }
    setClientErrors(null);
    startTransition(() => formAction(fd));
  };

  const errors = clientErrors ?? (state.status === 'error' ? state.fieldErrors : {});
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input type="hidden" name="stamp" value={stamp} />
      <RegistrationProfile errors={errors} />
      <RegistrationNeeds errors={errors} />
      <RegistrationConsents errors={errors} />
      {state.status === 'error' && state.formError && (
        <Notice tone="error">{state.formError}</Notice>
      )}
      <SubmitButton
        pending={pending}
        label={t('register.submit')}
        pendingLabel={t('register.submitting')}
      />
    </form>
  );
}

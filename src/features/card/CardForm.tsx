'use client';

import { clsx } from 'clsx';
import { ArrowRight, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CONTACT } from '@/config/contact';
import type { CardFormData, Direction } from './cardSchema';
import { useCardForm } from './useCardForm';

const inputBase =
  'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40';

function fieldClass(hasError: boolean) {
  return clsx(inputBase, hasError ? 'border-red-400' : 'border-slate-200 focus:border-teal-400');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-red-500">{message}</p>;
}

export default function CardForm({ direction }: { direction: Direction }) {
  const t = useTranslations('card.form');
  const tSuccess = useTranslations('card.success');
  const tErrors = useTranslations('card.errors');
  const { isSubmitted, isSubmitting, errors, submit, clearError } = useCardForm(
    (k) => tErrors(k.replace('errors.', '')),
    direction
  );

  const isAudit = direction === 'audit';
  const tgText = encodeURIComponent(isAudit ? t('telegramPrefillAudit') : t('telegramPrefillAi'));

  if (isSubmitted) {
    return (
      <div className="pt-4 text-center">
        <div className="card-pop mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-6 w-6 text-teal-500" />
        </div>
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">
          {isAudit ? tSuccess('titleAudit') : tSuccess('titleAi')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{tSuccess('body')}</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const r = await submit(e);
    if (!r.success && r.reason === 'server') alert(tErrors('server'));
    if (!r.success && r.reason === 'network') alert(tErrors('network'));
  };

  const clear = (f: keyof CardFormData) => () => clearError(f);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2.5 pt-4">
      <div>
        <input
          name="name"
          placeholder={t('name')}
          className={fieldClass(!!errors.name)}
          onChange={clear('name')}
        />
        <FieldError message={errors.name} />
      </div>
      <div>
        <input
          name="contact"
          placeholder={t('contact')}
          className={fieldClass(!!errors.contact)}
          onChange={clear('contact')}
        />
        <FieldError message={errors.contact} />
      </div>

      <div className="card-reveal" data-open={isAudit}>
        <div className="card-reveal-inner">
          <input
            name="website"
            placeholder={t('website')}
            className={clsx(fieldClass(false), 'mb-2.5')}
          />
        </div>
      </div>

      <textarea
        name="problem"
        rows={3}
        placeholder={t('problem')}
        className={clsx(inputBase, 'resize-none border-slate-200 focus:border-teal-400')}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-transform duration-100 active:scale-95 disabled:opacity-70 [@media(hover:hover)]:hover:bg-teal-500"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            {isAudit ? t('submitAudit') : t('submitAi')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <a
        href={`${CONTACT.telegramUrl}?text=${tgText}`}
        target="_blank"
        rel="noreferrer"
        className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-600 transition-colors [@media(hover:hover)]:hover:text-teal-700"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {t('telegramFallback')}
      </a>
    </form>
  );
}

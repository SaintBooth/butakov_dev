'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import type { ManageIntent, ManageState } from '../actions/manage';
import { Notice } from './Notice';

const DONE_KEY: Record<ManageIntent, string> = {
  cancel: 'cancelDone',
  unsubscribe: 'unsubscribeDone',
  revoke: 'revokeDone',
};

const buttonClass =
  'rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors disabled:opacity-60 [@media(hover:hover)]:hover:border-teal-400';

interface ManagePanelProps {
  action: (prev: ManageState, fd: FormData) => Promise<ManageState>;
  canCancel: boolean;
  statusLabel: string;
}

export function ManagePanel({ action, canCancel, statusLabel }: ManagePanelProps) {
  const t = useTranslations('workshop.manage');
  const [state, formAction, pending] = useActionState(action, { done: null, error: null });
  // The page was rendered before the action ran, so the post-cancel state comes from the result.
  const cancelled = state.done === 'cancel';
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="info">{cancelled ? t('status.cancelled') : statusLabel}</Notice>
      {state.done && <Notice tone="success">{t(DONE_KEY[state.done])}</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <form action={formAction} className="flex flex-wrap gap-2">
        {canCancel && !cancelled && (
          <button name="intent" value="cancel" disabled={pending} className={buttonClass}>
            {t('cancel')}
          </button>
        )}
        <button name="intent" value="unsubscribe" disabled={pending} className={buttonClass}>
          {t('unsubscribe')}
        </button>
        <button name="intent" value="revoke" disabled={pending} className={buttonClass}>
          {t('revoke')}
        </button>
      </form>
      <p className="text-xs text-slate-500">{t('revokeNote')}</p>
    </div>
  );
}

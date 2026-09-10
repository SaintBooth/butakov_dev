import { useState } from 'react';
import type { CardFormData, Direction } from './cardSchema';
import { createCardSchema, web3formsResponseSchema } from './cardSchema';
import { reachGoal } from './analytics';

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

type SubmitResult = { success: boolean; reason?: 'server' | 'network' };

export function useCardForm(t: (key: string) => string, direction: Direction) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData, string>>>({});

  const clearError = (field: keyof CardFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>): Promise<SubmitResult> => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // honeypot: a real user never fills this hidden field; bots do — drop silently
    if (fd.get('botcheck')) return { success: true };

    const raw = {
      name: fd.get('name') ?? '',
      contact: fd.get('contact') ?? '',
      problem: fd.get('problem') || undefined,
      website: fd.get('website') || undefined,
      direction,
    };

    const parsed = createCardSchema(t).safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CardFormData, string>> = {};
      parsed.error.issues.forEach(({ path, message }) => {
        fieldErrors[path[0] as keyof CardFormData] = message;
      });
      setErrors(fieldErrors);
      return { success: false };
    }
    setErrors({});
    setIsSubmitting(true);

    fd.set('direction', direction);
    fd.append('access_key', WEB3FORMS_KEY);
    fd.append('subject', `Заявка с визитки (${direction}) — butakov.dev`);
    fd.append('from_name', 'Визитка butakov.dev');

    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const json: unknown = await res.json();
      const ok = web3formsResponseSchema.safeParse(json);
      if (ok.success && ok.data.success) {
        form.reset();
        setIsSubmitted(true);
        reachGoal('card_lead', { direction });
        return { success: true };
      }
      return { success: false, reason: 'server' };
    } catch {
      return { success: false, reason: 'network' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitted, isSubmitting, errors, submit, clearError };
}

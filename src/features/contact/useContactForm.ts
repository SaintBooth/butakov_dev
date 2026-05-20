import { useState } from 'react';
import type { ContactFormData } from './contactSchema';
import { contactSchema, web3formsResponseSchema } from './contactSchema';

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

interface SubmitResult {
  success: boolean;
  reason?: string;
}

interface UseContactFormResult {
  isSubmitted: boolean;
  isSubmitting: boolean;
  errors: Partial<Record<keyof ContactFormData, string>>;
  submit: (e: React.FormEvent<HTMLFormElement>, selectedService: string) => Promise<SubmitResult>;
  clearError: (field: keyof ContactFormData) => void;
}

export function useContactForm(): UseContactFormResult {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const validate = (rawData: unknown): boolean => {
    const result = contactSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach(({ path, message }) => {
        const key = path[0] as keyof ContactFormData;
        fieldErrors[key] = message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
    selectedService: string
  ): Promise<SubmitResult> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const rawData = {
      name: formData.get('name') ?? '',
      contact: formData.get('contact') ?? '',
      service: formData.get('service') || undefined,
      message: formData.get('message') || undefined,
    };

    if (!validate(rawData)) return { success: false };

    setIsSubmitting(true);
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', 'Новая заявка с сайта butakov.dev!');
    formData.append('from_name', 'Сайт butakov.dev');
    if (selectedService) formData.set('service', selectedService);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const json: unknown = await res.json();
      const parsed = web3formsResponseSchema.safeParse(json);

      if (parsed.success && parsed.data.success) {
        (e.target as HTMLFormElement).reset();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
        return { success: true };
      }
      return { success: false, reason: 'server' };
    } catch {
      return { success: false, reason: 'network' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = (field: keyof ContactFormData): void => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return { isSubmitted, isSubmitting, errors, submit, clearError };
}

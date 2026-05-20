import { useState } from 'react';
import { contactSchema, web3formsResponseSchema } from './contactSchema.js';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export function useContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = (rawData) => {
    const result = contactSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(({ path, message }) => {
        fieldErrors[path[0]] = message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const submit = async (e, selectedService) => {
    e.preventDefault();
    const formData = new FormData(e.target);

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
      const json = await res.json();
      const parsed = web3formsResponseSchema.safeParse(json);

      if (parsed.success && parsed.data.success) {
        e.target.reset();
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

  const clearError = (field) => {
    if (errors[field])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
  };

  return { isSubmitted, isSubmitting, errors, submit, clearError };
}

'use client';

import { clsx } from 'clsx';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { services } from '../../data/services';
import { PrivacyModalTrigger } from '../privacy/PrivacyModalTrigger';
import type { ContactFormData } from './contactSchema';
import { useContactForm } from './useContactForm';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-600 text-xs font-semibold mt-1">{message}</p>;
}

function inputClass(hasError: boolean): string {
  return clsx(
    'w-full bg-white/50 backdrop-blur-sm border rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all font-medium shadow-sm',
    hasError
      ? 'border-red-400/80 focus:ring-red-500/30 bg-red-50/30'
      : 'border-white/80 focus:ring-teal-500/50 focus:bg-white'
  );
}

interface ContactFormProps {
  /** `services` item id to preselect, e.g. when opened from a service landing. */
  defaultServiceId?: string;
}

export default function ContactForm({ defaultServiceId }: ContactFormProps) {
  const t = useTranslations('contact');
  const tServices = useTranslations('services');
  const id = useId();
  const initialService = defaultServiceId ? tServices(`items.${defaultServiceId}.title`) : '';
  const [selectedService, setSelectedService] = useState(initialService);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { isSubmitted, isSubmitting, errors, submit, clearError } = useContactForm(t);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitError(null);
    const result = await submit(e, selectedService);
    if (result.success) {
      setSelectedService(initialService);
    } else if (result.reason === 'server') {
      setSubmitError(t('errorServer'));
    } else if (result.reason === 'network') {
      setSubmitError(t('errorNetwork'));
    }
  };

  if (isSubmitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300"
      >
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-teal-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('success')}</h3>
        <p className="text-slate-600 font-medium">{t('successSub')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor={`${id}-name`} className="text-sm font-bold text-slate-700">
            {t('name')}
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            className={inputClass(!!errors.name)}
            onChange={() => clearError('name' as keyof ContactFormData)}
          />
          <FieldError message={errors.name} />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${id}-contact`} className="text-sm font-bold text-slate-700">
            {t('contactField')}
          </label>
          <input
            id={`${id}-contact`}
            name="contact"
            type="text"
            placeholder={t('contactPlaceholder')}
            className={inputClass(!!errors.contact)}
            onChange={() => clearError('contact' as keyof ContactFormData)}
          />
          <FieldError message={errors.contact} />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${id}-service`} className="text-sm font-bold text-slate-700">
          {t('service')}
        </label>
        <select
          id={`${id}-service`}
          name="service"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white transition-all appearance-none cursor-pointer font-medium shadow-sm"
        >
          <option value="">{t('serviceEmpty')}</option>
          {services.map((s) => {
            const title = tServices(`items.${s.id}.title`);
            return (
              <option key={s.id} value={title}>
                {title}
              </option>
            );
          })}
          <option value={t('serviceOther')}>{t('serviceOther')}</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${id}-message`} className="text-sm font-bold text-slate-700">
          {t('message')}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          placeholder={t('messagePlaceholder')}
          className="w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white transition-all resize-none font-medium shadow-sm"
        />
      </div>

      {submitError && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isSubmitting ? t('submitting') : t('submit')}
        {!isSubmitting && (
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        )}
      </button>

      <p className="text-xs text-center text-slate-500 font-medium">
        {t('privacyText')}{' '}
        <PrivacyModalTrigger className="text-teal-700 hover:text-teal-800 underline">
          {t('privacy')}
        </PrivacyModalTrigger>
        .
      </p>
    </form>
  );
}

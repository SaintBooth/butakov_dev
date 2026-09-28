'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal/Modal';
import ContactForm from './ContactForm';

interface ContactModalApi {
  open: (serviceId?: string) => void;
}

const ContactModalContext = createContext<ContactModalApi | null>(null);

/** Null outside the provider, so triggers can fall back to plain navigation. */
export function useContactModal(): ContactModalApi | null {
  return useContext(ContactModalContext);
}

interface OpenState {
  serviceId?: string;
  // Bumped on every open so the form remounts clean instead of showing the last success screen.
  key: number;
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('contact');
  const titleId = useId();
  const [state, setState] = useState<OpenState | null>(null);

  const open = useCallback((serviceId?: string) => {
    setState((prev) => ({ serviceId, key: (prev?.key ?? 0) + 1 }));
  }, []);
  const close = useCallback(() => setState(null), []);
  const api = useMemo(() => ({ open }), [open]);

  return (
    <ContactModalContext.Provider value={api}>
      {children}
      {state && (
        <Modal
          onClose={close}
          labelledBy={titleId}
          className="max-w-2xl bg-white rounded-[2rem] p-6 sm:p-10"
        >
          <button
            type="button"
            onClick={close}
            aria-label={t('close')}
            className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-8 pr-10">
            <h2 id={titleId} className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-slate-600 font-medium">{t('subtitle')}</p>
          </div>
          <ContactForm key={state.key} defaultServiceId={state.serviceId} />
        </Modal>
      )}
    </ContactModalContext.Provider>
  );
}

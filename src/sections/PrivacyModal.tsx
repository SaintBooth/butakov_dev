'use client';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Modal from '../components/ui/Modal/Modal';

interface PrivacyModalProps {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
  const t = useTranslations('privacy');

  return (
    <Modal
      onClose={onClose}
      className="max-w-3xl bg-white rounded-[2rem] flex flex-col p-8 sm:p-12"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-all z-20"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-3xl font-bold text-slate-900 mb-6 pr-8">{t('title')}</h2>
      <div className="prose prose-sm prose-slate max-w-none">
        <p>{t('intro')}</p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">{t('section1Title')}</h3>
        <p>{t('section1Website')}</p>
        <p>{t('section1User')}</p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">{t('section2Title')}</h3>
        <p>{t('section2Body')}</p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">{t('section3Title')}</h3>
        <p>{t('section3Body')}</p>
        <p className="text-slate-400 italic mt-8 text-xs">{t('disclaimer')}</p>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-500 transition-all"
        >
          {t('close')}
        </button>
      </div>
    </Modal>
  );
}

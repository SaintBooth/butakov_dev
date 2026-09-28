import { useTranslations } from 'next-intl';
import ContactForm from './ContactForm';

interface ContactProps {
  defaultServiceId?: string;
}

export default function Contact({ defaultServiceId }: ContactProps) {
  const t = useTranslations('contact');

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden z-10 border-t border-white/40 scroll-reveal"
    >
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-teal-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-[-200px] bottom-[-200px] w-[500px] h-[500px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-teal-900/10 border border-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('title')}</h2>
            <p className="text-slate-600 font-medium">{t('subtitle')}</p>
          </div>
          <ContactForm defaultServiceId={defaultServiceId} />
        </div>
      </div>
    </section>
  );
}

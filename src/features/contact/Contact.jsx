import { clsx } from 'clsx';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { services } from '../../data/services.jsx';
import { useContactForm } from './useContactForm.js';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-semibold mt-1">{message}</p>;
}

function inputClass(hasError) {
  return clsx(
    'w-full bg-white/50 backdrop-blur-sm border rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium shadow-sm',
    hasError
      ? 'border-red-400/80 focus:ring-red-500/30 bg-red-50/30'
      : 'border-white/80 focus:ring-teal-500/50 focus:bg-white'
  );
}

export default function Contact({ selectedService, onServiceChange, onPrivacyClick }) {
  const { isSubmitted, isSubmitting, errors, submit, clearError } = useContactForm();

  const handleSubmit = async (e) => {
    const result = await submit(e, selectedService);
    if (result.success) {
      onServiceChange('');
    } else if (result.reason === 'server') {
      alert('Упс! Что-то пошло не так. Пожалуйста, напишите мне в Telegram.');
    } else if (result.reason === 'network') {
      alert('Ошибка отправки. Проверьте подключение к интернету.');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden z-10 border-t border-white/40">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-teal-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-[-200px] bottom-[-200px] w-[500px] h-[500px] bg-cyan-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-teal-900/10 border border-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Давайте обсудим задачу</h2>
            <p className="text-slate-600 font-medium">Оставьте контакты и опишите, к каким метрикам вы стремитесь.</p>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка успешно отправлена!</h3>
              <p className="text-slate-600 font-medium">Я свяжусь с вами в ближайшее время для обсуждения деталей.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Ваше имя *</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Иван Иванов"
                    className={inputClass(!!errors.name)}
                    onChange={() => clearError('name')}
                  />
                  <FieldError message={errors.name} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Telegram / Телефон *</label>
                  <input
                    name="contact"
                    type="text"
                    placeholder="@username или +7..."
                    className={inputClass(!!errors.contact)}
                    onChange={() => clearError('contact')}
                  />
                  <FieldError message={errors.contact} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Что вас интересует?</label>
                <select
                  name="service"
                  value={selectedService}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white transition-all appearance-none cursor-pointer font-medium shadow-sm"
                >
                  <option value="">Выберите услугу (необязательно)</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Другое">Комплексная задача / Другое</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">О проекте</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Опишите вашу бизнес-задачу, каких результатов хотите достичь или прикрепите ссылку на ТЗ..."
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-white transition-all resize-none font-medium shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSubmitting ? 'Отправка...' : 'Обсудить проект'}
                {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4 font-medium">
                Нажимая на кнопку, вы даете согласие на обработку персональных данных в соответствии с{' '}
                <button type="button" onClick={onPrivacyClick} className="text-teal-600 hover:text-teal-700 underline">
                  Политикой конфиденциальности (152-ФЗ)
                </button>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

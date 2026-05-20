import { MessageSquare, Github, Mail, ShieldCheck } from 'lucide-react';
import { SOCIAL } from '../config/social';

const NAV_LINKS = [
  { href: '#services', label: 'Стек и Услуги' },
  { href: '#b2b', label: 'Гарантии для B2B' },
  { href: '#cases', label: 'Кейсы' },
];

const REQUISITES = [
  'ИП Бутаков Александр Сергеевич',
  'ИНН: 667011271708',
  'ОГРНИП: 326965800043687',
];

interface FooterProps {
  onPrivacyClick: () => void;
}

export default function Footer({ onPrivacyClick }: FooterProps) {
  return (
    <footer className="bg-slate-950 pt-16 pb-32 md:pb-12 border-t border-slate-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div className="flex flex-col gap-4 items-start">
            <img
              src="/favicon.svg"
              alt="butakov.dev"
              width="40"
              height="40"
              className="h-10 w-10 object-contain"
            />
            <p className="text-slate-400 text-sm">
              Разрабатываю и усиливаю digital-продукты: 1С-Битрикс, WordPress, React/Next.js, Django
              и AI-автоматизация.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href={SOCIAL.telegram}
                aria-label="Telegram"
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-600 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL.github}
                aria-label="GitHub"
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-600 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL.email}
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-600 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold mb-2">Навигация</h4>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-400 hover:text-teal-400 text-sm transition-colors w-fit"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={onPrivacyClick}
              className="text-slate-400 hover:text-teal-400 text-sm transition-colors w-fit text-left"
            >
              Политика конфиденциальности
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold mb-2">Реквизиты</h4>
            {REQUISITES.map((r) => (
              <p key={r} className="text-slate-400 text-sm">
                {r}
              </p>
            ))}
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> Работа по договору, ЭДО
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-900/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm font-medium">
            © {new Date().getFullYear()} butakov.dev. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}

'use client';
import { X } from 'lucide-react';
import Modal from '../components/ui/Modal/Modal';

interface PrivacyModalProps {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
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
      <h2 className="text-3xl font-bold text-slate-900 mb-6 pr-8">Политика конфиденциальности</h2>
      <div className="prose prose-sm prose-slate max-w-none">
        <p>
          Настоящая Политика конфиденциальности составлена в соответствии с требованиями
          Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок
          обработки персональных данных Индивидуальным предпринимателем Бутаковым Александром
          Сергеевичем (далее – Оператор).
        </p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">1. Основные понятия</h3>
        <p>1.1. Веб-сайт — https://butakov.dev.</p>
        <p>1.2. Пользователь — любой посетитель веб-сайта https://butakov.dev.</p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">2. Цели сбора персональных данных</h3>
        <p>
          Информирование пользователя; заключение и исполнение гражданско-правовых договоров;
          предоставление доступа к сервисам и материалам сайта.
        </p>
        <h3 className="font-bold text-slate-800 mt-6 mb-2">3. Права и обязанности</h3>
        <p>
          Оператор имеет право получать от Пользователя достоверные данные. Пользователь имеет право
          на получение информации об обработке его персональных данных.
        </p>
        <p className="text-slate-400 italic mt-8 text-xs">
          * Базовый шаблон. Рекомендуется заменить на полный юридически верифицированный документ.
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-500 transition-all"
        >
          Понятно, закрыть
        </button>
      </div>
    </Modal>
  );
}

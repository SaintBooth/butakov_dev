import { X } from 'lucide-react';

export default function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col p-8 sm:p-12">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-all z-20">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-slate-900 mb-6 pr-8">Политика конфиденциальности</h2>
        <div className="prose prose-sm prose-slate max-w-none">
          <p>Настоящая Политика конфиденциальности составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые Индивидуальным предпринимателем Бутаковым Александром Сергеевичем (далее – Оператор).</p>
          <h3 className="font-bold text-slate-800 mt-6 mb-2">1. Основные понятия</h3>
          <p>1.1. Веб-сайт — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу https://butakov.dev.</p>
          <p>1.2. Пользователь — любой посетитель веб-сайта https://butakov.dev.</p>
          <h3 className="font-bold text-slate-800 mt-6 mb-2">2. Цели сбора персональных данных</h3>
          <p>Цель обработки персональных данных Пользователя — информирование Пользователя посредством отправки электронных писем; заключение, исполнение и прекращение гражданско-правовых договоров; предоставление Пользователю доступа к сервисам, информации и/или материалам, содержащимся на веб-сайте.</p>
          <h3 className="font-bold text-slate-800 mt-6 mb-2">3. Права и обязанности</h3>
          <p>Оператор имеет право получать от Пользователя достоверные информацию и/или документы, содержащие персональные данные. Пользователь имеет право на получение информации, касающейся обработки его персональных данных, если такое право не ограничено в соответствии с федеральными законами.</p>
          <p className="text-slate-400 italic mt-8 text-xs">* Это базовый шаблон. Рекомендуется заменить на полный юридически верифицированный документ.</p>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button onClick={onClose} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-500 transition-all">
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

import { b2bGuarantees } from '../data/b2bGuarantees.js';

export default function B2bGuarantees() {
  return (
    <section id="b2b" className="py-24 relative z-10 border-t border-white/40 bg-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Надежный партнер для бизнеса</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
            Почему осознанные компании выбирают работу со мной, а не со студиями или фрилансерами.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {b2bGuarantees.map((item) => (
            <div key={item.title} className="relative z-10 flex flex-col p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-white/80 border border-white flex items-center justify-center mb-6 shadow-sm">
                <item.Icon className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ChevronRight } from 'lucide-react';
import { services } from '../data/services.jsx';

export default function Services({ onContactClick }) {
  return (
    <section id="services" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Какой стек подходит для вашей задачи?
            </h2>
            <p className="text-slate-600 text-lg font-medium">
              Подбираю технологию под задачу — не переплатите за лишнюю сложность и поддержку.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group p-8 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white hover:border-teal-200/80 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-teal-500/20 transition-colors duration-300" />
              <div className="bg-white/80 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                <service.Icon className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-600 mb-8 leading-relaxed font-medium flex-grow">
                {service.description}
              </p>
              <button
                onClick={() => onContactClick(service.title)}
                className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors group/btn mt-auto"
              >
                Обсудить задачу
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

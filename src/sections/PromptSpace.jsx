import { Sparkles, Cpu, ExternalLink, BrainCircuit } from 'lucide-react';

const PROMPTSPACE_URL = 'https://promptspace.ru/';
const TECH_STACK = ['Next.js 15 SSR', 'Django Ninja REST', 'PostgreSQL + pgvector', 'HashiCorp Vault'];

export default function PromptSpace() {
  return (
    <section id="promptspace" className="py-24 relative overflow-hidden bg-slate-900/90 backdrop-blur-3xl border-y border-white/20">
      <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-[-100px] bottom-[-100px] w-[400px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-800/40 border border-slate-600/30 rounded-[2.5rem] p-8 md:p-12 lg:p-16 backdrop-blur-xl flex flex-col lg:flex-row items-center gap-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[2.5rem]" />
          <div className="lg:w-[55%] space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/50 text-xs font-bold text-teal-400 mb-2 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Собственный SaaS Продукт
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">PromptSpace</h2>
            <p className="text-xl text-teal-400 font-bold">Платформа монетизации AI-промптов</p>
            <p className="text-slate-300 leading-relaxed font-medium">
              Я с нуля спроектировал и запустил маркетплейс, где промпты надежно защищены (152-ФЗ, Envelope-шифрование), а платежи автоматически расщепляются между платформой и авторами.
            </p>
            <div className="mt-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Под капотом
              </h4>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map(tech => (
                  <span key={tech} className="px-2.5 py-1 bg-slate-800 border border-slate-600 text-teal-300 text-xs font-bold rounded-md">{tech}</span>
                ))}
              </div>
            </div>
            <div className="pt-6">
              <a href={PROMPTSPACE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex px-8 py-4 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25 items-center gap-2 group">
                Посмотреть архитектуру <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
          <div className="lg:w-[45%] w-full">
            <a href={PROMPTSPACE_URL} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl group flex items-center justify-center cursor-pointer">
              <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <div className="relative z-20 text-center px-6 transform group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 shadow-2xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" />
                  <BrainCircuit className="w-12 h-12 text-teal-400 relative z-10" />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight">PromptSpace<span className="text-teal-400">.ru</span></h3>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

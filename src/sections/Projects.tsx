import { Cpu, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { clsx } from 'clsx';
import { projects } from '../data/projects';

export default async function Projects() {
  const t = await getTranslations('projects');

  return (
    <section
      id="projects"
      className="py-24 relative overflow-hidden bg-slate-900/90 backdrop-blur-3xl border-y border-white/20"
    >
      <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-[-100px] bottom-[-100px] w-[400px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('heading')}</h2>
          <p className="text-slate-400 text-lg font-medium">{t('subheading')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className={clsx(
                'group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-slate-800/40 border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1',
                project.accentBorderClass,
                project.accentShadowClass
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[2.5rem]" />
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={clsx(
                      'w-12 h-12 flex items-center justify-center shadow-lg flex-shrink-0',
                      project.markClassName
                    )}
                    style={project.markStyle}
                  >
                    {project.markLabel && (
                      <span className="text-white font-extrabold text-sm">{project.markLabel}</span>
                    )}
                  </div>
                  <h3 className={clsx('text-2xl text-white tracking-tight', project.wordmarkClass)}>
                    {project.name}
                  </h3>
                </div>

                <span
                  className={clsx(
                    'inline-block w-fit px-3 py-1 mb-4 rounded-full bg-slate-900/60 border border-slate-700/50 text-[11px] font-bold uppercase tracking-wider',
                    project.accentTextClass
                  )}
                >
                  {t(`items.${project.id}.badge`)}
                </span>

                <p className={clsx('text-lg font-bold mb-3', project.accentTextClass)}>
                  {t(`items.${project.id}.tagline`)}
                </p>
                <p className="text-slate-300 leading-relaxed font-medium mb-6">
                  {t(`items.${project.id}.description`)}
                </p>

                <div className="mt-auto mb-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> {t('underHood')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'inline-flex w-fit px-6 py-3 rounded-xl text-white font-bold transition-all shadow-xl items-center gap-2 group/cta',
                    project.ctaButtonClass
                  )}
                >
                  {t('cta')}
                  <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

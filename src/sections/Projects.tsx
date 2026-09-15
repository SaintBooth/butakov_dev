import { Cpu, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { clsx } from 'clsx';
import { projects } from '../data/projects';

export default async function Projects() {
  const t = await getTranslations('projects');

  return (
    <section
      id="projects"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-white/40"
    >
      <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-[-100px] bottom-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
          <p className="text-slate-600 text-lg font-medium">{t('subheading')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className={clsx(
                'group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border shadow-xl shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1',
                '[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none',
                project.accentBorderClass,
                project.accentShadowClass
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2.5rem]" />
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-6">
                  <project.MarkIcon className="w-12 h-12 flex-shrink-0" />
                  <h3
                    className={clsx(
                      'text-2xl text-slate-900 tracking-tight',
                      project.wordmarkClass
                    )}
                  >
                    {project.name}
                  </h3>
                </div>

                <span
                  className={clsx(
                    'inline-block w-fit px-3 py-1 mb-4 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold uppercase tracking-wider',
                    project.accentTextOnLightClass
                  )}
                >
                  {t(`items.${project.id}.badge`)}
                </span>

                <p className={clsx('text-lg font-bold mb-3', project.accentTextOnLightClass)}>
                  {t(`items.${project.id}.tagline`)}
                </p>
                <p className="text-slate-600 leading-relaxed font-medium mb-6">
                  {t(`items.${project.id}.description`)}
                </p>

                <div className="mt-auto mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> {t('underHood')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-md"
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

import { Database, UserCog } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { experienceData } from '../data/experience';
import GithubActivity from './GithubActivity';

export default async function Experience() {
  const t = await getTranslations('experience');
  const tSkills = await getTranslations('skills');
  const hardSkills = tSkills.raw('hard') as string[];
  const softSkills = tSkills.raw('soft') as string[];

  return (
    <section id="experience" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
            <p className="text-slate-600 text-lg font-medium">{t('subheading')}</p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          <div className="lg:w-2/3">
            <div className="relative border-l-2 border-teal-200/50 pl-8 ml-4 space-y-12">
              {experienceData.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-teal-500 shadow-sm shadow-teal-500/30" />
                  <span className="inline-block px-3 py-1 mb-3 rounded-md bg-white/60 border border-white text-xs font-bold text-teal-700 shadow-sm backdrop-blur-sm">
                    {exp.period}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {t(`items.${exp.id}.role`)}
                  </h3>
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">
                    {t(`items.${exp.id}.company`)}
                  </h4>
                  <p className="text-slate-600 font-medium leading-relaxed bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
                    {t(`items.${exp.id}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3 flex flex-col gap-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t('stackLabel')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {hardSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t('softLabel')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <GithubActivity />
          </div>
        </div>
      </div>
    </section>
  );
}

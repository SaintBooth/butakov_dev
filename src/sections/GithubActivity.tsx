import { Github, ArrowUpRight } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { getGithubActivity, getDemoGithubActivity, getContributionLevel } from '../utils/github';

const LEVEL_CLASSES = ['bg-slate-100', 'bg-teal-200', 'bg-teal-400', 'bg-teal-500', 'bg-teal-700'];

// Fixed count (not a scroll container) so the grid always fits the card width without overflow
const WEEKS_TO_SHOW = 16;

export default async function GithubActivity() {
  const t = await getTranslations('githubSection');
  const locale = await getLocale();
  const data = (await getGithubActivity()) ?? getDemoGithubActivity();
  const recentWeeks = data.weeks.slice(-WEEKS_TO_SHOW);
  const username = process.env.GITHUB_USERNAME ?? 'SaintBooth';
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl shadow-slate-200/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Github className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-none">{t('heading')}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {data.totalContributions.toLocaleString(numberLocale)} {t('contributions')} ·{' '}
            {data.publicRepos} {t('repos')}
          </p>
        </div>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${recentWeeks.length}, 1fr)` }}
      >
        {recentWeeks.map((week, wi) => (
          <div key={wi} className="grid grid-rows-7 gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count}`}
                className={`aspect-square rounded-sm ${LEVEL_CLASSES[getContributionLevel(day.count)]}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span>{t('less')}</span>
          {LEVEL_CLASSES.map((cls) => (
            <div key={cls} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
          ))}
          <span>{t('more')}</span>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-teal-600 text-xs font-bold hover:text-teal-700 transition-colors flex items-center gap-1 group"
        >
          {t('viewProfile')}{' '}
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}

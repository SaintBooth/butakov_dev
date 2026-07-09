import { ArrowRight, LineChart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation';
import { getAllCaseFrontmatters } from '../../utils/cases';
import { getSchemaItemList } from '../../config/schema';

const MAX_CASES = 6;
const DETAILED_COUNT = 3;

interface CasesProps {
  locale: string;
}

export default async function Cases({ locale }: CasesProps) {
  const t = await getTranslations({ locale, namespace: 'casesSection' });
  const tJournal = await getTranslations({ locale, namespace: 'journal' });
  const allCases = await getAllCaseFrontmatters(locale);
  const cases = allCases.slice(0, MAX_CASES);
  const detailed = cases.slice(0, DETAILED_COUNT);
  const brief = cases.slice(DETAILED_COUNT);

  if (cases.length === 0) return null;

  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US';
  const itemListSchema = getSchemaItemList({
    name: t('heading'),
    items: cases.map(({ slug, frontmatter: fm }) => ({
      name: fm.title,
      url: `${base}${ruPrefix}/journal/${slug}`,
      description: fm.excerpt,
      datePublished: fm.date,
    })),
  });

  return (
    <section
      id="cases"
      className="py-24 relative z-10 border-t border-white/40 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-[26rem] h-[26rem] rounded-full bg-cyan-200/30 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
            <p className="text-slate-600 text-lg font-medium">{t('subheading')}</p>
          </div>
          <Link
            href="/journal"
            className="mt-6 md:mt-0 shrink-0 text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-2 group"
          >
            {t('viewAll')}{' '}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {detailed.map(({ slug, frontmatter: fm }) => (
            <Link
              key={slug}
              href={`/journal/${slug}`}
              className="group bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-300 transition-all flex flex-col shadow-lg shadow-slate-900/5"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full">
                  {fm.tags[0]}
                </span>
                <time
                  dateTime={fm.date}
                  className="text-xs font-bold text-slate-400 uppercase tracking-wide"
                >
                  {new Date(fm.date).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </time>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                {fm.title}
              </h3>
              <p className="text-slate-600 font-medium text-sm mb-6 flex-grow">{fm.excerpt}</p>
              <div className="bg-teal-50/60 backdrop-blur-md rounded-xl p-4 mb-4 flex items-start gap-3 border border-teal-100 shadow-sm">
                <LineChart className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-teal-900">{fm.metric}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {fm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-600 text-xs font-bold rounded-md shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-teal-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                {tJournal('readMore')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        {brief.length > 0 && (
          <div className="space-y-3">
            {brief.map(({ slug, frontmatter: fm }) => (
              <Link
                key={slug}
                href={`/journal/${slug}`}
                className="group flex items-center justify-between gap-4 p-5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:-translate-y-0.5 transition-all shadow-sm shadow-slate-900/5"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                    {fm.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
                    <span>
                      {new Date(fm.date).toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <span>·</span>
                    <span className="text-teal-600">{fm.metric}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { ArrowRight, LineChart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { LANDING_IDS, landingPath, type LandingId, type LandingLocale } from '@/config/landings';
import { landings } from '@/data/landings';
import { Link } from '@/i18n/navigation';
import { getAllCaseFrontmatters } from '@/utils/cases';

interface LandingRelatedProps {
  id: LandingId;
  locale: LandingLocale;
}

export default async function LandingRelated({ id, locale }: LandingRelatedProps) {
  const tc = await getTranslations({ locale, namespace: 'landingsCommon' });
  const tJournal = await getTranslations({ locale, namespace: 'journal' });
  const tLandings = await getTranslations({ locale, namespace: 'landings' });
  const all = await getAllCaseFrontmatters(locale);
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  // Keep the curated order from data/landings; skip slugs missing in this locale.
  const cases = landings[id].caseSlugs.flatMap((slug) => bySlug.get(slug) ?? []);
  const others = LANDING_IDS.filter((other) => other !== id);

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {cases.length > 0 && (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10">
              {tc('casesHeading')}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-16">
              {cases.map(({ slug, frontmatter: fm }) => (
                <li key={slug}>
                  <Link
                    href={`/journal/${slug}`}
                    className="group h-full flex flex-col p-6 md:p-7 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                      {fm.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mb-4 flex-grow">
                      {fm.excerpt}
                    </p>
                    {fm.metric && (
                      <p className="flex items-start gap-2 text-sm font-bold text-teal-900 mb-4">
                        <LineChart
                          className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {fm.metric}
                      </p>
                    )}
                    <span className="text-teal-700 font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      {tJournal('readMore')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="text-2xl font-bold text-slate-900 mb-6">{tc('otherServices')}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {others.map((other) => {
            const { Icon } = landings[other];
            return (
              <li key={other}>
                <Link
                  href={landingPath(other, locale)}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white hover:border-teal-200 transition-colors"
                >
                  <Icon className="w-6 h-6 text-teal-500 flex-shrink-0" aria-hidden="true" />
                  <span className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                    {tLandings(`${other}.breadcrumb`)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

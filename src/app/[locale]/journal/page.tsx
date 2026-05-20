import Link from 'next/link';
import { getAllCaseFrontmatters } from '@/utils/cases';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  const cases = await getAllCaseFrontmatters(locale);

  return (
    <main className="max-w-4xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
        {locale === 'ru' ? 'Инженерный журнал' : 'Engineering Journal'}
      </h1>
      <p className="text-slate-600 mb-12">
        {locale === 'ru'
          ? 'Реальные кейсы с кодом, метриками и решениями.'
          : 'Real cases with code, metrics, and solutions.'}
      </p>
      <div className="space-y-6">
        {cases.map(({ slug, frontmatter: fm }) => (
          <Link
            key={slug}
            href={`${locale === 'ru' ? '/ru' : ''}/journal/${slug}`}
            className="block p-6 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white hover:border-teal-200 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200/40"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-md border border-teal-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{fm.title}</h2>
            <p className="text-slate-600 text-sm mb-3">{fm.excerpt}</p>
            <span className="text-xs font-bold text-teal-600">
              {fm.metric} · {fm.date}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}

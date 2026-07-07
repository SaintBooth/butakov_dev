import { Link } from '@/i18n/navigation';
import { getAllCaseFrontmatters } from '@/utils/cases';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  const cases = await getAllCaseFrontmatters(locale);

  const isRu = locale === 'ru';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-teal-600 transition-colors">
          {isRu ? 'Главная' : 'Home'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">
          {isRu ? 'Инженерный журнал' : 'Engineering Journal'}
        </span>
      </nav>

      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
        {isRu ? 'Инженерный журнал' : 'Engineering Journal'}
      </h1>
      <p className="text-slate-600 text-lg mb-12 font-medium max-w-2xl">
        {isRu
          ? 'Реальные кейсы с кодом, метриками и решениями.'
          : 'Real cases with code, metrics, and solutions.'}
      </p>

      <div className="space-y-6">
        {cases.map(({ slug, frontmatter: fm }) => (
          <Link
            key={slug}
            href={`/journal/${slug}`}
            className="block p-6 sm:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white hover:border-teal-200/80 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200/40"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600">
              {fm.title}
            </h2>
            <p className="text-slate-600 text-sm mb-3 leading-relaxed">{fm.excerpt}</p>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-teal-600">{fm.metric}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{fm.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

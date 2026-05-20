import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCaseBySlug, getCaseSlugs } from '@/utils/cases';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getCaseSlugs(locale).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getCaseBySlug(locale, slug);
  if (!result) return {};
  const { frontmatter: fm } = result;
  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';

  return {
    title: fm.title,
    description: fm.excerpt,
    alternates: {
      canonical: `${base}${ruPrefix}/journal/${slug}`,
      languages: {
        en: `${base}/journal/${slug}`,
        ru: `${base}/ru/journal/${slug}`,
        'x-default': `${base}/journal/${slug}`,
      },
    },
  };
}

export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  const result = await getCaseBySlug(locale, slug);
  if (!result) notFound();

  const { content, frontmatter: fm } = result;

  return (
    <main className="max-w-4xl mx-auto px-4 py-24">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {fm.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
          {fm.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{fm.date}</span>
          <span className="font-bold text-teal-600">{fm.metric}</span>
        </div>
      </div>
      <article className="prose prose-slate prose-teal max-w-none">{content}</article>
      <div className="mt-16 pt-8 border-t border-slate-100 text-center">
        {/* Link to home page contact section — case pages have no #contact section locally */}
        <a
          href={locale === 'ru' ? '/ru/#contact' : '/#contact'}
          className="inline-flex px-8 py-4 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition-all"
        >
          {locale === 'ru' ? 'Обсудить похожую задачу' : 'Discuss a similar project'}
        </a>
      </div>
    </main>
  );
}

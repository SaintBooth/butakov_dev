import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCaseBySlug, getCaseSlugs } from '@/utils/cases';
import { getSchemaArticle } from '@/config/schema';
import { Link } from '@/i18n/navigation';

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
    title: `${fm.title} | butakov.dev`,
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
  const isRu = locale === 'ru';
  const tSchema = await getTranslations({ locale, namespace: 'schema' });
  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';

  const articleSchema = getSchemaArticle({
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    url: `${base}${ruPrefix}/journal/${slug}`,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-teal-600 transition-colors">
          {isRu ? 'Главная' : 'Home'}
        </Link>
        <span>/</span>
        <Link href="/journal" className="hover:text-teal-600 transition-colors">
          {isRu ? 'Журнал' : 'Journal'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{fm.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
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
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{fm.date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="font-bold text-teal-600">{fm.metric}</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {isRu ? 'Автор: ' : 'Author: '}
          <span className="font-semibold text-slate-700">{tSchema('person.name')}</span>
          {' — '}
          {tSchema('person.jobTitle')}
        </p>
      </div>

      {/* MDX Content */}
      <article className="prose prose-slate prose-teal max-w-none prose-headings:font-bold prose-pre:p-0 prose-pre:bg-transparent">
        {content}
      </article>

      {/* Footer CTA */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/journal"
          className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
        >
          ← {isRu ? 'Все кейсы' : 'All cases'}
        </Link>
        <Link
          href="/#contact"
          className="inline-flex px-8 py-4 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25"
        >
          {isRu ? 'Обсудить похожую задачу' : 'Discuss a similar project'}
        </Link>
      </div>
    </main>
  );
}

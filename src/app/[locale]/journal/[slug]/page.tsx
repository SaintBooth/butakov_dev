import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getCaseBySlug, getCaseSlugs, getRelatedCases } from '@/utils/cases';
import { getSchemaArticle, getSchemaBreadcrumb, DEFAULT_OG_IMAGE } from '@/config/schema';
import { Link } from '@/i18n/navigation';
import { ArticleToc } from '@/components/ui/ArticleToc/ArticleToc';

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
  const url = `${base}${ruPrefix}/journal/${slug}`;
  const image = fm.image ? `${base}${fm.image}` : DEFAULT_OG_IMAGE;
  const metaTitle = fm.seoTitle ?? fm.title;

  return {
    title: `${metaTitle} | butakov.dev`,
    description: fm.excerpt,
    alternates: {
      canonical: url,
      languages: {
        en: `${base}/journal/${slug}`,
        ru: `${base}/ru/journal/${slug}`,
        'x-default': `${base}/journal/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: fm.excerpt,
      url,
      publishedTime: fm.date,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: fm.excerpt,
      images: [image],
    },
  };
}

export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  const result = await getCaseBySlug(locale, slug);
  if (!result) notFound();

  const { content, frontmatter: fm, headings, readingTime } = result;
  const isRu = locale === 'ru';
  const tSchema = await getTranslations({ locale, namespace: 'schema' });
  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';

  const articleSchema = getSchemaArticle({
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    url: `${base}${ruPrefix}/journal/${slug}`,
    image: fm.image ? `${base}${fm.image}` : undefined,
    keywords: fm.tags,
    metric: fm.metric,
  });
  const relatedCases = await getRelatedCases(locale, slug, fm.tags);
  const breadcrumbSchema = getSchemaBreadcrumb([
    { name: isRu ? 'Главная' : 'Home', url: `${base}${ruPrefix}` },
    { name: isRu ? 'Журнал' : 'Journal', url: `${base}${ruPrefix}/journal` },
    { name: fm.title, url: `${base}${ruPrefix}/journal/${slug}` },
  ]);

  const authorName = tSchema('person.name');

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-teal-600 transition-colors">
          {isRu ? 'Главная' : 'Home'}
        </Link>
        <span className="shrink-0">/</span>
        <Link href="/journal" className="shrink-0 hover:text-teal-600 transition-colors">
          {isRu ? 'Журнал' : 'Journal'}
        </Link>
        <span className="shrink-0">/</span>
        <span className="min-w-0 flex-1 truncate font-semibold text-slate-900" title={fm.title}>
          {fm.title}
        </span>
      </nav>

      {/* Header */}
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
        <p className="text-lg text-slate-600 font-medium mb-5">{fm.excerpt}</p>

        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-teal-50 border border-teal-100">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            {isRu ? 'Результат' : 'Result'}
          </span>
          <span className="text-sm font-extrabold text-teal-700">{fm.metric}</span>
        </div>

        <div className="flex items-center gap-3 py-4 border-y border-slate-100">
          <Image
            src="/author-avatar.webp"
            alt={authorName}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 text-sm">
            <div className="font-semibold text-slate-800">{authorName}</div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>{fm.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>
                {readingTime} {isRu ? 'мин чтения' : 'min read'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ArticleToc
        title={isRu ? 'Содержание' : 'Contents'}
        headings={headings}
        className="mb-10 p-5 rounded-2xl bg-slate-50 border border-slate-100"
      />

      {/* MDX Content */}
      <article className="prose prose-slate prose-teal max-w-none prose-headings:font-bold prose-headings:scroll-mt-24 prose-pre:p-0 prose-pre:bg-transparent">
        {content}
      </article>

      {/* Related cases */}
      {relatedCases.length > 0 && (
        <div className="mt-16 pt-8 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">
            {isRu ? 'Похожие кейсы' : 'Related cases'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedCases.map((related) => (
              <Link
                key={related.slug}
                href={`/journal/${related.slug}`}
                className="block p-4 rounded-xl border border-slate-100 hover:border-teal-200 transition-colors"
              >
                <div className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">
                  {related.frontmatter.title}
                </div>
                <div className="text-xs font-bold text-teal-600">{related.frontmatter.metric}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

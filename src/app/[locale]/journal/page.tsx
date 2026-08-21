import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getAllCaseFrontmatters } from '@/utils/cases';
import { getSchemaBreadcrumb, DEFAULT_OG_IMAGE } from '@/config/schema';
import JournalList from '@/features/journal/JournalList';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';
  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';
  const url = `${base}${ruPrefix}/journal`;
  const title = isRu ? 'Журнал | butakov.dev' : 'Journal | butakov.dev';
  const description = isRu
    ? 'Записи о разработке: инженерные кейсы с кодом и метриками, личные мнения и размышления об IT.'
    : 'Notes on development: engineering case studies with code and metrics, plus personal opinions on IT.';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${base}/journal`,
        ru: `${base}/ru/journal`,
        'x-default': `${base}/journal`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  const cases = await getAllCaseFrontmatters(locale);

  const isRu = locale === 'ru';
  const base = 'https://butakov.dev';
  const ruPrefix = locale === 'en' ? '' : '/ru';
  const breadcrumbSchema = getSchemaBreadcrumb([
    { name: isRu ? 'Главная' : 'Home', url: `${base}${ruPrefix}` },
    { name: isRu ? 'Журнал' : 'Journal', url: `${base}${ruPrefix}/journal` },
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-teal-600 transition-colors">
          {isRu ? 'Главная' : 'Home'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{isRu ? 'Журнал' : 'Journal'}</span>
      </nav>

      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
        {isRu ? 'Журнал' : 'Journal'}
      </h1>
      <p className="text-slate-600 text-lg mb-12 font-medium max-w-2xl">
        {isRu
          ? 'Записи о разработке, кейсы и личные мнения.'
          : 'Notes on development, case studies and personal opinions.'}
      </p>

      <JournalList cases={cases} locale={locale} />
    </main>
  );
}

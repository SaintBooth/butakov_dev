import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Hero from '@/sections/Hero';
import Services from '@/sections/Services';
import B2bGuarantees from '@/sections/B2bGuarantees';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Process from '@/sections/Process';
import Contact from '@/features/contact/Contact';
import Cases from '@/features/cases/Cases';
import Thoughts from '@/features/thoughts/Thoughts';
import { getAllCaseFrontmatters, isOpinionPiece } from '@/utils/cases';
import { DEFAULT_OG_IMAGE } from '@/config/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const base = 'https://butakov.dev';
  const url = locale === 'ru' ? `${base}/ru` : base;
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: base,
        ru: `${base}/ru`,
        'x-default': base,
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isRu = locale === 'ru';
  const allCases = await getAllCaseFrontmatters(locale);
  const caseStudies = allCases.filter((c) => !isOpinionPiece(c.frontmatter));
  const opinions = allCases.filter((c) => isOpinionPiece(c.frontmatter));
  const tThoughts = await getTranslations({ locale, namespace: 'thoughtsSection' });

  return (
    <main>
      <Hero />
      <Services />
      <B2bGuarantees />
      <Experience />
      <Projects />
      <Cases locale={locale} cases={caseStudies} />
      <Thoughts
        cases={opinions}
        copy={{
          heading: tThoughts('heading'),
          subheading: tThoughts('subheading'),
          readMore: tThoughts('readMore'),
        }}
        dateLocale={isRu ? 'ru-RU' : 'en-US'}
        readMinutesLabel={isRu ? 'мин' : 'min'}
      />
      <Process />
      <Contact />
    </main>
  );
}

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

interface Props {
  params: Promise<{ locale: string }>;
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

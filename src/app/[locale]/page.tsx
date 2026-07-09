import Hero from '@/sections/Hero';
import Services from '@/sections/Services';
import B2bGuarantees from '@/sections/B2bGuarantees';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Process from '@/sections/Process';
import Contact from '@/features/contact/Contact';
import Cases from '@/features/cases/Cases';
import { LandingClient } from './LandingClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <main>
      <Hero />
      <Services />
      <B2bGuarantees />
      <Experience />
      <Projects />
      <Cases locale={locale} />
      <LandingClient />
      <Process />
      <Contact />
    </main>
  );
}

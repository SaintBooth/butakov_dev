import Header from '@/sections/Header';
import Hero from '@/sections/Hero';
import Services from '@/sections/Services';
import B2bGuarantees from '@/sections/B2bGuarantees';
import Experience from '@/sections/Experience';
import PromptSpace from '@/sections/PromptSpace';
import Process from '@/sections/Process';
import Footer from '@/sections/Footer';
import MobileNav from '@/sections/MobileNav';
import Contact from '@/features/contact/Contact';
import { LandingClient } from './LandingClient';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <B2bGuarantees />
        <Experience />
        <PromptSpace />
        <LandingClient />
        <Process />
        <Contact />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}

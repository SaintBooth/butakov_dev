import { useState, useEffect, lazy, Suspense } from 'react';
import { initYandexMetrika } from './utils/analytics';

import Header from './sections/Header';
import Hero from './sections/Hero';
import Services from './sections/Services';
import B2bGuarantees from './sections/B2bGuarantees';
import Experience from './sections/Experience';
import PromptSpace from './sections/PromptSpace';
import Process from './sections/Process';
import Footer from './sections/Footer';
import MobileNav from './sections/MobileNav';

import Cases from './features/cases/Cases';
import Blog from './features/blog/Blog';
import Contact from './features/contact/Contact';

import type { PortfolioCase, BlogPost } from './types';

const CaseModal = lazy(() => import('./features/cases/CaseModal'));
const ArticleModal = lazy(() => import('./features/blog/ArticleModal'));
const PrivacyModal = lazy(() => import('./sections/PrivacyModal'));

const YM_ID = 107722106;

export default function App() {
  const [selectedCase, setSelectedCase] = useState<PortfolioCase | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    initYandexMetrika(YM_ID);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      selectedCase || selectedArticle || isPrivacyOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCase, selectedArticle, isPrivacyOpen]);

  const scrollToContact = (serviceName = ''): void => {
    if (serviceName) setSelectedService(serviceName);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/30 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-emerald-100/30 blur-[100px]" />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; background: transparent; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (min-width: 1024px) {
          .desktop-no-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; background: transparent; }
          .desktop-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>

      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/107722106"
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>

      <Header onContactClick={() => scrollToContact()} />

      <main className="relative z-10">
        <Hero onContactClick={() => scrollToContact()} />
        <Services onContactClick={scrollToContact} />
        <B2bGuarantees />
        <Experience />
        <PromptSpace />
        <Cases onCaseSelect={setSelectedCase} onContactClick={() => scrollToContact()} />
        <Blog onArticleSelect={setSelectedArticle} />
        <Process />
        <Contact
          selectedService={selectedService}
          onServiceChange={setSelectedService}
          onPrivacyClick={() => setIsPrivacyOpen(true)}
        />
      </main>

      <Footer onPrivacyClick={() => setIsPrivacyOpen(true)} />
      <MobileNav onContactClick={() => scrollToContact()} />

      <Suspense fallback={null}>
        {selectedCase && (
          <CaseModal
            item={selectedCase}
            onClose={() => setSelectedCase(null)}
            onContactClick={() => scrollToContact()}
          />
        )}
        {selectedArticle && (
          <ArticleModal
            post={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onContactClick={() => scrollToContact()}
          />
        )}
        {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}
      </Suspense>
    </div>
  );
}

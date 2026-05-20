import { useState, useEffect } from 'react';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import B2bGuarantees from './components/B2bGuarantees.jsx';
import Experience from './components/Experience.jsx';
import PromptSpace from './components/PromptSpace.jsx';
import Cases from './components/Cases.jsx';
import Blog from './components/Blog.jsx';
import Process from './components/Process.jsx';
import Contact from './features/contact/Contact.jsx';
import Footer from './components/Footer.jsx';
import MobileNav from './components/MobileNav.jsx';
import CaseModal from './components/modals/CaseModal.jsx';
import ArticleModal from './components/modals/ArticleModal.jsx';
import PrivacyModal from './components/modals/PrivacyModal.jsx';

const YM_ID = 107722106;

export default function App() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    /* eslint-disable */
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
      k=e.createElement(t);a=e.getElementsByTagName(t)[0];
      k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
    })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    /* eslint-enable */
    window.ym(YM_ID, 'init', {
      ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer',
      referrer: document.referrer, url: location.href,
      accurateTrackBounce: true, trackLinks: true,
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = (selectedCase || selectedArticle || isPrivacyOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedCase, selectedArticle, isPrivacyOpen]);

  const scrollToContact = (serviceName = '') => {
    if (serviceName) setSelectedService(serviceName);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/30 relative overflow-hidden" style={{ fontFamily: "'Geist', sans-serif" }}>
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

      <noscript><div><img src="https://mc.yandex.ru/watch/107722106" style={{ position: 'absolute', left: '-9999px' }} alt="" /></div></noscript>

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

      {selectedCase && (
        <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} onContactClick={() => scrollToContact()} />
      )}
      {selectedArticle && (
        <ArticleModal post={selectedArticle} onClose={() => setSelectedArticle(null)} onContactClick={() => scrollToContact()} />
      )}
      {isPrivacyOpen && (
        <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />
      )}
    </div>
  );
}

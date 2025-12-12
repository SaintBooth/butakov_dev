import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { InstallPrompt } from '@/components/layout/InstallPrompt';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from 'next-themes';
import "./globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 15+
  const { locale } = await params;
  const currentLocale = locales.find((code) => code === locale);
  
  // Validate that the incoming `locale` parameter is valid
  if (!currentLocale) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale: currentLocale });

  const themeScript = `
    (function() {
      try {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', theme === 'dark');
      } catch (e) {}
    })();
  `;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Developer Name",
    url: "https://example.com",
    jobTitle: "Fullstack Developer & Digital Marketer",
  };

  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <link rel="icon" type="image/png" href="/favicon-96x96.png?v=2" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <meta name="apple-mobile-web-app-title" content="Butakov.dev" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
            <div className="relative flex min-h-screen flex-col text-foreground">
              <Header />
              <main className="flex-1 pt-20 pb-24 md:pb-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <Footer />
              <BottomNav />
              <InstallPrompt />
              <CookieConsent />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


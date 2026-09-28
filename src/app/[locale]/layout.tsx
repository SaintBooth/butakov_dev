import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { Suspense } from 'react';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { YandexMetrika } from '@/components/YandexMetrika';
import { getSchemaBusiness, getSchemaPerson } from '@/config/schema';
import { ContactModalProvider } from '@/features/contact/ContactModalProvider';
import Header from '@/sections/Header';
import Footer from '@/sections/Footer';
import MobileNav from '@/sections/MobileNav';
import '@/index.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const locales = ['en', 'ru'];

// Required for SSG — tells Next.js which locales to pre-render at build time
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL('https://butakov.dev'),
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  // Landing copy is rendered only by server components; keeping it out of the
  // client provider saves ~40 KB of RSC payload on every page.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { landings, landingsCommon, ...messages } = await getMessages();
  const tSchema = await getTranslations('schema');
  const tServices = await getTranslations('services');

  // FAQPage lives on the service landings next to a visible FAQ block; marking up
  // questions that aren't on the page violates Google's structured-data policy.
  const schemas = [getSchemaBusiness(tSchema, tServices), getSchemaPerson(tSchema)];

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ContactModalProvider>
            <Header />
            {children}
            <Footer />
            <Suspense fallback={null}>
              <MobileNav />
            </Suspense>
          </ContactModalProvider>
          <YandexMetrika />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

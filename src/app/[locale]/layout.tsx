import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { YandexMetrika } from '@/components/YandexMetrika';
import { getSchemaBusiness, getSchemaPerson, getSchemaFaq } from '@/config/schema';
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

  const messages = await getMessages();
  const tSchema = await getTranslations('schema');
  const tServices = await getTranslations('services');

  const schemas = [
    getSchemaBusiness(tSchema, tServices),
    getSchemaPerson(tSchema),
    getSchemaFaq(tSchema),
  ];

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
          <Header />
          {children}
          <Footer />
          <MobileNav />
          <YandexMetrika />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

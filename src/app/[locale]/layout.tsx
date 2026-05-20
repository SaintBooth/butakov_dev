import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { YandexMetrika } from '@/components/YandexMetrika';
import { SCHEMA_BUSINESS, SCHEMA_PERSON, SCHEMA_FAQ } from '@/config/schema';
import '@/index.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const locales = ['en', 'ru'];

export const metadata: Metadata = {
  title: 'Александр Бутаков | Технический партнер и Разработчик веб-приложений',
  description:
    'Разработка сложных веб-сервисов, интернет-магазинов и внедрение ИИ. Настройка Яндекс Директ и перфоманс-маркетинг. Ваш надежный IT-партнер.',
};

// Required for SSG — tells Next.js which locales to pre-render at build time
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  const schemas = [SCHEMA_BUSINESS, SCHEMA_PERSON, SCHEMA_FAQ];

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
          {children}
          <YandexMetrika />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

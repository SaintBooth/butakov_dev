import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  findLandingBySlug,
  isLandingLocale,
  LANDING_IDS,
  LANDING_SLUGS,
  landingUrl,
  SITE_URL,
  type LandingId,
  type LandingLocale,
} from '@/config/landings';
import { getCurrency, priceForHours } from '@/config/pricing';
import {
  DEFAULT_OG_IMAGE,
  getSchemaBreadcrumb,
  getSchemaFaq,
  getSchemaService,
} from '@/config/schema';
import { landings } from '@/data/landings';
import Contact from '@/features/contact/Contact';
import LandingFaq from '@/features/landing/LandingFaq';
import LandingHero from '@/features/landing/LandingHero';
import LandingPricing from '@/features/landing/LandingPricing';
import LandingRelated from '@/features/landing/LandingRelated';
import LandingScope from '@/features/landing/LandingScope';
import LandingSteps from '@/features/landing/LandingSteps';
import LandingWhy from '@/features/landing/LandingWhy';
import { getPriceVars } from '@/features/landing/priceVars';

interface Props {
  params: Promise<{ locale: string; service: string }>;
}

export function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLandingLocale(params.locale)) return [];
  const locale = params.locale;
  return LANDING_IDS.map((id) => ({ service: LANDING_SLUGS[id][locale] }));
}

/** Resolves the route or 404s: unknown slugs and the other locale's slug (e.g. /ru/web-development) both miss. */
async function resolve(params: Props['params']): Promise<{ id: LandingId; locale: LandingLocale }> {
  const { locale, service } = await params;
  if (!isLandingLocale(locale)) notFound();
  const id = findLandingBySlug(locale, service);
  if (!id) notFound();
  return { id, locale };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await resolve(params);
  const t = await getTranslations({ locale, namespace: `landings.${id}.meta` });
  const vars = getPriceVars(landings[id], locale);
  const url = landingUrl(id, locale);
  const title = t('title');
  const description = t('description', vars);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: landingUrl(id, 'en'),
        ru: landingUrl(id, 'ru'),
        'x-default': landingUrl(id, 'en'),
      },
    },
    openGraph: { type: 'website', title, description, url, images: [{ url: DEFAULT_OG_IMAGE }] },
    twitter: { card: 'summary_large_image', title, description, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function ServiceLandingPage({ params }: Props) {
  const { id, locale } = await resolve(params);
  const meta = landings[id];
  const t = await getTranslations({ locale, namespace: `landings.${id}` });
  const tc = await getTranslations({ locale, namespace: 'landingsCommon' });
  const vars = getPriceVars(meta, locale);
  const url = landingUrl(id, locale);

  const faqItems = meta.faqIds.map((faqId) => ({
    q: t(`faq.items.${faqId}.q`),
    a: t(`faq.items.${faqId}.a`, vars),
  }));

  const schemas = [
    getSchemaService({
      name: t('h1'),
      description: t('meta.description', vars),
      url,
      areaServed: tc('areaServed'),
      currency: getCurrency(locale).code,
      offers: meta.tiers.map((tier) => ({
        name: t(`pricing.tiers.${tier.id}.name`),
        price: priceForHours(locale, tier.hours),
        monthly: tier.monthly,
      })),
    }),
    getSchemaBreadcrumb([
      { name: tc('breadcrumbHome'), url: locale === 'ru' ? `${SITE_URL}/ru` : SITE_URL },
      { name: t('breadcrumb'), url },
    ]),
    getSchemaFaq(faqItems),
  ];

  return (
    <main>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingHero id={id} locale={locale} />
      <LandingScope id={id} locale={locale} />
      <LandingPricing id={id} locale={locale} vars={vars} />
      <LandingSteps id={id} locale={locale} />
      <LandingWhy id={id} locale={locale} vars={vars} />
      <LandingRelated id={id} locale={locale} />
      <LandingFaq heading={t('faq.heading')} items={faqItems} />
      <Contact defaultServiceId={meta.serviceId} />
    </main>
  );
}

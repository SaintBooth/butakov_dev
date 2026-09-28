import type { useTranslations } from 'next-intl';
import { services } from '../data/services';

type Translator = ReturnType<typeof useTranslations>;

export const DEFAULT_OG_IMAGE = 'https://butakov.dev/butakov-01.png';

const OFFER_IDS = [
  'custom-web',
  'ecommerce',
  'marketing',
  'corporate',
  'legacy',
  'ai-consulting',
] as const;

export function getSchemaBusiness(tSchema: Translator, tServices: Translator) {
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': 'https://butakov.dev/#business',
    name: 'ИП Бутаков Александр Сергеевич',
    url: 'https://butakov.dev',
    telephone: '+79126315779',
    email: 'hello@butakov.dev',
    taxID: '667011271708',
    legalName: 'ИП Бутаков Александр Сергеевич',
    priceRange: '₽₽₽',
    areaServed: { '@type': 'Country', name: tSchema('business.areaServedName') },
    sameAs: ['https://t.me/SashaBooth', 'https://github.com/SaintBooth', 'https://promptspace.ru'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: tSchema('business.offerCatalogName'),
      itemListElement: services
        .filter((s) => (OFFER_IDS as readonly string[]).includes(s.id))
        .map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: tServices(`items.${s.id}.title`),
            description: tServices(`items.${s.id}.description`),
          },
        })),
    },
  };
}

export function getSchemaPerson(tSchema: Translator) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://butakov.dev/#person',
    name: tSchema('person.name'),
    jobTitle: tSchema('person.jobTitle'),
    url: 'https://butakov.dev',
    telephone: '+79126315779',
    sameAs: ['https://t.me/SashaBooth', 'https://github.com/SaintBooth', 'https://promptspace.ru'],
    worksFor: { '@id': 'https://butakov.dev/#business' },
  };
}

export function getSchemaArticle(opts: {
  headline: string;
  description: string;
  datePublished: string;
  url: string;
  image?: string;
  keywords?: string[];
  metric?: string;
  metricLabel?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    url: opts.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    image: opts.image ?? DEFAULT_OG_IMAGE,
    ...(opts.keywords && opts.keywords.length > 0 ? { keywords: opts.keywords.join(', ') } : {}),
    ...(opts.metric
      ? {
          additionalProperty: {
            '@type': 'PropertyValue',
            name: opts.metricLabel ?? 'Result',
            value: opts.metric,
          },
        }
      : {}),
    author: { '@id': 'https://butakov.dev/#person' },
    publisher: { '@id': 'https://butakov.dev/#business' },
  };
}

export function getSchemaItemList(opts: {
  name: string;
  items: Array<{ name: string; url: string; description?: string; datePublished?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    itemListElement: opts.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
        ...(item.datePublished ? { datePublished: item.datePublished } : {}),
      },
    })),
  };
}

export function getSchemaBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Only for questions that are also rendered visibly on the same page. */
export function getSchemaFaq(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function getSchemaService(opts: {
  name: string;
  description: string;
  url: string;
  areaServed: string;
  currency: string;
  offers: Array<{ name: string; price: number; monthly?: boolean }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: { '@id': 'https://butakov.dev/#business' },
    areaServed: opts.areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: opts.name,
      itemListElement: opts.offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.name,
        priceSpecification: {
          '@type': offer.monthly ? 'UnitPriceSpecification' : 'PriceSpecification',
          priceCurrency: opts.currency,
          // "from X" prices: minPrice, not an exact price, so the markup doesn't overclaim.
          minPrice: offer.price,
          ...(offer.monthly
            ? { referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } }
            : {}),
        },
      })),
    },
  };
}

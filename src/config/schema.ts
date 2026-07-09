import type { useTranslations } from 'next-intl';
import { services } from '../data/services';

type Translator = ReturnType<typeof useTranslations>;

export const DEFAULT_OG_IMAGE = 'https://butakov.dev/butakov-01.png';

const OFFER_IDS = ['custom-web', 'ecommerce', 'marketing', 'corporate', 'ai-consulting'] as const;
const FAQ_IDS = ['contract', 'guarantee', 'soloAi', 'process', 'remote'] as const;

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
            name: 'Result',
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

export function getSchemaFaq(tSchema: Translator) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_IDS.map((id) => ({
      '@type': 'Question',
      name: tSchema(`faq.${id}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: tSchema(`faq.${id}.a`),
      },
    })),
  };
}

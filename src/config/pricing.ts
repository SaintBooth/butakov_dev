/**
 * Every price on the service landings is derived from these rates x estimated
 * hours (see src/data/landings.ts), so raising the rate reprices the whole site,
 * JSON-LD offers included. $30 = 2500 RUB is the owner's fixed personal rate,
 * deliberately not a live FX conversion.
 */
export const CURRENCIES = {
  ru: { code: 'RUB', rate: 2500, overageRate: 3000, numberLocale: 'ru-RU' },
  en: { code: 'USD', rate: 30, overageRate: 36, numberLocale: 'en-US' },
} as const;

export function getCurrency(locale: string) {
  return CURRENCIES[locale === 'ru' ? 'ru' : 'en'];
}

export function priceForHours(locale: string, hours: number): number {
  return hours * getCurrency(locale).rate;
}

export function formatPrice(locale: string, amount: number): string {
  const { code, numberLocale } = getCurrency(locale);
  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

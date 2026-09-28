import { formatPrice, getCurrency, priceForHours } from '@/config/pricing';
import type { LandingMeta } from '@/types';

export type PriceVars = Record<string, string | number>;

/**
 * ICU values for landing copy: `{<tierId>}` formatted tier price, `{<tierId>Hours}`,
 * `{rate}`, `{overage}` and `{from}` (cheapest tier). Copy and JSON-LD read the same
 * map, so the page and its FAQPage markup can never disagree on a price.
 */
export function getPriceVars(meta: LandingMeta, locale: string): PriceVars {
  const { rate, overageRate } = getCurrency(locale);
  const vars: PriceVars = {
    rate: formatPrice(locale, rate),
    overage: formatPrice(locale, overageRate),
    from: formatPrice(locale, Math.min(...meta.tiers.map((t) => priceForHours(locale, t.hours)))),
  };
  for (const tier of meta.tiers) {
    vars[tier.id] = formatPrice(locale, priceForHours(locale, tier.hours));
    vars[`${tier.id}Hours`] = tier.hours;
  }
  return vars;
}

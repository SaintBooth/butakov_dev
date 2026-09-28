import type { LandingId } from '@/config/landings';
import { formatPrice, priceForHours } from '@/config/pricing';
import { landings } from '@/data/landings';

/** Cheapest tier of a landing, for short "from X" hints in navigation. */
export function getPriceHint(id: LandingId, locale: string): { price: string; monthly: boolean } {
  const cheapest = landings[id].tiers.reduce((a, b) => (b.hours < a.hours ? b : a));
  return {
    price: formatPrice(locale, priceForHours(locale, cheapest.hours)),
    monthly: Boolean(cheapest.monthly),
  };
}

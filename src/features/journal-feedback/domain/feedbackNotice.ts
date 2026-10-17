import { SITE_URL } from '@/config/landings';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

export function articleUrl(locale: Locale, slug: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${SITE_URL}${prefix}/journal/${slug}`;
}

// Unlike workshop pings (counts and ids only), this one carries reader text by design:
// the comment is the whole point. The form asks readers not to leave contact details.
export function formatFeedbackNotice(input: {
  locale: Locale;
  slug: string;
  comment: string;
}): string {
  return [
    `📝 Отзыв «Нет» — ${input.slug}`,
    articleUrl(input.locale, input.slug),
    `«${input.comment}»`,
    '⚠️ пользовательский текст',
  ].join('\n');
}

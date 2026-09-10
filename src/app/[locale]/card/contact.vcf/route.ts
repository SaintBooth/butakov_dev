import { CONTACT } from '@/config/contact';
import { buildVCard, VCARD_FILENAME } from '@/features/card/vcard';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ locale: 'ru' }, { locale: 'en' }];
}

export function GET() {
  const body = buildVCard(CONTACT);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `inline; filename="${VCARD_FILENAME}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

import type { Metadata } from 'next';
import { CONTACT } from '@/config/contact';
import Card from '@/features/card/Card';

export const metadata: Metadata = {
  title: CONTACT.name,
  robots: { index: false, follow: false },
};

export default function CardPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Card />
    </main>
  );
}

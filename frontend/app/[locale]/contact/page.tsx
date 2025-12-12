import { useTranslations } from 'next-intl';
import { ContactForm } from "@/components/forms/ContactForm"

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <ContactForm />
    </div>
  )
}


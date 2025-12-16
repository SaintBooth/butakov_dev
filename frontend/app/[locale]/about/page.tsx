import { useTranslations } from 'next-intl';
import { GitHubActivity } from "@/components/about/GitHubActivity"

// In production, these would come from environment variables
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "your-username"
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN // Optional, for higher rate limits

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* GitHub Activity Section */}
        <GitHubActivity username={GITHUB_USERNAME} token={GITHUB_TOKEN} />

        {/* Additional About Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert reading-surface rounded-2xl p-8">
          <h2>{t('background')}</h2>
          <p>{t('backgroundText')}</p>

          <h2>{t('skills')}</h2>
          <ul>
            <li>{t('skillsFrontend')}</li>
            <li>{t('skillsBackend')}</li>
            <li>{t('skillsTools')}</li>
            <li>{t('skillsMarketing')}</li>
          </ul>

          <h2>{t('experience')}</h2>
          <p>{t('experienceText')}</p>
        </div>
      </div>
    </div>
  )
}


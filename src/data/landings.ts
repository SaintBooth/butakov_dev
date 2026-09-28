import { BrainCircuit, Code, MonitorSmartphone, Wrench } from 'lucide-react';
import type { LandingId } from '../config/landings';
import type { LandingMeta } from '../types';

/**
 * Structure only: ids, hours and case slugs. All copy lives in
 * messages/{ru,en}.json under `landings.<id>`, keyed by the ids below.
 * Hours are the owner's estimates; price = hours x rate from config/pricing.
 */
export const landings: Record<LandingId, LandingMeta> = {
  'web-dev': {
    // Not LayoutGrid: that glyph is the mobile "Services" tab.
    Icon: MonitorSmartphone,
    serviceId: 'corporate',
    tiers: [
      { id: 'landing', hours: 30 },
      { id: 'wordpress', hours: 60 },
      { id: 'bitrix', hours: 100 },
      { id: 'shop', hours: 160 },
    ],
    scopeIds: ['corporate', 'shop', 'integrations', 'seo'],
    stepIds: ['brief', 'estimate', 'build', 'launch'],
    faqIds: ['price', 'timeline', 'cms', 'content', 'guarantee'],
    caseSlugs: ['bitrix-highload-ecommerce', 'bitrix-multiregion-subdomains', 'spa-deployment-fix'],
  },
  'web-apps': {
    Icon: Code,
    serviceId: 'custom-web',
    tiers: [
      { id: 'integration', hours: 40 },
      { id: 'mvp', hours: 120 },
      { id: 'saas', hours: 240 },
    ],
    scopeIds: ['cabinet', 'mvp', 'integrations', 'saas'],
    stepIds: ['brief', 'estimate', 'build', 'launch'],
    faqIds: ['price', 'stack', 'mvp', 'code', 'solo'],
    caseSlugs: ['spa-deployment-fix'],
  },
  support: {
    Icon: Wrench,
    serviceId: 'legacy',
    tiers: [
      { id: 'start', hours: 5, monthly: true },
      { id: 'business', hours: 10, monthly: true },
    ],
    scopeIds: ['fixes', 'updates', 'speed', 'security'],
    stepIds: ['audit', 'access', 'plan', 'routine'],
    faqIds: ['price', 'oneoff', 'reaction', 'takeover', 'cms'],
    caseSlugs: [
      'bitrix-php8-legacy',
      'wordpress-keeps-getting-hacked',
      'wordpress-php83-migration',
      'bitrix-cache-warmup',
      'redis-optimization',
    ],
  },
  ai: {
    Icon: BrainCircuit,
    serviceId: 'ai-consulting',
    tiers: [
      { id: 'pilot', hours: 32 },
      { id: 'agent', hours: 80 },
    ],
    scopeIds: ['assistant', 'agent', 'rag', 'integrations'],
    stepIds: ['process', 'pilot', 'measure', 'scale'],
    faqIds: ['price', 'data', 'models', 'hallucinations', 'monthly'],
    caseSlugs: ['wordpress-claude-code-1c', 'ai-jungian-mirror-agent'],
  },
};

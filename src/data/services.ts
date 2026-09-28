import { Code, TrendingUp, BarChart3, LayoutGrid, Wrench, BrainCircuit } from 'lucide-react';
import type { ServiceMeta } from '../types';

export const services: ServiceMeta[] = [
  { id: 'custom-web', Icon: Code, landingId: 'web-apps' },
  { id: 'ecommerce', Icon: TrendingUp, landingId: 'web-dev' },
  { id: 'marketing', Icon: BarChart3 },
  { id: 'corporate', Icon: LayoutGrid, landingId: 'web-dev' },
  { id: 'legacy', Icon: Wrench, landingId: 'support' },
  { id: 'ai-consulting', Icon: BrainCircuit, landingId: 'ai' },
];

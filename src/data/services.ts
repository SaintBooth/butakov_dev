import { Code, TrendingUp, BarChart3, LayoutGrid, Wrench, BrainCircuit } from 'lucide-react';
import type { ServiceMeta } from '../types';

export const services: ServiceMeta[] = [
  { id: 'custom-web', Icon: Code },
  { id: 'ecommerce', Icon: TrendingUp },
  { id: 'marketing', Icon: BarChart3 },
  { id: 'corporate', Icon: LayoutGrid },
  { id: 'legacy', Icon: Wrench },
  { id: 'ai-consulting', Icon: BrainCircuit },
];

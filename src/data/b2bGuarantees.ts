import { FileSignature, ShieldCheck, Zap, Building2 } from 'lucide-react';
import type { B2bGuaranteeMeta } from '../types';

export const b2bGuarantees: B2bGuaranteeMeta[] = [
  { id: 'contract', Icon: FileSignature },
  { id: 'guarantee', Icon: ShieldCheck },
  { id: 'solo-ai', Icon: Zap },
  { id: 'goals', Icon: Building2 },
];

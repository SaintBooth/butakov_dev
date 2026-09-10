import { z } from 'zod';

export type Direction = 'audit' | 'ai';

export function createCardSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('errors.name')),
    contact: z.string().min(3, t('errors.contact')),
    problem: z.string().max(500).optional(),
    website: z.string().max(200).optional(),
    direction: z.enum(['audit', 'ai']),
  });
}

export const web3formsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type CardFormData = z.infer<ReturnType<typeof createCardSchema>>;
export type Web3FormsResponse = z.infer<typeof web3formsResponseSchema>;

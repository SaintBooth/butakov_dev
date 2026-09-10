import { z } from 'zod';

export type Direction = 'audit' | 'ai';

export function createCardSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('errors.name')).max(80, t('errors.name')),
    contact: z
      .string()
      .min(3, t('errors.contact'))
      .max(120, t('errors.contact'))
      // must look like a phone, a Telegram handle, or a t.me link — not free text
      .regex(/[\d@+]|t\.me/i, t('errors.contact')),
    problem: z.string().max(500).optional(),
    website: z
      .string()
      .max(200)
      // if given, must contain a dot-TLD (accepts "shop.ru", "https://x.com")
      .regex(/\.[a-z]{2,}/i, t('errors.website'))
      .optional(),
    direction: z.enum(['audit', 'ai']),
  });
}

export const web3formsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type CardFormData = z.infer<ReturnType<typeof createCardSchema>>;
export type Web3FormsResponse = z.infer<typeof web3formsResponseSchema>;

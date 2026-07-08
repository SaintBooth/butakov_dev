import { z } from 'zod';

export function createContactSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('errors.name')),
    contact: z.string().min(3, t('errors.contact')),
    service: z.string().optional(),
    message: z.string().optional(),
  });
}

export const web3formsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;
export type Web3FormsResponse = z.infer<typeof web3formsResponseSchema>;

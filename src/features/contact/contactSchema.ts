import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Введите имя (минимум 2 символа)'),
  contact: z.string().min(3, 'Введите Telegram или телефон'),
  service: z.string().optional(),
  message: z.string().optional(),
});

export const web3formsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type Web3FormsResponse = z.infer<typeof web3formsResponseSchema>;

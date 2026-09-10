export interface Contact {
  name: string;
  role: string;
  phoneE164: string;
  phoneDisplay: string;
  email: string;
  url: string;
  telegramHandle: string;
  telegramUrl: string;
}

export const CONTACT: Contact = {
  name: 'Александр Бутаков',
  role: 'Технический партнёр для бизнеса',
  phoneE164: '+79126315779',
  phoneDisplay: '+7 912 63 15 779',
  email: 'hello@butakov.dev',
  url: 'https://butakov.dev',
  telegramHandle: 'SashaBooth',
  telegramUrl: 'https://t.me/SashaBooth',
};

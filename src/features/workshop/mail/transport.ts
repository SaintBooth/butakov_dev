import nodemailer from 'nodemailer';
import { MAILER } from '@/config/workshop';
import type { WorkshopEnv } from '@/config/workshopEnv';
import type { OutgoingMail } from './compose';

const SMTPS_PORT = 465;

export function createSmtpSender(env: WorkshopEnv): (mail: OutgoingMail) => Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === SMTPS_PORT,
    connectionTimeout: MAILER.smtpTimeoutMs,
    greetingTimeout: MAILER.smtpTimeoutMs,
    socketTimeout: MAILER.smtpTimeoutMs,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return async (mail) => {
    await transporter.sendMail({ from: env.MAIL_FROM, ...mail });
  };
}

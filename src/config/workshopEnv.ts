import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    WORKSHOP_FORM_SECRET: z.string().min(32),
    WORKSHOP_ADMIN_TOKEN: z.string().min(32),
    // Header the Netangels gateway puts the client IP in. Unset = rate limiting off.
    WORKSHOP_IP_HEADER: z.string().min(1).optional(),
    WORKSHOP_MAILER_ENABLED: z.enum(['true', 'false']).default('false'),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    MAIL_FROM: z.string().min(1).optional(),
    TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
    TELEGRAM_CHAT_ID: z.string().min(1).optional(),
  })
  .refine(
    (e) =>
      e.WORKSHOP_MAILER_ENABLED === 'false' ||
      Boolean(e.SMTP_HOST && e.SMTP_PORT && e.SMTP_USER && e.SMTP_PASS && e.MAIL_FROM),
    {
      message: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM are required',
      path: ['WORKSHOP_MAILER_ENABLED'],
    }
  );

export type WorkshopEnv = z.infer<typeof envSchema>;

export function parseWorkshopEnv(
  source: Record<string, string | undefined>
): { ok: true; env: WorkshopEnv } | { ok: false; error: string } {
  const r = envSchema.safeParse(source);
  if (r.success) return { ok: true, env: r.data };
  // Only variable names and rule messages; zod issues never carry the secret values.
  const error = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  return { ok: false, error };
}

let cached: WorkshopEnv | null | undefined;

export function getWorkshopEnv(): WorkshopEnv | null {
  if (cached !== undefined) return cached;
  const r = parseWorkshopEnv(process.env);
  if (!r.ok) console.error(`[workshop] disabled, invalid env: ${r.error}`);
  cached = r.ok ? r.env : null;
  return cached;
}

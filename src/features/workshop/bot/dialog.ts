import { z } from 'zod';

export const CREATE_STEPS = [
  'title',
  'start',
  'duration',
  'meeting',
  'capacity',
  'confirm',
] as const;
export type CreateStep = (typeof CREATE_STEPS)[number];

const isoDate = z.iso.datetime();

const createDialog = z.object({
  kind: z.literal('create'),
  step: z.enum(CREATE_STEPS),
  draft: z.object({
    title: z.string().optional(),
    startsAt: isoDate.optional(),
    durationMin: z.number().int().positive().optional(),
    meetingUrl: z.string().optional(),
    capacity: z.number().int().positive().optional(),
  }),
});
const editDialog = z.object({
  kind: z.literal('edit'),
  sessionId: z.number().int().positive(),
  field: z.enum(['title', 'meeting', 'materials', 'capacity']),
});
const timeDialog = z.object({
  kind: z.literal('time'),
  sessionId: z.number().int().positive(),
  step: z.enum(['start', 'duration', 'confirm']),
  startsAt: isoDate.optional(),
  durationMin: z.number().int().positive().optional(),
});

export const dialogSchema = z.discriminatedUnion('kind', [createDialog, editDialog, timeDialog]);
export type Dialog = z.infer<typeof dialogSchema>;

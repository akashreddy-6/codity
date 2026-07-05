import { z } from 'zod';

export const submitJobSchema = z.object({
  payload: z.record(z.string(), z.any()),
  priority: z.number().int().default(0),
  delayMs: z.number().int().min(0).optional(),
});

export type SubmitJobInput = z.infer<typeof submitJobSchema>;

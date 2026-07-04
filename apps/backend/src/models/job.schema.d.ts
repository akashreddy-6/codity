import { z } from 'zod';
export declare const submitJobSchema: z.ZodObject<{
    payload: z.ZodRecord<z.ZodAny, z.core.SomeType>;
    priority: z.ZodDefault<z.ZodNumber>;
    delayMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type SubmitJobInput = z.infer<typeof submitJobSchema>;
//# sourceMappingURL=job.schema.d.ts.map
import { z } from 'zod';
export declare const createQueueSchema: z.ZodObject<{
    name: z.ZodString;
    priority: z.ZodDefault<z.ZodNumber>;
    concurrencyLimit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type CreateQueueInput = z.infer<typeof createQueueSchema>;
//# sourceMappingURL=queue.schema.d.ts.map
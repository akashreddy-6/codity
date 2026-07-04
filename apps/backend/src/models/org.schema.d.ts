import { z } from 'zod';
export declare const createOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
//# sourceMappingURL=org.schema.d.ts.map
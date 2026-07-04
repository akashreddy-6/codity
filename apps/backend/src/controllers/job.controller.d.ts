import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const submitJob: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listJobs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getJobDetails: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=job.controller.d.ts.map
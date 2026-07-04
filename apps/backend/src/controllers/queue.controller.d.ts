import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listQueues: (req: AuthRequest, res: Response) => Promise<void>;
export declare const pauseQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const resumeQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteQueue: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=queue.controller.d.ts.map
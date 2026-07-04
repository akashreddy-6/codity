import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listProjects: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProject: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=project.controller.d.ts.map
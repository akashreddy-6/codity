import { Job } from '@prisma/client';
export declare class JobRetrier {
    static handleFailure(job: Job, errorMsg: string): Promise<void>;
}
//# sourceMappingURL=retrier.d.ts.map
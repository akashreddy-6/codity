import { Job } from '@prisma/client';
export declare class JobClaimer {
    static claimNextJob(queueId: string, workerId: string): Promise<Job | null>;
}
//# sourceMappingURL=claimer.d.ts.map
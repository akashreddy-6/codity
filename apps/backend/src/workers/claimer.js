"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobClaimer = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
class JobClaimer {
    static async claimNextJob(queueId, workerId) {
        try {
            // Use PostgreSQL row-level locking to atomically claim a job
            // SKIP LOCKED ensures multiple workers don't block each other, they just skip rows already being evaluated
            const claimedJobs = await db_1.default.$queryRaw `
        UPDATE "Job"
        SET status = ${client_1.JobStatus.CLAIMED}::"JobStatus",
            "startedAt" = NOW(),
            "updatedAt" = NOW()
        WHERE id = (
          SELECT id FROM "Job"
          WHERE status IN (${client_1.JobStatus.QUEUED}::"JobStatus", ${client_1.JobStatus.SCHEDULED}::"JobStatus")
            AND "runAt" <= NOW()
            AND "queueId" = ${queueId}
          ORDER BY priority DESC, "runAt" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        RETURNING *;
      `;
            if (claimedJobs && claimedJobs.length > 0) {
                const job = claimedJobs[0];
                // Log the execution attempt
                await db_1.default.jobExecution.create({
                    data: {
                        jobId: job.id,
                        workerId: workerId,
                        status: client_1.JobStatus.CLAIMED,
                    }
                });
                return job;
            }
            return null;
        }
        catch (error) {
            console.error(`Error claiming job for queue ${queueId}:`, error);
            return null;
        }
    }
}
exports.JobClaimer = JobClaimer;
//# sourceMappingURL=claimer.js.map
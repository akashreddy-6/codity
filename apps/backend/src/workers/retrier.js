"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRetrier = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
const socket_1 = require("../utils/socket");
class JobRetrier {
    static async handleFailure(job, errorMsg) {
        const nextRetryCount = job.retryCount + 1;
        let nextStatus = client_1.JobStatus.FAILED;
        let runAt = new Date();
        if (nextRetryCount <= job.maxRetries) {
            nextStatus = client_1.JobStatus.RETRY;
            // Simple fixed delay for now (could be dynamic based on Job.retryPolicyId)
            // Base delay of 5000ms
            const delayMs = 5000 * Math.pow(2, job.retryCount); // Exponential backoff fallback
            runAt = new Date(Date.now() + delayMs);
        }
        else {
            nextStatus = client_1.JobStatus.DEAD_LETTER;
        }
        const updatedJob = await db_1.default.job.update({
            where: { id: job.id },
            data: {
                status: nextStatus,
                retryCount: nextRetryCount,
                runAt: runAt,
                updatedAt: new Date()
            }
        });
        (0, socket_1.getSocket)().to(`queue_${job.queueId}`).emit('job:updated', updatedJob);
        // Update execution history
        const latestExecution = await db_1.default.jobExecution.findFirst({
            where: { jobId: job.id },
            orderBy: { startedAt: 'desc' }
        });
        if (latestExecution) {
            await db_1.default.jobExecution.update({
                where: { id: latestExecution.id },
                data: {
                    status: client_1.JobStatus.FAILED,
                    error: errorMsg,
                    finishedAt: new Date()
                }
            });
        }
    }
}
exports.JobRetrier = JobRetrier;
//# sourceMappingURL=retrier.js.map
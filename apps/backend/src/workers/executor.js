"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobExecutor = void 0;
const db_1 = __importDefault(require("../utils/db"));
const client_1 = require("@prisma/client");
const retrier_1 = require("./retrier");
const socket_1 = require("../utils/socket");
class JobExecutor {
    static async execute(job) {
        try {
            // Mark as running
            const updatedJob = await db_1.default.job.update({
                where: { id: job.id },
                data: { status: client_1.JobStatus.RUNNING, updatedAt: new Date() }
            });
            // Emit socket event
            (0, socket_1.getSocket)().to(`queue_${job.queueId}`).emit('job:updated', updatedJob);
            // Update execution history
            const latestExecution = await db_1.default.jobExecution.findFirst({
                where: { jobId: job.id },
                orderBy: { startedAt: 'desc' }
            });
            if (latestExecution) {
                await db_1.default.jobExecution.update({
                    where: { id: latestExecution.id },
                    data: { status: client_1.JobStatus.RUNNING }
                });
            }
            // ----------------------------------------------------
            // MOCK JOB EXECUTION
            // ----------------------------------------------------
            console.log(`[Worker] Executing Job ${job.id}...`);
            // Simulate arbitrary work based on payload or just wait
            const payload = job.payload;
            const workTime = payload?.workTime || 2000;
            await new Promise((resolve) => setTimeout(resolve, workTime));
            // Simulate random failure (10% chance) for testing
            if (Math.random() < 0.1) {
                throw new Error("Random simulated execution failure");
            }
            // ----------------------------------------------------
            const finishedAt = new Date();
            const duration = finishedAt.getTime() - (job.startedAt?.getTime() || finishedAt.getTime());
            // Mark as completed
            const finalJob = await db_1.default.job.update({
                where: { id: job.id },
                data: {
                    status: client_1.JobStatus.COMPLETED,
                    finishedAt,
                    duration,
                    updatedAt: new Date()
                }
            });
            // Emit socket event
            (0, socket_1.getSocket)().to(`queue_${job.queueId}`).emit('job:updated', finalJob);
            if (latestExecution) {
                await db_1.default.jobExecution.update({
                    where: { id: latestExecution.id },
                    data: { status: client_1.JobStatus.COMPLETED, finishedAt }
                });
            }
            console.log(`[Worker] Completed Job ${job.id} in ${duration}ms`);
        }
        catch (error) {
            console.error(`[Worker] Job ${job.id} failed:`, error.message);
            await retrier_1.JobRetrier.handleFailure(job, error.message || 'Unknown error');
        }
    }
}
exports.JobExecutor = JobExecutor;
//# sourceMappingURL=executor.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerEngine = void 0;
const db_1 = __importDefault(require("../utils/db"));
const claimer_1 = require("./claimer");
const executor_1 = require("./executor");
class WorkerEngine {
    isRunning = false;
    pollIntervalMs = 1000;
    workerId = 'system-worker-1'; // In a real app, this would be a UUID generated per instance
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Register worker in DB
        let worker = await db_1.default.worker.findFirst({ where: { name: this.workerId } });
        if (!worker) {
            worker = await db_1.default.worker.create({
                data: { name: this.workerId, status: 'ACTIVE' }
            });
        }
        console.log(`[WorkerEngine] Started polling...`);
        this.poll();
    }
    stop() {
        this.isRunning = false;
        console.log(`[WorkerEngine] Stopped polling.`);
    }
    async poll() {
        if (!this.isRunning)
            return;
        try {
            // 1. Get all active, unpaused queues
            const activeQueues = await db_1.default.queue.findMany({
                where: { isPaused: false },
                select: { id: true, concurrencyLimit: true }
            });
            // 2. For each queue, check how many jobs are currently running
            for (const queue of activeQueues) {
                const runningJobsCount = await db_1.default.job.count({
                    where: { queueId: queue.id, status: 'RUNNING' }
                });
                // 3. If we have capacity, try to claim a job
                if (runningJobsCount < queue.concurrencyLimit) {
                    const claimedJob = await claimer_1.JobClaimer.claimNextJob(queue.id, workerId);
                    if (claimedJob) {
                        // Do NOT await execution here, we want it to run concurrently
                        executor_1.JobExecutor.execute(claimedJob);
                    }
                }
            }
            // Heartbeat
            await db_1.default.workerHeartbeat.create({
                data: { workerId: workerId }
            });
        }
        catch (error) {
            console.error('[WorkerEngine] Polling error:', error);
        }
        // Schedule next poll
        setTimeout(() => this.poll(), this.pollIntervalMs);
    }
}
exports.WorkerEngine = WorkerEngine;
// Ensure workerId is globally accessible for this instance
const workerId = 'worker-' + Math.random().toString(36).substring(7);
//# sourceMappingURL=engine.js.map
import prisma from '../utils/db';
import { JobClaimer } from './claimer';
import { JobExecutor } from './executor';

export class WorkerEngine {
  private isRunning = false;
  private pollIntervalMs = 1000;
  private workerId = 'system-worker-' + Math.random().toString(36).substring(7);
  private dbWorkerId: string | null = null;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      // Register worker in DB
      let worker = await prisma.worker.findFirst({ where: { name: this.workerId } });
      if (!worker) {
        worker = await prisma.worker.create({
          data: { name: this.workerId, status: 'ACTIVE' }
        });
      }
      
      // Save the DB's UUID so heartbeats don't fail foreign key checks
      this.dbWorkerId = worker.id;

      console.log(`[WorkerEngine] Started polling...`);
      this.poll();
    } catch (error) {
      console.error('[WorkerEngine] Startup failed, retrying in 5s...', error);
      this.isRunning = false;
      setTimeout(() => this.start(), 5000);
    }
  }

  stop() {
    this.isRunning = false;
    console.log(`[WorkerEngine] Stopped polling.`);
  }

  private async poll() {
    if (!this.isRunning) return;

    try {
      // 1. Get all active, unpaused queues
      const activeQueues = await prisma.queue.findMany({
        where: { isPaused: false },
        select: { id: true, concurrencyLimit: true }
      });

      // 2. For each queue, check how many jobs are currently running
      for (const queue of activeQueues) {
        const runningJobsCount = await prisma.job.count({
          where: { queueId: queue.id, status: 'RUNNING' }
        });

        // 3. If we have capacity, try to claim a job
        if (runningJobsCount < queue.concurrencyLimit && this.dbWorkerId) {
          const claimedJob = await JobClaimer.claimNextJob(queue.id, this.dbWorkerId);
          if (claimedJob) {
            // Do NOT await execution here, we want it to run concurrently
            JobExecutor.execute(claimedJob);
          }
        }
      }

      // Heartbeat
      if (this.dbWorkerId) {
        await prisma.workerHeartbeat.create({
          data: { workerId: this.dbWorkerId }
        });
      }

    } catch (error) {
      console.error('[WorkerEngine] Polling error:', error);
    }

    // Schedule next poll
    setTimeout(() => this.poll(), this.pollIntervalMs);
  }
}



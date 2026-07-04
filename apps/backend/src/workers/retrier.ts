import prisma from '../utils/db';
import { Job, JobStatus } from '@prisma/client';
import { getSocket } from '../utils/socket';

export class JobRetrier {
  static async handleFailure(job: Job, errorMsg: string): Promise<void> {
    const nextRetryCount = job.retryCount + 1;
    let nextStatus: JobStatus = JobStatus.FAILED;
    let runAt = new Date();

    if (nextRetryCount <= job.maxRetries) {
      nextStatus = JobStatus.RETRY;
      
      // Simple fixed delay for now (could be dynamic based on Job.retryPolicyId)
      // Base delay of 5000ms
      const delayMs = 5000 * Math.pow(2, job.retryCount); // Exponential backoff fallback
      runAt = new Date(Date.now() + delayMs);
    } else {
      nextStatus = JobStatus.DEAD_LETTER;
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        status: nextStatus,
        retryCount: nextRetryCount,
        runAt: runAt,
        updatedAt: new Date()
      }
    });

    getSocket().to(`queue_${job.queueId}`).emit('job:updated', updatedJob);

    // Update execution history
    const latestExecution = await prisma.jobExecution.findFirst({
      where: { jobId: job.id },
      orderBy: { startedAt: 'desc' }
    });

    if (latestExecution) {
      await prisma.jobExecution.update({
        where: { id: latestExecution.id },
        data: {
          status: JobStatus.FAILED,
          error: errorMsg,
          finishedAt: new Date()
        }
      });
    }
  }
}

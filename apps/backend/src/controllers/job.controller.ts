import { Response } from 'express';
import prisma from '../utils/db';
import { submitJobSchema } from '../models/job.schema';
import { AuthRequest } from '../middleware/auth.middleware';
import { JobStatus } from '@prisma/client';

const verifyQueueAccess = async (userId: string, queueId: string) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { project: { include: { organization: { include: { users: true } } } } }
  });

  if (!queue) return false;
  
  const hasAccess = queue.project.organization.users.some(ou => ou.userId === userId);
  return hasAccess;
};

export const submitJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = submitJobSchema.parse(req.body);
    const queueId = req.params.queueId as string;
    const userId = req.user!.userId;

    const hasAccess = await verifyQueueAccess(userId, queueId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    let runAt = new Date();
    let status: JobStatus = JobStatus.QUEUED;
    
    if (validatedData.delayMs && validatedData.delayMs > 0) {
      runAt = new Date(Date.now() + validatedData.delayMs);
      status = JobStatus.SCHEDULED;
    }

    const job = await prisma.job.create({
      data: {
        payload: validatedData.payload,
        priority: validatedData.priority,
        status: status,
        runAt: runAt,
        queueId: queueId,
      },
    });

    res.status(201).json(job);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const listJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queueId = req.params.queueId as string;
    const userId = req.user!.userId;
    const statusFilter = req.query.status as JobStatus | undefined;
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 50;

    const hasAccess = await verifyQueueAccess(userId, queueId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { 
        queueId,
        ...(statusFilter && { status: statusFilter })
      },
      orderBy: [
        { priority: 'desc' },
        { runAt: 'asc' }
      ],
      skip,
      take
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user!.userId;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        executions: { orderBy: { startedAt: 'desc' } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const hasAccess = await verifyQueueAccess(userId, job.queueId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

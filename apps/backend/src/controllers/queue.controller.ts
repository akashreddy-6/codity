import { Response } from 'express';
import prisma from '../utils/db';
import { createQueueSchema } from '../models/queue.schema';
import { AuthRequest } from '../middleware/auth.middleware';

// Middleware or helper to verify user has access to the project
const verifyProjectAccess = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { organization: { include: { users: true } } }
  });

  if (!project) return false;
  
  const hasAccess = project.organization.users.some(ou => ou.userId === userId);
  return hasAccess;
};

export const createQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createQueueSchema.parse(req.body);
    const projectId = req.params.projectId as string;
    const userId = req.user!.userId;

    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
      return;
    }

    const queue = await prisma.queue.create({
      data: {
        name: validatedData.name,
        priority: validatedData.priority,
        concurrencyLimit: validatedData.concurrencyLimit,
        projectId: projectId,
      },
    });

    res.status(201).json(queue);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const listQueues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const userId = req.user!.userId;

    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
      return;
    }

    const queues = await prisma.queue.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { jobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(queues);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const pauseQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queueId = req.params.id as string;
    const userId = req.user!.userId;

    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      res.status(404).json({ error: 'Queue not found' });
      return;
    }

    const hasAccess = await verifyProjectAccess(userId, queue.projectId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: queueId },
      data: { isPaused: true }
    });

    res.status(200).json(updatedQueue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resumeQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queueId = req.params.id as string;
    const userId = req.user!.userId;

    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      res.status(404).json({ error: 'Queue not found' });
      return;
    }

    const hasAccess = await verifyProjectAccess(userId, queue.projectId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: queueId },
      data: { isPaused: false }
    });

    res.status(200).json(updatedQueue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queueId = req.params.id as string;
    const userId = req.user!.userId;

    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      res.status(404).json({ error: 'Queue not found' });
      return;
    }

    const hasAccess = await verifyProjectAccess(userId, queue.projectId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.queue.delete({ where: { id: queueId } });

    res.status(200).json({ message: 'Queue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

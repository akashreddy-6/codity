import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.params.orgId as string;
    const userId = req.user!.userId;

    // Verify user belongs to the organization
    const orgUser = await prisma.organizationUser.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });

    if (!orgUser) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Get overall counts for the org's projects -> queues -> jobs
    const jobsCountByStatus = await prisma.job.groupBy({
      by: ['status'],
      where: {
        queue: {
          project: {
            organizationId: orgId
          }
        }
      },
      _count: true,
    });

    // We can also fetch the active workers
    const activeWorkers = await prisma.worker.count({
      where: { status: 'ACTIVE' }
    });

    // We can fetch a simple timeseries of completed jobs today
    // For simplicity, we just return the raw aggregated data
    res.status(200).json({
      jobStats: jobsCountByStatus,
      activeWorkers
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

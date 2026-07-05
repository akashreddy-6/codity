import { Response } from 'express';
import prisma from '../utils/db';
import { createOrganizationSchema } from '../models/org.schema';
import { AuthRequest } from '../middleware/auth.middleware';

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createOrganizationSchema.parse(req.body);
    const userId = req.user!.userId;

    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        users: {
          create: {
            userId: userId,
          }
        }
      },
    });

    res.status(201).json(organization);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.issues?.[0]?.message || 'Validation error';
      res.status(400).json({ error: firstError, details: error.issues });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const listOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const organizations = await prisma.organization.findMany({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

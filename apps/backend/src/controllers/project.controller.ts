import { Response } from 'express';
import prisma from '../utils/db';
import { createProjectSchema } from '../models/org.schema';
import { AuthRequest } from '../middleware/auth.middleware';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const organizationId = req.params.orgId as string;
    const userId = req.user!.userId;

    // Verify user belongs to the organization
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        }
      }
    });

    if (!orgUser) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this organization' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        organizationId: organizationId,
      },
    });

    res.status(201).json(project);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const listProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.params.orgId as string;
    const userId = req.user!.userId;

    // Verify user belongs to the organization
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        }
      }
    });

    if (!orgUser) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this organization' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { queues: true }
        }
      }
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user belongs to the organization
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: project.organizationId,
        }
      }
    });

    if (!orgUser) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
      return;
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../models/auth.schema';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0]?.message || 'Validation error';
      res.status(400).json({ error: firstError, details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0]?.message || 'Validation error';
      res.status(400).json({ error: firstError, details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const me = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

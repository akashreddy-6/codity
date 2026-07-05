import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

// TEMPORARY ENDPOINT TO DEBUG DATABASE CONNECTION ON RAILWAY
router.get('/test-db', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    res.json({ status: 'connected', url: process.env.DATABASE_URL ? 'set' : 'missing' });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack, url: process.env.DATABASE_URL ? 'set' : 'missing' });
  }
});

export default router;

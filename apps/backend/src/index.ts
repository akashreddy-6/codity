import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import projectRoutes from './routes/project.routes';
import queueRoutes from './routes/queue.routes';
import jobRoutes from './routes/job.routes';
import metricsRoutes from './routes/metrics.routes';
import { createServer } from 'http';
import { initSocket } from './utils/socket';
import { WorkerEngine } from './workers/engine';

const app = express();
const port = process.env.PORT || 4000;
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Start Worker Engine
const engine = new WorkerEngine();
engine.start();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



httpServer.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

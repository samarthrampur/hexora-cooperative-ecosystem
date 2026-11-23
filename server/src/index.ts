import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import lmsRoutes from './routes/lms.routes';
import erpRoutes from './routes/erp.routes';
import employmentRoutes from './routes/employment.routes';
import aiRoutes from './routes/ai.routes';
import hardwareRoutes from './routes/hardware.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hardware', hardwareRoutes);

// System Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'HEXORA Unified Cooperative Ecosystem',
    problemStatement: 'SIH26087',
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HEXORA Unified Backend Server active on port ${PORT}`);
  console.log(`📡 Ready for LMS, ERP, Employment, AI, and Hardware Device requests.`);
});

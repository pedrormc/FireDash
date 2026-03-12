import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import kpiRoutes from './routes/kpis.js';
import tipoRoutes from './routes/tipos.js';
import userRoutes from './routes/users.js';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

// 1. Helmet (security headers)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// 2. Global rate limiter
app.use(globalLimiter);

// 3. CORS
const corsOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined);

if (!corsOrigin) {
  throw new Error('CORS_ORIGIN environment variable is required in production');
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// 4. Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Health check (sem auth)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/users', userRoutes);

// Iniciar servidor (dev local)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API Bombeiros rodando em http://localhost:${PORT}`);
  });
}

// Export para Vercel serverless
export default app;

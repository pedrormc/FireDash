import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import kpiRoutes from './routes/kpis.js';
import tipoRoutes from './routes/tipos.js';
import userRoutes from './routes/users.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRoutes);
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

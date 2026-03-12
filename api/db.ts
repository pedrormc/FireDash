import pg from 'pg';
import dotenv from 'dotenv';

// Em produção (Vercel), env vars são injetadas pelo runtime
dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export default pool;

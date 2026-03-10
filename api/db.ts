import pg from 'pg';
import dotenv from 'dotenv';

// Em produção (Vercel), env vars são injetadas pelo runtime
dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export default pool;

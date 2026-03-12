// Executar com: npx tsx api/migrations/001_hash_passwords.ts
// IMPORTANTE: Fazer backup do banco antes de executar
// IMPORTANTE: Executar apenas UMA vez

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface UserRow {
  id: number;
  senha: string;
}

async function migrate(): Promise<void> {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Iniciando migração de senhas...');

    // Garantir que coluna suporta hash bcrypt (60 caracteres)
    await pool.query('ALTER TABLE users ALTER COLUMN senha TYPE VARCHAR(255)');
    console.log('Coluna senha alterada para VARCHAR(255)');

    // Buscar todos os usuários
    const { rows: users } = await pool.query<UserRow>('SELECT id, senha FROM users');
    console.log(`Encontrados ${users.length} usuários`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      // Pular se já é hash bcrypt
      if (user.senha.startsWith('$2b$') || user.senha.startsWith('$2a$')) {
        skipped++;
        continue;
      }

      const hash = await bcrypt.hash(user.senha, 12);
      await pool.query('UPDATE users SET senha = $1 WHERE id = $2', [hash, user.id]);
      migrated++;
      console.log(`Usuário ${user.id}: senha migrada para bcrypt`);
    }

    console.log(`\nMigração concluída: ${migrated} migradas, ${skipped} já eram hash`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Erro na migração:', message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

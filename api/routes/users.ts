import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/users
router.get(
  '/',
  authMiddleware,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        'SELECT id, nome, email, cargo, role, ativo, created_at FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// POST /api/users
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { nome, email, senha, cargo, role } = req.body;

    if (!nome || !email || !senha) {
      res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      return;
    }

    const validRoles = ['admin', 'operador', 'visualizador'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: `Role inválida. Use: ${validRoles.join(', ')}` });
      return;
    }

    try {
      const hash = await bcrypt.hash(senha, 12);

      const result = await pool.query(
        `INSERT INTO users (nome, email, senha, cargo, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nome, email, cargo, role, ativo, created_at`,
        [nome, email, hash, cargo || null, role || 'visualizador']
      );

      res.status(201).json(result.rows[0]);
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === '23505') {
        res.status(409).json({ error: 'Este email já está cadastrado' });
        return;
      }
      console.error('Erro ao criar usuário:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// PUT /api/users/:id
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { nome, email, senha, cargo, role, ativo } = req.body;

    const validRoles = ['admin', 'operador', 'visualizador'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: `Role inválida. Use: ${validRoles.join(', ')}` });
      return;
    }

    try {
      const hash = senha ? await bcrypt.hash(senha, 12) : null;

      const result = await pool.query(
        `UPDATE users SET
          nome = COALESCE($1, nome),
          email = COALESCE($2, email),
          senha = COALESCE(NULLIF($3, ''), senha),
          cargo = COALESCE($4, cargo),
          role = COALESCE($5, role),
          ativo = COALESCE($6, ativo)
         WHERE id = $7
         RETURNING id, nome, email, cargo, role, ativo, created_at`,
        [nome, email, hash, cargo, role, ativo, req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === '23505') {
        res.status(409).json({ error: 'Este email já está cadastrado' });
        return;
      }
      console.error('Erro ao atualizar usuário:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// DELETE /api/users/:id (soft delete)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);

    // Impedir auto-exclusão
    if (req.user!.id === userId) {
      res.status(400).json({ error: 'Você não pode desativar sua própria conta' });
      return;
    }

    try {
      const result = await pool.query(
        'UPDATE users SET ativo = false WHERE id = $1 RETURNING id, nome, email',
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({ ok: true, desativado: result.rows[0] });
    } catch (err) {
      console.error('Erro ao desativar usuário:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

export default router;

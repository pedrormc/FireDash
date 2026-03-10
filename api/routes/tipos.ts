import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/tipos
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM tipos_ocorrencia WHERE ativo = true ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar tipos:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tipos
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { nome } = req.body;

    if (!nome) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    try {
      const result = await pool.query(
        'INSERT INTO tipos_ocorrencia (nome) VALUES ($1) RETURNING *',
        [nome]
      );
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ error: `Tipo "${nome}" já existe` });
        return;
      }
      console.error('Erro ao criar tipo:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// DELETE /api/tipos/:id (soft delete)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        'UPDATE tipos_ocorrencia SET ativo = false WHERE id = $1 RETURNING *',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Tipo não encontrado' });
        return;
      }

      res.json({ ok: true, desativado: result.rows[0].nome });
    } catch (err) {
      console.error('Erro ao desativar tipo:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

export default router;

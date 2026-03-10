import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/incidents
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { periodo, tipo, gravidade, status, search } = req.query;

    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Filtro por período
    if (periodo === 'hoje') {
      query += ` AND data = CURRENT_DATE`;
    } else if (periodo === 'semana') {
      query += ` AND data >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (periodo === 'mes') {
      query += ` AND data >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    // Filtro por tipo
    if (tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    // Filtro por gravidade
    if (gravidade) {
      query += ` AND gravidade = $${paramIndex}`;
      params.push(gravidade);
      paramIndex++;
    }

    // Filtro por status
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Busca textual
    if (search) {
      query += ` AND (id ILIKE $${paramIndex} OR tipo ILIKE $${paramIndex} OR bairro ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY data DESC, hora DESC NULLS LAST';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar incidents:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/incidents/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ocorrência não encontrada' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar incident:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/incidents
router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'operador'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude } = req.body;

    if (!id || !tipo || !gravidade || !bairro || !status || !data) {
      res.status(400).json({ error: 'Campos obrigatórios: id, tipo, gravidade, bairro, status, data' });
      return;
    }

    try {
      const result = await pool.query(
        `INSERT INTO incidents (id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [id, tipo, gravidade, bairro, status, data, hora || null, descricao || null, latitude || null, longitude || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ error: `Ocorrência com ID "${id}" já existe` });
        return;
      }
      console.error('Erro ao criar incident:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// PUT /api/incidents/:id
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin', 'operador'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude } = req.body;

    try {
      const result = await pool.query(
        `UPDATE incidents SET
          tipo = COALESCE($1, tipo),
          gravidade = COALESCE($2, gravidade),
          bairro = COALESCE($3, bairro),
          status = COALESCE($4, status),
          data = COALESCE($5, data),
          hora = COALESCE($6, hora),
          descricao = COALESCE($7, descricao),
          latitude = COALESCE($8, latitude),
          longitude = COALESCE($9, longitude)
         WHERE id = $10
         RETURNING *`,
        [tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Ocorrência não encontrada' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar incident:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// DELETE /api/incidents/:id
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin', 'operador'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query('DELETE FROM incidents WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Ocorrência não encontrada' });
        return;
      }

      res.json({ ok: true, deleted: req.params.id });
    } catch (err) {
      console.error('Erro ao deletar incident:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

export default router;

import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/incidents
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { periodo, tipo, gravidade, status, search } = req.query;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    let query = 'SELECT id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at FROM incidents WHERE 1=1';
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

    // Count total before adding ORDER BY / LIMIT / OFFSET
    const countQuery = query.replace(
      /^SELECT .+ FROM/,
      'SELECT COUNT(*) FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ' ORDER BY data DESC, hora DESC NULLS LAST';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Erro ao listar incidents:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/incidents/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at FROM incidents WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao buscar incident:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
      res.status(400).json({ success: false, error: 'Campos obrigatórios: id, tipo, gravidade, bairro, status, data' });
      return;
    }

    try {
      const result = await pool.query(
        `INSERT INTO incidents (id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at`,
        [id, tipo, gravidade, bairro, status, data, hora || null, descricao || null, latitude || null, longitude || null]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === '23505') {
        res.status(409).json({ success: false, error: 'Esta ocorrência já está cadastrada' });
        return;
      }
      console.error('Erro ao criar incident:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
         RETURNING id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at`,
        [tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('Erro ao atualizar incident:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
        res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
        return;
      }

      res.json({ success: true, data: { deleted: req.params.id } });
    } catch (err) {
      console.error('Erro ao deletar incident:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
);

export default router;

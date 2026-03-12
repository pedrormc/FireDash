import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/kpis
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, title, value, subtitle, icon, color, ordem FROM kpis ORDER BY ordem ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar KPIs:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/kpis/:id
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, value, subtitle, icon, color, ordem } = req.body;

    try {
      const result = await pool.query(
        `UPDATE kpis SET
          title = COALESCE($1, title),
          value = COALESCE($2, value),
          subtitle = COALESCE($3, subtitle),
          icon = COALESCE($4, icon),
          color = COALESCE($5, color),
          ordem = COALESCE($6, ordem)
         WHERE id = $7
         RETURNING id, title, value, subtitle, icon, color, ordem`,
        [title, value, subtitle, icon, color, ordem, req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'KPI não encontrado' });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('Erro ao atualizar KPI:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
);

export default router;

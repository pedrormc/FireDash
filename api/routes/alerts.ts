import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/alerts — list active alerts with incident info
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.incident_id, a.type, a.message, a.status, a.created_at,
              i.tipo AS incident_tipo, i.gravidade AS incident_gravidade, i.bairro AS incident_bairro
       FROM alerts a
       LEFT JOIN incidents i ON a.incident_id = i.id
       WHERE a.status = 'active'
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err: unknown) {
    console.error('Erro ao listar alertas:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/alerts/count — count active alerts
router.get('/count', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM alerts WHERE status = 'active'`
    );
    const count = parseInt(result.rows[0].count, 10);
    res.json({ success: true, data: { count } });
  } catch (err: unknown) {
    console.error('Erro ao contar alertas:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PATCH /api/alerts/:id/dismiss — dismiss single alert
router.patch(
  '/:id/dismiss',
  authMiddleware,
  requireRole('admin', 'operador'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const alertId = parseInt(req.params.id, 10);
    if (isNaN(alertId)) {
      res.status(400).json({ success: false, error: 'ID de alerta inválido' });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE alerts SET status = 'dismissed', dismissed_by = $1, dismissed_at = NOW()
         WHERE id = $2 AND status = 'active'
         RETURNING id, status, dismissed_at`,
        [req.user?.id, alertId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Alerta não encontrado ou já dispensado' });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err: unknown) {
      console.error('Erro ao dispensar alerta:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
);

// PATCH /api/alerts/dismiss-all — dismiss all active alerts
router.patch(
  '/dismiss-all',
  authMiddleware,
  requireRole('admin', 'operador'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `UPDATE alerts SET status = 'dismissed', dismissed_by = $1, dismissed_at = NOW()
         WHERE status = 'active'`,
        [req.user?.id]
      );

      res.json({ success: true, data: { dismissed: result.rowCount } });
    } catch (err: unknown) {
      console.error('Erro ao dispensar todos alertas:', err);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
);

export default router;

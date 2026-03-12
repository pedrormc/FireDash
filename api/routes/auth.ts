import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { AuthRequest, authMiddleware, generateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, nome, email, senha, cargo, role, ativo FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha))) {
      res.status(401).json({ success: false, error: 'Credenciais inválidas' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/register
router.post('/register', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nome, email, senha, cargo, role } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios' });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({ success: false, error: 'A senha deve ter no mínimo 6 caracteres' });
    return;
  }

  const validRoles = ['admin', 'operador', 'visualizador'];
  const userRole = role && validRoles.includes(role) ? role : 'visualizador';

  try {
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, error: 'Este email já está cadastrado' });
      return;
    }

    const hash = await bcrypt.hash(senha, 12);

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha, cargo, role, ativo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nome, email, cargo, role`,
      [nome, email, hash, cargo || null, userRole]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, cargo, role FROM users WHERE id = $1 AND ativo = true',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      return;
    }

    res.json({ success: true, data: { user: result.rows[0] } });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout (stateless — apenas confirma)
router.post('/logout', authMiddleware, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: { message: 'Logout realizado' } });
});

export default router;

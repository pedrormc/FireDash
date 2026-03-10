import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

type Role = 'admin' | 'operador' | 'visualizador';

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({ error: 'Acesso negado. Role insuficiente.' });
      return;
    }

    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { UserRole } from '../generated/prisma';

// Estender o tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware para autenticação via JWT (httpOnly cookie)
 * Verifica se o token é válido e adiciona os dados do usuário ao req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Tentar pegar o token do cookie httpOnly
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Não autenticado. Token não fornecido.'
      });
      return;
    }

    // Verificar e decodificar o token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado.'
      });
      return;
    }

    // Adicionar dados do usuário à requisição
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Erro ao verificar autenticação.'
    });
  }
}

/**
 * Middleware para verificar se o usuário tem uma role específica
 * Deve ser usado APÓS o middleware authenticate
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Não autenticado.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware opcional: permite requisições com ou sem autenticação
 * Se houver token válido, adiciona req.user, senão continua sem ele
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

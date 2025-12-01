import jwt from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

/**
 * Gera um token JWT
 * @param payload - Dados do usuário para incluir no token
 * @returns Token JWT assinado
 */
export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'services-marketplace',
    audience: 'services-marketplace-users'
  });
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'services-marketplace',
      audience: 'services-marketplace-users'
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    // Token inválido, expirado ou adulterado
    return null;
  }
}

/**
 * Decodifica um token sem verificar (SOMENTE para debug)
 * @param token - Token JWT
 * @returns Payload decodificado ou null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

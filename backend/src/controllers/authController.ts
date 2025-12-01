import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Configuração do cookie
const COOKIE_OPTIONS = {
  httpOnly: true, // Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
  sameSite: 'strict' as const, // Proteção CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
  path: '/'
};

/**
 * POST /api/auth/register
 * Registra um novo usuário (cliente ou prestador)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios.'
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Email inválido.'
      });
      return;
    }

    // Validar força da senha (mínimo 6 caracteres)
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres.'
      });
      return;
    }

    // Validar role (apenas CLIENT ou PROVIDER permitidos no registro)
    if (role && role !== 'CLIENT' && role !== 'PROVIDER') {
      res.status(400).json({
        success: false,
        message: 'Role inválida. Use CLIENT ou PROVIDER.'
      });
      return;
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado.'
      });
      return;
    }

    // Hash da senha
    const password_hash = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        phone: phone || null,
        role: role || 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true
      }
    });

    // Se for PROVIDER, criar registro na tabela providers
    if (user.role === 'PROVIDER') {
      await prisma.provider.create({
        data: {
          user_id: user.id
        }
      });
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Definir cookie httpOnly com o token
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário.'
    });
  }
}

/**
 * POST /api/auth/login
 * Autentica um usuário e retorna token JWT em httpOnly cookie
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios.'
      });
      return;
    }

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos.'
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos.'
      });
      return;
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Definir cookie httpOnly com o token
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login.'
    });
  }
}

/**
 * POST /api/auth/logout
 * Remove o cookie de autenticação
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso!'
  });
}

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado
 * Requer autenticação (middleware authenticate)
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Não autenticado.'
      });
      return;
    }

    // Buscar dados atualizados do usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
        provider: {
          select: {
            id: true,
            bio: true,
            document: true,
            city: true,
            state: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário.'
    });
  }
}

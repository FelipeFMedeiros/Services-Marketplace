import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout (limpar cookie)
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private (requer autenticação)
 */
router.get('/me', authenticate, getMe);

export default router;

import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, meLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário (cliente ou prestador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@exemplo.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: senha123
 *               phone:
 *                 type: string
 *                 example: "11987654321"
 *               role:
 *                 type: string
 *                 enum: [CLIENT, PROVIDER]
 *                 default: CLIENT
 *                 example: CLIENT
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGc...; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuário registrado com sucesso!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
router.post('/register', authLimiter, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna JWT em httpOnly cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@exemplo.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGc...; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Email ou senha incorretos
 */
router.post('/login', authLimiter, login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Fazer logout
 *     description: Remove o cookie de autenticação
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso!
 */
router.post('/logout', authLimiter, logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obter dados do usuário autenticado
 *     description: Retorna informações do usuário atualmente logado
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             provider:
 *                               $ref: '#/components/schemas/Provider'
 *                               nullable: true
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/me', meLimiter, authenticate, getMe);

export default router;

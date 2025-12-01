import { Router } from 'express';
import { updateProviderProfile, getProviderById } from '../controllers/providerController';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter, createLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @openapi
 * /api/providers/profile:
 *   put:
 *     tags:
 *       - Providers
 *     summary: Atualizar perfil do prestador
 *     description: Atualiza informações do perfil do prestador autenticado
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Profissional com 20 anos de experiência em manicure e pedicure.
 *               document:
 *                 type: string
 *                 example: "12345678900"
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 example: SP
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
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
 *                   example: Perfil atualizado com sucesso!
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       $ref: '#/components/schemas/Provider'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas prestadores podem atualizar
 *       404:
 *         description: Perfil não encontrado
 */
router.put('/profile', authenticate, authorize('PROVIDER'), createLimiter, updateProviderProfile);

/**
 * @openapi
 * /api/providers/{id}:
 *   get:
 *     tags:
 *       - Providers
 *     summary: Buscar perfil público de prestador
 *     description: Retorna informações públicas de um prestador e seus serviços
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do prestador
 *     responses:
 *       200:
 *         description: Dados do prestador
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
 *                     provider:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Provider'
 *                         - type: object
 *                           properties:
 *                             services:
 *                               type: array
 *                               items:
 *                                 type: object
 *       404:
 *         description: Prestador não encontrado
 */
router.get('/:id', generalLimiter, getProviderById);

export default router;

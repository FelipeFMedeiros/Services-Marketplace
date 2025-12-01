import { Router } from 'express';
import { getAllServiceTypes, getServiceTypeById } from '../controllers/serviceTypeController';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @openapi
 * /api/service-types:
 *   get:
 *     tags:
 *       - Service Types
 *     summary: Listar todos os tipos de serviço
 *     description: Retorna lista de tipos de serviço disponíveis no marketplace
 *     responses:
 *       200:
 *         description: Lista de tipos de serviço
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
 *                     serviceTypes:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/ServiceType'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   services:
 *                                     type: integer
 *                                     example: 5
 *                     total:
 *                       type: integer
 *                       example: 10
 */
router.get('/', generalLimiter, getAllServiceTypes);

/**
 * @openapi
 * /api/service-types/{id}:
 *   get:
 *     tags:
 *       - Service Types
 *     summary: Buscar tipo de serviço por ID
 *     description: Retorna detalhes de um tipo de serviço específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tipo de serviço
 *     responses:
 *       200:
 *         description: Detalhes do tipo de serviço
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
 *                     serviceType:
 *                       $ref: '#/components/schemas/ServiceType'
 *       404:
 *         description: Tipo de serviço não encontrado
 */
router.get('/:id', generalLimiter, getServiceTypeById);

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter, createLimiter } from '../middleware/rateLimiter';
import {
  createReview,
  getServiceReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers/reviewController';

const router = Router();

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Criar avaliação
 *     description: Cliente cria avaliação para um serviço após agendamento COMPLETED (apenas CLIENT)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 1
 *                 description: ID do agendamento (deve estar COMPLETED e pertencer ao cliente)
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Avaliação de 1 a 5 estrelas
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Excelente serviço! Muito atencioso e caprichoso. Recomendo!"
 *                 description: Comentário opcional (10-500 caracteres)
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Avaliação criada com sucesso"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     client:
 *                       type: object
 *                     service:
 *                       type: object
 *                     booking:
 *                       type: object
 *       400:
 *         description: Dados inválidos, booking não COMPLETED, ou já existe avaliação para este booking
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas CLIENT) ou booking não pertence ao usuário
 *       404:
 *         description: Agendamento não encontrado
 */
router.post('/', authenticate, authorize('CLIENT'), createLimiter, createReview);

/**
 * @openapi
 * /api/reviews/my:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Listar minhas avaliações
 *     description: Retorna todas as avaliações feitas pelo cliente autenticado (apenas CLIENT)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Itens por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de avaliações do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       service:
 *                         type: object
 *                       booking:
 *                         type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas CLIENT pode acessar
 */
router.get('/my', authenticate, authorize('CLIENT'), generalLimiter, getMyReviews);

/**
 * @openapi
 * /api/reviews/service/{serviceId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Listar avaliações de um serviço
 *     description: Retorna avaliações de um serviço com estatísticas (rota pública)
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Itens por página (máximo 100)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por rating mínimo
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por rating máximo
 *     responses:
 *       200:
 *         description: Lista de avaliações com estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                       description: Média de avaliações (0-5)
 *                     totalReviews:
 *                       type: integer
 *                       example: 42
 *                       description: Total de avaliações
 *                     ratingDistribution:
 *                       type: object
 *                       properties:
 *                         1:
 *                           type: integer
 *                           example: 2
 *                         2:
 *                           type: integer
 *                           example: 3
 *                         3:
 *                           type: integer
 *                           example: 5
 *                         4:
 *                           type: integer
 *                           example: 12
 *                         5:
 *                           type: integer
 *                           example: 20
 */
router.get('/service/:serviceId', generalLimiter, getServiceReviews);

/**
 * @openapi
 * /api/reviews/{id}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Buscar avaliação por ID
 *     description: Retorna detalhes de uma avaliação específica (rota pública)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Detalhes da avaliação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 rating:
 *                   type: integer
 *                 comment:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 client:
 *                   type: object
 *                 service:
 *                   type: object
 *                 booking:
 *                   type: object
 *       404:
 *         description: Avaliação não encontrada
 */
router.get('/:id', generalLimiter, getReviewById);

/**
 * @openapi
 * /api/reviews/{id}:
 *   put:
 *     tags:
 *       - Reviews
 *     summary: Atualizar avaliação
 *     description: Atualiza rating ou comentário de uma avaliação (apenas o dono CLIENT)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Serviço muito bom, mas poderia ser mais rápido."
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Avaliação atualizada com sucesso"
 *                 review:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (não é o dono)
 *       404:
 *         description: Avaliação não encontrada
 */
router.put('/:id', authenticate, authorize('CLIENT'), createLimiter, updateReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Deletar avaliação
 *     description: Remove permanentemente uma avaliação (apenas o dono CLIENT)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Avaliação deletada com sucesso"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (não é o dono)
 *       404:
 *         description: Avaliação não encontrada
 */
router.delete('/:id', authenticate, authorize('CLIENT'), createLimiter, deleteReview);

export default router;

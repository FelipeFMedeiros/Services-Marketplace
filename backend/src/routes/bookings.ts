import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createLimiter, generalLimiter } from '../middleware/rateLimiter';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController';

const router = Router();

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Criar contratação/agendamento
 *     description: Cliente contrata um serviço escolhendo variação e horário (requer autenticação CLIENT)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - variationId
 *               - startDatetime
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *                 description: ID do serviço a contratar
 *               variationId:
 *                 type: integer
 *                 example: 2
 *                 description: ID da variação escolhida
 *               startDatetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-15T14:00:00"
 *                 description: Data/hora de início (ISO 8601)
 *     responses:
 *       201:
 *         description: Contratação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contratação realizada com sucesso!"
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     start_datetime:
 *                       type: string
 *                       format: date-time
 *                     end_datetime:
 *                       type: string
 *                       format: date-time
 *                     price_at_booking:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, CANCELLED, COMPLETED]
 *       400:
 *         description: Dados inválidos, horário indisponível ou sobreposição
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas CLIENTs podem contratar
 *       404:
 *         description: Serviço ou variação não encontrados
 */
router.post('/', authenticate, authorize('CLIENT'), createLimiter, createBooking);

/**
 * @openapi
 * /api/bookings/my:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Listar minhas contratações
 *     description: Cliente visualiza suas próprias contratações com filtros
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, CANCELLED, COMPLETED]
 *         description: Filtrar por status
 *         example: "APPROVED"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar contratações a partir desta data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar contratações até esta data
 *     responses:
 *       200:
 *         description: Lista de contratações do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas CLIENTs
 */
router.get('/my', authenticate, authorize('CLIENT'), generalLimiter, getMyBookings);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Buscar detalhes de uma contratação
 *     description: Visualiza detalhes completos (apenas cliente ou prestador envolvidos)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da contratação
 *     responses:
 *       200:
 *         description: Detalhes da contratação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (não é cliente nem prestador desta contratação)
 *       404:
 *         description: Contratação não encontrada
 */
router.get('/:id', authenticate, generalLimiter, getBookingById);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Cancelar contratação
 *     description: Cliente cancela sua própria contratação (apenas PENDING ou APPROVED)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da contratação
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Imprevisto, não poderei comparecer"
 *                 description: Motivo do cancelamento (opcional)
 *     responses:
 *       200:
 *         description: Contratação cancelada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contratação cancelada com sucesso"
 *                 booking:
 *                   type: object
 *       400:
 *         description: Já cancelada ou já concluída
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não é o dono da contratação
 *       404:
 *         description: Contratação não encontrada
 */
router.patch('/:id/cancel', authenticate, authorize('CLIENT'), createLimiter, cancelBooking);

export default router;

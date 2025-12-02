import { Router } from 'express';
import { 
  updateProviderProfile, 
  getProviderById, 
  searchProviders,
  getProviderBookings,
  getProviderStats,
  getProviderNotifications,
  markNotificationAsRead,
  cancelProviderBooking
} from '../controllers/providerController';
import {
  createAvailability,
  getMyAvailabilities,
  updateAvailability,
  deleteAvailability,
  getAvailableSlots
} from '../controllers/availabilityController';
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
 * /api/providers/search:
 *   get:
 *     tags:
 *       - Providers
 *     summary: Buscar prestadores (público)
 *     description: Busca prestadores com filtros de localização, tipo de serviço e ordenação
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *         example: "São Paulo"
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado (sigla)
 *         example: "SP"
 *       - in: query
 *         name: serviceTypeId
 *         schema:
 *           type: integer
 *         description: Filtrar prestadores que oferecem este tipo de serviço
 *         example: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome do prestador ou bio
 *         example: "manicure"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [services_count, recent]
 *         description: Ordenação (services_count = mais serviços, recent = mais recentes)
 *         example: "services_count"
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
 *         description: Lista de prestadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     providers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/search', generalLimiter, searchProviders);

// ============================================
// PROVIDER AVAILABILITIES ROUTES
// ⚠️ IMPORTANTE: Rotas específicas DEVEM vir ANTES de rotas com parâmetros /:id
// ============================================

/**
 * @openapi
 * /api/providers/availabilities:
 *   post:
 *     tags:
 *       - Provider Availabilities
 *     summary: Criar bloco de disponibilidade
 *     description: Prestador cria um período de disponibilidade para agendamentos
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDatetime
 *               - endDatetime
 *             properties:
 *               startDatetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-15T08:00:00"
 *                 description: Data/hora de início (ISO 8601)
 *               endDatetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-15T18:00:00"
 *                 description: Data/hora de fim (ISO 8601)
 *     responses:
 *       201:
 *         description: Disponibilidade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 availability:
 *                   type: object
 *       400:
 *         description: Dados inválidos ou período com sobreposição
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas PROVIDER pode criar
 */
router.post('/availabilities', authenticate, authorize('PROVIDER'), createLimiter, createAvailability);

/**
 * @openapi
 * /api/providers/availabilities:
 *   get:
 *     tags:
 *       - Provider Availabilities
 *     summary: Listar minhas disponibilidades
 *     description: Retorna todas as disponibilidades do prestador autenticado
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por ativas ou inativas
 *         example: true
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar disponibilidades a partir desta data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar disponibilidades até esta data
 *     responses:
 *       200:
 *         description: Lista de disponibilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 availabilities:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas PROVIDER
 */
router.get('/availabilities', authenticate, authorize('PROVIDER'), generalLimiter, getMyAvailabilities);

/**
 * @openapi
 * /api/providers/availabilities/{id}:
 *   put:
 *     tags:
 *       - Provider Availabilities
 *     summary: Atualizar disponibilidade
 *     description: Atualiza período ou status de disponibilidade (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da disponibilidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDatetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-15T09:00:00"
 *               endDatetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-15T17:00:00"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Disponibilidade atualizada
 *       400:
 *         description: Dados inválidos ou sobreposição
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.put('/availabilities/:id', authenticate, authorize('PROVIDER'), createLimiter, updateAvailability);

/**
 * @openapi
 * /api/providers/availabilities/{id}:
 *   delete:
 *     tags:
 *       - Provider Availabilities
 *     summary: Deletar disponibilidade
 *     description: Remove permanentemente uma disponibilidade (não permite se houver bookings)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da disponibilidade
 *     responses:
 *       200:
 *         description: Disponibilidade deletada
 *       400:
 *         description: Há agendamentos confirmados neste período
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.delete('/availabilities/:id', authenticate, authorize('PROVIDER'), createLimiter, deleteAvailability);

/**
 * @openapi
 * /api/providers/{id}/available-slots:
 *   get:
 *     tags:
 *       - Provider Availabilities
 *     summary: Buscar slots disponíveis (público)
 *     description: Retorna períodos livres de um prestador para clientes agendarem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do prestador
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial para buscar slots
 *         example: "2025-12-15T00:00:00"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final para buscar slots
 *         example: "2025-12-20T23:59:59"
 *       - in: query
 *         name: durationMinutes
 *         schema:
 *           type: integer
 *         description: Duração mínima do slot em minutos (filtra slots menores)
 *         example: 60
 *     responses:
 *       200:
 *         description: Slots disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provider:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 *                 availableSlots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *                       durationMinutes:
 *                         type: integer
 *                 totalSlots:
 *                   type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Prestador não encontrado
 */
router.get('/:id/available-slots', generalLimiter, getAvailableSlots);

// ============================================
// PROVIDER DASHBOARD & BOOKINGS
// ⚠️ IMPORTANTE: Rotas específicas DEVEM vir ANTES de /:id
// ============================================

/**
 * @openapi
 * /api/providers/bookings:
 *   get:
 *     tags:
 *       - Provider Dashboard
 *     summary: Listar agendamentos recebidos
 *     description: Prestador visualiza todas as contratações/agendamentos recebidos
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
 *         description: Agendamentos a partir de
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Agendamentos até
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas PROVIDER
 */
router.get('/bookings', authenticate, authorize('PROVIDER'), generalLimiter, getProviderBookings);

/**
 * @openapi
 * /api/providers/dashboard/stats:
 *   get:
 *     tags:
 *       - Provider Dashboard
 *     summary: Estatísticas do prestador
 *     description: Retorna métricas e estatísticas do prestador (agendamentos, receita, próximos eventos)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do prestador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         approved:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                         thisMonth:
 *                           type: integer
 *                         thisWeek:
 *                           type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         thisMonth:
 *                           type: number
 *                     upcoming:
 *                       type: array
 *                       items:
 *                         type: object
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         unread:
 *                           type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas PROVIDER
 */
router.get('/dashboard/stats', authenticate, authorize('PROVIDER'), generalLimiter, getProviderStats);

/**
 * @openapi
 * /api/providers/notifications:
 *   get:
 *     tags:
 *       - Provider Dashboard
 *     summary: Listar notificações
 *     description: Retorna notificações do prestador (novas contratações, cancelamentos, etc)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filtrar por lidas/não lidas
 *         example: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas PROVIDER
 */
router.get('/notifications', authenticate, authorize('PROVIDER'), generalLimiter, getProviderNotifications);

/**
 * @openapi
 * /api/providers/bookings/{id}/cancel:
 *   patch:
 *     tags:
 *       - Provider Dashboard
 *     summary: Cancelar agendamento
 *     description: Prestador cancela um agendamento recebido (apenas PENDING ou APPROVED)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Imprevisto, não poderei atender neste horário"
 *                 description: Motivo do cancelamento (opcional)
 *     responses:
 *       200:
 *         description: Agendamento cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Agendamento cancelado com sucesso"
 *                 data:
 *                   type: object
 *       400:
 *         description: Já cancelado ou já concluído
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não pertence ao prestador
 *       404:
 *         description: Agendamento não encontrado
 */
router.patch('/bookings/:id/cancel', authenticate, authorize('PROVIDER'), createLimiter, cancelProviderBooking);

/**
 * @openapi
 * /api/providers/notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Provider Dashboard
 *     summary: Marcar notificação como lida
 *     description: Marca uma notificação específica como lida
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Notificação não encontrada
 */
router.patch('/notifications/:id/read', authenticate, authorize('PROVIDER'), createLimiter, markNotificationAsRead);

// ============================================
// PROVIDER PUBLIC PROFILE
// ⚠️ IMPORTANTE: Esta rota com /:id DEVE vir POR ÚLTIMO
// para não capturar rotas específicas como /availabilities
// ============================================

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

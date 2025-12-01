import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createLimiter, generalLimiter } from '../middleware/rateLimiter';
import {
  createService,
  getAllServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  createVariation,
  updateVariation,
  deleteVariation
} from '../controllers/serviceController';
import {
  uploadPhoto,
  setCoverPhoto,
  deletePhoto
} from '../controllers/servicePhotoController';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @openapi
 * /api/services:
 *   post:
 *     tags:
 *       - Services
 *     summary: Criar um novo serviço
 *     description: Permite que um prestador crie um novo serviço (apenas PROVIDER autenticado)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - serviceTypeId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Corte de Cabelo Masculino"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Corte moderno com acabamento profissional e lavagem incluída"
 *               serviceTypeId:
 *                 type: integer
 *                 example: 1
 *               allowsMultipleDays:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serviço criado com sucesso"
 *                 service:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas PROVIDER)
 */
router.post(
  '/',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  createService
);

/**
 * @openapi
 * /api/services/my:
 *   get:
 *     tags:
 *       - Services
 *     summary: Listar meus serviços
 *     description: Retorna todos os serviços do prestador autenticado
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por serviços ativos ou inativos
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de serviços do prestador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas PROVIDER)
 */
router.get(
  '/my',
  authenticate,
  authorize('PROVIDER'),
  generalLimiter,
  getMyServices
);

/**
 * @openapi
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Listar todos os serviços do marketplace
 *     description: Retorna lista paginada de serviços ativos com filtros (rota pública)
 *     parameters:
 *       - in: query
 *         name: serviceTypeId
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de serviço
 *         example: 1
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por cidade do prestador
 *         example: "São Paulo"
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado do prestador (UF)
 *         example: "SP"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar no nome ou descrição do serviço
 *         example: "corte cabelo"
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
 *         description: Itens por página (máx 100)
 *     responses:
 *       200:
 *         description: Lista de serviços com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 */
router.get(
  '/',
  generalLimiter,
  getAllServices
);

/**
 * @openapi
 * /api/services/{id}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Buscar serviço por ID
 *     description: Retorna detalhes de um serviço específico (rota pública)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Detalhes do serviço
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Serviço não encontrado
 */
router.get(
  '/:id',
  generalLimiter,
  getServiceById
);

/**
 * @openapi
 * /api/services/{id}:
 *   put:
 *     tags:
 *       - Services
 *     summary: Atualizar serviço
 *     description: Permite que o prestador dono do serviço o atualize
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               serviceTypeId:
 *                 type: integer
 *               allowsMultipleDays:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serviço atualizado com sucesso"
 *                 service:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (não é o dono)
 *       404:
 *         description: Serviço não encontrado
 */
router.put(
  '/:id',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  updateService
);

/**
 * @openapi
 * /api/services/{id}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Deletar serviço
 *     description: Desativa o serviço (soft delete) - apenas o dono pode deletar
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Serviço desativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serviço desativado com sucesso"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (não é o dono)
 *       404:
 *         description: Serviço não encontrado
 */
router.delete(
  '/:id',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  deleteService
);

// ============================================
// SERVICE VARIATIONS ROUTES
// ============================================

/**
 * @openapi
 * /api/services/{id}/variations:
 *   post:
 *     tags:
 *       - Service Variations
 *     summary: Criar variação de serviço
 *     description: Adiciona uma nova variação de preço/duração ao serviço (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - durationMinutes
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Básico"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 50.00
 *               durationMinutes:
 *                 type: integer
 *                 example: 30
 *               discountPercentage:
 *                 type: number
 *                 format: decimal
 *                 example: 10.00
 *               discountDays:
 *                 type: string
 *                 example: "monday,friday"
 *     responses:
 *       201:
 *         description: Variação criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (não é o dono)
 *       404:
 *         description: Serviço não encontrado
 */
router.post(
  '/:id/variations',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  createVariation
);

/**
 * @openapi
 * /api/services/{id}/variations/{variationId}:
 *   put:
 *     tags:
 *       - Service Variations
 *     summary: Atualizar variação de serviço
 *     description: Atualiza uma variação existente (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *       - in: path
 *         name: variationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da variação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: decimal
 *               durationMinutes:
 *                 type: integer
 *               discountPercentage:
 *                 type: number
 *                 format: decimal
 *               discountDays:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Serviço ou variação não encontrada
 */
router.put(
  '/:id/variations/:variationId',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  updateVariation
);

/**
 * @openapi
 * /api/services/{id}/variations/{variationId}:
 *   delete:
 *     tags:
 *       - Service Variations
 *     summary: Deletar variação de serviço
 *     description: Remove permanentemente uma variação (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *       - in: path
 *         name: variationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da variação
 *     responses:
 *       200:
 *         description: Variação deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Serviço ou variação não encontrada
 */
router.delete(
  '/:id/variations/:variationId',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  deleteVariation
);

// ============================================
// SERVICE PHOTOS ROUTES
// ============================================

/**
 * @openapi
 * /api/services/{id}/photos:
 *   post:
 *     tags:
 *       - Service Photos
 *     summary: Upload de foto do serviço
 *     description: Faz upload de uma foto para o serviço no Cloudinary (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG, WEBP, GIF - máx 5MB)
 *               isCover:
 *                 type: boolean
 *                 default: false
 *                 description: Marcar como foto de capa
 *     responses:
 *       201:
 *         description: Foto enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 photo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     service_id:
 *                       type: integer
 *                     url:
 *                       type: string
 *                     is_cover:
 *                       type: boolean
 *                     cloudinary_public_id:
 *                       type: string
 *       400:
 *         description: Arquivo de imagem não fornecido ou tipo inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 */
router.post(
  '/:id/photos',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  upload.single('image'),
  uploadPhoto
);

/**
 * @openapi
 * /api/services/{id}/photos/{photoId}/cover:
 *   put:
 *     tags:
 *       - Service Photos
 *     summary: Definir foto de capa
 *     description: Marca uma foto como capa do serviço (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da foto
 *     responses:
 *       200:
 *         description: Foto de capa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 photo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     service_id:
 *                       type: integer
 *                     url:
 *                       type: string
 *                     is_cover:
 *                       type: boolean
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Serviço ou foto não encontrada
 */
router.put(
  '/:id/photos/:photoId/cover',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  setCoverPhoto
);

/**
 * @openapi
 * /api/services/{id}/photos/{photoId}:
 *   delete:
 *     tags:
 *       - Service Photos
 *     summary: Deletar foto do serviço
 *     description: Remove permanentemente uma foto do serviço e do Cloudinary (apenas o dono)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da foto
 *     responses:
 *       200:
 *         description: Foto deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Serviço ou foto não encontrada
 */
router.delete(
  '/:id/photos/:photoId',
  authenticate,
  authorize('PROVIDER'),
  createLimiter,
  deletePhoto
);

export default router;

import { Router } from 'express';
import authRoutes from './auth';
import serviceTypeRoutes from './serviceTypes';
import providerRoutes from './providers';
import serviceRoutes from './services';
import bookingRoutes from './bookings';
import reviewRoutes from './reviews';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de tipos de serviço
router.use('/service-types', serviceTypeRoutes);

// Rotas de prestadores
router.use('/providers', providerRoutes);

// Rotas de serviços
router.use('/services', serviceRoutes);

// Rotas de contratações/agendamentos
router.use('/bookings', bookingRoutes);

// Rotas de avaliações
router.use('/reviews', reviewRoutes);

// Rota raiz para checagem rápida da API
router.get('/', generalLimiter, (req, res) => {
  res.json({
    message: 'API Services Marketplace está funcionando!',
    version: '1.0.0',
    documentation: {
      swagger: 'http://localhost:3000/api-docs',
      scalar: 'http://localhost:3000/docs',
      json: 'http://localhost:3000/api-docs.json'
    },
    endpoints: {
      health: '/health',
      api: '/api',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      serviceTypes: {
        list: 'GET /api/service-types',
        getById: 'GET /api/service-types/:id'
      },
      providers: {
        search: 'GET /api/providers/search (público, filtros: city, state, serviceTypeId, search, sortBy)',
        updateProfile: 'PUT /api/providers/profile',
        getById: 'GET /api/providers/:id',
        dashboard: {
          bookings: 'GET /api/providers/bookings (PROVIDER)',
          cancelBooking: 'PATCH /api/providers/bookings/:id/cancel (PROVIDER)',
          stats: 'GET /api/providers/dashboard/stats (PROVIDER)',
          notifications: 'GET /api/providers/notifications (PROVIDER)',
          markNotificationRead: 'PATCH /api/providers/notifications/:id/read (PROVIDER)'
        },
        availabilities: {
          create: 'POST /api/providers/availabilities',
          list: 'GET /api/providers/availabilities (PROVIDER)',
          update: 'PUT /api/providers/availabilities/:id',
          delete: 'DELETE /api/providers/availabilities/:id',
          getSlots: 'GET /api/providers/:id/available-slots (público)'
        }
      },
      services: {
        create: 'POST /api/services',
        list: 'GET /api/services (público, filtros: serviceTypeId, city, state, search, minPrice, maxPrice, sortBy)',
        my: 'GET /api/services/my (PROVIDER)',
        getById: 'GET /api/services/:id',
        update: 'PUT /api/services/:id',
        delete: 'DELETE /api/services/:id',
        variations: {
          create: 'POST /api/services/:id/variations',
          update: 'PUT /api/services/:id/variations/:variationId',
          delete: 'DELETE /api/services/:id/variations/:variationId'
        },
        photos: {
          upload: 'POST /api/services/:id/photos',
          setCover: 'PUT /api/services/:id/photos/:photoId/cover',
          delete: 'DELETE /api/services/:id/photos/:photoId'
        }
      },
      bookings: {
        create: 'POST /api/bookings (CLIENT)',
        my: 'GET /api/bookings/my (CLIENT)',
        getById: 'GET /api/bookings/:id (cliente ou prestador)',
        cancel: 'PATCH /api/bookings/:id/cancel (CLIENT)'
      },
      reviews: {
        create: 'POST /api/reviews (CLIENT, apenas bookings COMPLETED)',
        my: 'GET /api/reviews/my (CLIENT)',
        getById: 'GET /api/reviews/:id (público)',
        update: 'PUT /api/reviews/:id (CLIENT dono)',
        delete: 'DELETE /api/reviews/:id (CLIENT dono)',
        getServiceReviews: 'GET /api/reviews/service/:serviceId (público, estatísticas incluídas)'
      }
    }
  });
});

export default router;
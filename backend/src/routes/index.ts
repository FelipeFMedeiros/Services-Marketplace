import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rota de teste
router.get('/', (req, res) => {
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
      }
    }
  });
});

// Rota de exemplo
router.get('/test', (req, res) => {
  res.json({
    message: 'Rota de teste funcionando!',
    timestamp: new Date().toISOString(),
    data: {
      status: 'success',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

export default router;
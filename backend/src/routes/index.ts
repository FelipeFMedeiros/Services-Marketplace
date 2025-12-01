import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/', (req, res) => {
  res.json({
    message: 'API Services Marketplace está funcionando!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
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
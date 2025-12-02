import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis';

/**
 * Configuração base para rate limiting
 */
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    
    // Usar Redis como store (Fixed Window)
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rl:',
    }),
    
    // Mensagem de erro customizada
    message: {
      success: false,
      message: options.message
    },
    
    // Headers padrão para informar o cliente
    standardHeaders: true, // X-RateLimit-Limit, X-RateLimit-Remaining
    legacyHeaders: false, // Desabilitar X-RateLimit-* antigos
    
    // Pular requisições bem-sucedidas (opcional)
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    
    // Handler customizado para quando exceder o limite
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message,
        retryAfter: res.getHeader('Retry-After')
      });
    }
  });
};

/**
 * Rate Limiter para rotas de autenticação sensíveis
 * 10 requisições por minuto (register, login, logout)
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 1000,
  message: 'Muitas tentativas de autenticação. Tente novamente em 1 minuto.',
  skipSuccessfulRequests: false
});

/**
 * Rate Limiter para rota /me
 * 25 requisições por minuto
 */
export const meLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 2500,
  message: 'Muitas requisições. Tente novamente em alguns segundos.'
});

/**
 * Rate Limiter geral para APIs públicas
 * 100 requisições por minuto
 */
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 10000,
  message: 'Muitas requisições. Tente novamente em 1 minuto.'
});

/**
 * Rate Limiter estrito para operações críticas
 * 5 requisições por minuto
 */
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 5000,
  message: 'Limite de requisições excedido. Tente novamente em 1 minuto.',
  skipSuccessfulRequests: true // Só conta requisições com erro
});

/**
 * Rate Limiter para criação de recursos
 * 20 requisições por minuto
 */
export const createLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 2000,
  message: 'Muitas criações em sequência. Aguarde um momento.'
});

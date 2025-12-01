import { createClient } from 'redis';

// Configuração do Redis
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Event handlers
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis pronto para uso');
});

// Conectar ao Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
  }
})();

export default redisClient;

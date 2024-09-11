import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST|| '127.0.0.1', // Ajuste conforme necessário
  port: parseInt(process.env.REDIS_PORT || '6379', 10), // Porta padrão do Redis
  maxRetriesPerRequest: 50, // Aumenta o limite de tentativas por solicitação
  retryStrategy: (times) => {
    // Estratégia de repetição personalizada
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export default redis;
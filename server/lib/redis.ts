import IORedis from 'ioredis';

export const redis = new IORedis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

export default redis;

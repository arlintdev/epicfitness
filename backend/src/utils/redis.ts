import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from './logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Too many reconnection attempts');
            return new Error('Too many retries');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

export const cacheGet = async (key: string): Promise<any> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 3600
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error(`Redis SET error for key ${key}:`, error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}:`, error);
  }
};

export const cacheFlush = async (): Promise<void> => {
  try {
    await redisClient.flushAll();
    logger.info('Redis cache flushed');
  } catch (error) {
    logger.error('Redis FLUSH error:', error);
  }
};
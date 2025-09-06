import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

export const connectDatabase = async (): Promise<void> => {
  try {
    prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });

    await prisma.$connect();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
};

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return prisma;
};

export { prisma };
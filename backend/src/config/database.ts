import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  return prisma;
};

export const closePrismaClient = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await closePrismaClient();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePrismaClient();
  process.exit(0);
});
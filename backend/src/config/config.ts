import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Epic Fitness <noreply@epicfitness.com>'),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/gif'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Session
  SESSION_SECRET: z.string(),

  // AWS S3 (Optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  // Server
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  databaseUrl: env.DATABASE_URL,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  // Redis
  redisUrl: env.REDIS_URL,

  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.EMAIL_FROM,
  },

  // Frontend
  frontendUrl: env.FRONTEND_URL,

  // File Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedImageTypes: env.ALLOWED_IMAGE_TYPES.split(','),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // Session
  sessionSecret: env.SESSION_SECRET,

  // AWS S3
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    bucketName: env.AWS_BUCKET_NAME,
  },
} as const;

export type Config = typeof config;
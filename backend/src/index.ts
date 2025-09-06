import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'express-async-errors';

import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { connectDatabase } from './utils/database';
// import { connectRedis } from './utils/redis'; // Redis removed for deployment

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import workoutRoutes from './routes/workout.routes';
import programRoutes from './routes/program.routes';
import progressRoutes from './routes/progress.routes';
import exerciseRoutes from './routes/exercise.routes';
import adminRoutes from './routes/admin.routes';
import kudosRoutes from './routes/kudos.routes';
import quoteRoutes from './routes/quote.routes';
import scheduleRoutes from './routes/schedule.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression());

// CORS configuration for production
const corsOrigins = config.isProduction 
  ? ['https://epicfitness.pages.dev', 'https://epicfitness.netlify.app', config.frontendUrl]
  : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Session for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport only if social auth is configured
if (process.env.INSTAGRAM_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID) {
  app.use(passport.initialize());
  app.use(passport.session());
}

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: config.apiVersion 
  });
});

// API Routes
const apiPrefix = `/api/${config.apiVersion}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/workouts`, workoutRoutes);
app.use(`${apiPrefix}/programs`, programRoutes);
app.use(`${apiPrefix}/progress`, progressRoutes);
app.use(`${apiPrefix}/exercises`, exerciseRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/kudos`, kudosRoutes);
app.use(`${apiPrefix}/quotes`, quoteRoutes);
app.use(`${apiPrefix}/schedules`, scheduleRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on('workout-update', (data) => {
    socket.to(data.roomId).emit('workout-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Redis removed for deployment - not needed
    // await connectRedis();
    // logger.info('Redis connected successfully');

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info(`
        🏋️‍♂️ Epic Fitness Platform Server Started!
        🚀 Server running on port ${config.port}
        🌍 Environment: ${config.nodeEnv}
        📍 API Version: ${config.apiVersion}
        🔗 API URL: http://localhost:${config.port}/api/${config.apiVersion}
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();
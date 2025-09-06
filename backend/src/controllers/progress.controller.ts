import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { getPrismaClient } from '../config/database';
import logger from '../utils/logger';

// Save workout session
export const saveWorkoutSession = [
  body('workoutId').isString().notEmpty(),
  body('duration').isInt({ min: 1 }),
  body('completedAt').isISO8601(),
  body('exercises').isArray(),
  body('exercises.*.exerciseId').isString(),
  body('exercises.*.setNumber').isInt({ min: 1 }),
  body('exercises.*.completed').isBoolean(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prisma = getPrismaClient();
      const userId = req.user?.userId;
      const { workoutId, duration, completedAt, exercises } = req.body;

      // Create progress record
      const progress = await prisma.progress.create({
        data: {
          userId: userId!,
          workoutId,
          duration,
          completedAt: new Date(completedAt),
          caloriesBurned: Math.round(duration * 5), // Simple calculation
          notes: '',
        },
      });

      // Update user stats
      const userStats = await prisma.userStats.upsert({
        where: { userId: userId! },
        update: {
          totalWorkouts: { increment: 1 },
          totalMinutes: { increment: duration },
          totalCalories: { increment: Math.round(duration * 5) },
          lastWorkoutDate: new Date(completedAt),
        },
        create: {
          userId: userId!,
          totalWorkouts: 1,
          totalMinutes: duration,
          totalCalories: Math.round(duration * 5),
          currentStreak: 1,
          longestStreak: 1,
          lastWorkoutDate: new Date(completedAt),
        },
      });

      res.status(201).json({ progress, userStats });
    } catch (error) {
      logger.error('Failed to save workout session:', error);
      res.status(500).json({ error: { message: 'Failed to save workout session' } });
    }
  },
];

// Get user progress
export const getUserProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user?.userId;
    const { limit = 10, offset = 0 } = req.query;

    const progress = await prisma.progress.findMany({
      where: { userId: userId! },
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            duration: true,
            difficulty: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.progress.count({
      where: { userId: userId! },
    });

    res.json({
      progress,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    logger.error('Failed to fetch user progress:', error);
    res.status(500).json({ error: { message: 'Failed to fetch progress' } });
  }
};

// Get progress stats
export const getProgressStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user?.userId;
    const { period = 'week' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get progress within date range
    const progress = await prisma.progress.findMany({
      where: {
        userId: userId!,
        completedAt: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Calculate stats
    const stats = {
      totalWorkouts: progress.length,
      totalMinutes: progress.reduce((acc, p) => acc + p.duration, 0),
      totalCalories: progress.reduce((acc, p) => acc + (p.caloriesBurned || 0), 0),
      averageDuration: progress.length > 0 
        ? Math.round(progress.reduce((acc, p) => acc + p.duration, 0) / progress.length)
        : 0,
      progressByDay: {} as Record<string, number>,
    };

    // Group by day
    progress.forEach((p) => {
      const date = p.completedAt.toISOString().split('T')[0];
      stats.progressByDay[date] = (stats.progressByDay[date] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch progress stats:', error);
    res.status(500).json({ error: { message: 'Failed to fetch stats' } });
  }
};

// Delete progress record
export const deleteProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user?.userId;
    const { id } = req.params;

    // Check ownership
    const progress = await prisma.progress.findFirst({
      where: {
        id,
        userId: userId!,
      },
    });

    if (!progress) {
      return res.status(404).json({ error: { message: 'Progress record not found' } });
    }

    await prisma.progress.delete({
      where: { id },
    });

    res.json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete progress:', error);
    res.status(500).json({ error: { message: 'Failed to delete progress' } });
  }
};
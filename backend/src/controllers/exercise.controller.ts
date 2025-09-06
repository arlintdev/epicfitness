import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { getPrismaClient } from '../config/database';
import logger from '../utils/logger';

// Get all exercises
export const getExercises = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const { muscleGroup, equipment, search } = req.query;

    const where: any = {};

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(exercises);
  } catch (error) {
    logger.error('Failed to fetch exercises:', error);
    res.status(500).json({ error: { message: 'Failed to fetch exercises' } });
  }
};

// Get exercise by ID
export const getExerciseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: { message: 'Exercise not found' } });
    }

    res.json(exercise);
  } catch (error) {
    logger.error('Failed to fetch exercise:', error);
    res.status(500).json({ error: { message: 'Failed to fetch exercise' } });
  }
};

// Create exercise (admin only)
export const createExercise = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').trim().isLength({ min: 10 }),
  body('muscleGroup').isIn(['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS', 'GLUTES', 'FULL_BODY']),
  body('equipment').optional().isString(),
  body('instructions').optional().isArray(),
  body('tips').optional().isArray(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prisma = getPrismaClient();
      const userId = req.user?.userId;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: { message: 'Admin access required' } });
      }

      const { name, description, muscleGroup, equipment, instructions, tips } = req.body;

      const exercise = await prisma.exercise.create({
        data: {
          name,
          description,
          muscleGroup,
          equipment,
          instructions,
          tips,
        },
      });

      res.status(201).json(exercise);
    } catch (error) {
      logger.error('Failed to create exercise:', error);
      res.status(500).json({ error: { message: 'Failed to create exercise' } });
    }
  },
];

// Update exercise (admin only)
export const updateExercise = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('muscleGroup').optional().isIn(['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS', 'GLUTES', 'FULL_BODY']),
  body('equipment').optional().isString(),
  body('instructions').optional().isArray(),
  body('tips').optional().isArray(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prisma = getPrismaClient();
      const { id } = req.params;
      const userId = req.user?.userId;

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: { message: 'Admin access required' } });
      }

      const exercise = await prisma.exercise.update({
        where: { id },
        data: req.body,
      });

      res.json(exercise);
    } catch (error) {
      logger.error('Failed to update exercise:', error);
      res.status(500).json({ error: { message: 'Failed to update exercise' } });
    }
  },
];

// Delete exercise (admin only)
export const deleteExercise = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;
    const userId = req.user?.userId;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }

    await prisma.exercise.delete({
      where: { id },
    });

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete exercise:', error);
    res.status(500).json({ error: { message: 'Failed to delete exercise' } });
  }
};
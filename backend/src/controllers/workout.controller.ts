import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { WorkoutService } from '../services/workout.service';
import { Difficulty, MuscleGroup } from '@prisma/client';

const workoutService = new WorkoutService();

export const validateCreateWorkout = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('image').optional(),
  body('instructions').optional().isString(),
  body('videoUrl').optional().isURL(),
  body('difficulty').isIn(Object.values(Difficulty)).withMessage('Invalid difficulty level'),
  body('duration').isInt({ min: 1, max: 300 }).withMessage('Duration must be between 1 and 300 minutes'),
  body('category').optional().isString(),
  body('caloriesBurn').optional().isInt({ min: 1 }),
  body('equipment').isArray().withMessage('Equipment must be an array'),
  body('targetMuscles').isArray().withMessage('Target muscles must be an array')
    .custom((value) => {
      return value.every((muscle: string) => Object.values(MuscleGroup).includes(muscle as MuscleGroup));
    }).withMessage('Invalid muscle group'),
  body('exercises').isArray().notEmpty().withMessage('At least one exercise is required'),
  body('exercises.*.exerciseId').notEmpty().withMessage('Exercise ID is required'),
  body('exercises.*.order').isInt({ min: 1 }).withMessage('Exercise order must be at least 1'),
  body('exercises.*.sets').optional().isInt({ min: 1 }),
  body('exercises.*.reps').optional().isString(),
  body('exercises.*.duration').optional().isInt({ min: 1 }),
  body('exercises.*.restTime').optional().isInt({ min: 0 }),
  body('exercises.*.notes').optional().isString(),
];

export const validateUpdateWorkout = [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('image').optional().isBase64(),
  body('videoUrl').optional().isURL(),
  body('difficulty').optional().isIn(Object.values(Difficulty)),
  body('duration').optional().isInt({ min: 1, max: 300 }),
  body('caloriesBurn').optional().isInt({ min: 1 }),
  body('equipment').optional().isArray(),
  body('targetMuscles').optional().isArray().custom((value) => {
    return value.every((muscle: string) => Object.values(MuscleGroup).includes(muscle as MuscleGroup));
  }),
];

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    const firstError = errors.array()[0];
    const message = `${firstError.path}: ${firstError.msg}`;
    return next(new AppError(message, 400));
  }
  next();
};

export const createWorkout = [
  ...validateCreateWorkout,
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const workout = await workoutService.createWorkout(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: workout,
        message: 'Workout created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const getWorkouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Support both category and search params from frontend
    const category = req.query.category as string;
    const muscleGroup = req.query.muscleGroup;
    
    const filters = {
      difficulty: req.query.difficulty as Difficulty,
      targetMuscles: muscleGroup ? 
        (Array.isArray(muscleGroup) ? muscleGroup as string[] : [muscleGroup as string]) : 
        (req.query.targetMuscles ? (req.query.targetMuscles as string).split(',') : undefined),
      equipment: req.query.equipment ? (req.query.equipment as string).split(',') : undefined,
      minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
      maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
      search: req.query.search as string,
      featured: req.query.featured === 'true',
      creatorId: req.query.creatorId as string,
      category: category !== 'All' ? category : undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 100, 1000), // Default 100, max 1000
    };

    const sort = {
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
    };

    const result = await workoutService.getWorkouts(filters, pagination, sort);

    // Return array directly for simpler frontend integration
    res.json(result.workouts);
  } catch (error) {
    next(error);
  }
};

export const getWorkoutById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Get userId from optionalAuth middleware if user is logged in
    const userId = (req as any).user?.id;
    const workout = await workoutService.getWorkoutById(id, userId);

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    // Get userId from optionalAuth middleware if user is logged in
    const userId = (req as any).user?.id;
    const workout = await workoutService.getWorkoutBySlug(slug, userId);

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = [
  ...validateUpdateWorkout,
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const workout = await workoutService.updateWorkout(id, req.user.id, req.body);

      res.json({
        success: true,
        data: workout,
        message: 'Workout updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    await workoutService.deleteWorkout(id, req.user.id, req.user.role);

    res.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const favoriteWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    await workoutService.favoriteWorkout(id, req.user.id);

    res.json({
      success: true,
      message: 'Workout added to favorites',
    });
  } catch (error) {
    next(error);
  }
};

export const unfavoriteWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    await workoutService.unfavoriteWorkout(id, req.user.id);

    res.json({
      success: true,
      message: 'Workout removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const workouts = await workoutService.getFavoriteWorkouts(req.user.id);

    res.json({
      success: true,
      data: workouts,
    });
  } catch (error) {
    next(error);
  }
};

export const rateWorkout = [
  body('rating').isInt({ min: 1, max: 5 }),
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const { rating } = req.body;

      await workoutService.rateWorkout(id, req.user.id, rating);

      res.json({
        success: true,
        message: 'Rating submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const startWorkoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const session = await workoutService.startWorkoutSession(id, req.user.id);

    res.json({
      success: true,
      data: session,
      message: 'Workout session started',
    });
  } catch (error) {
    next(error);
  }
};

export const completeWorkoutSession = [
  body('duration').isInt({ min: 1 }),
  body('caloriesBurned').optional().isInt({ min: 0 }),
  body('notes').optional().isString(),
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { sessionId } = req.params;
      const session = await workoutService.completeWorkoutSession(sessionId, req.user.id, req.body);

      res.json({
        success: true,
        data: session,
        message: 'Workout session completed',
      });
    } catch (error) {
      next(error);
    }
  },
];
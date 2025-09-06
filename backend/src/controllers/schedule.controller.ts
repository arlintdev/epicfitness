import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleStatus } from '@prisma/client';

const scheduleService = new ScheduleService();

// Validation middleware
export const validateCreateSchedule = [
  body('workoutId').notEmpty().withMessage('Workout ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('duration').optional().isInt({ min: 1, max: 300 }).withMessage('Duration must be between 1 and 300 minutes'),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('reminderEnabled').optional().isBoolean(),
  body('reminderTime').optional().isInt({ min: 5, max: 1440 }), // 5 minutes to 24 hours
  body('isRecurring').optional().isBoolean(),
  body('recurrenceRule').optional().isString(),
  body('recurrenceEnd').optional().isISO8601(),
];

export const validateUpdateSchedule = [
  param('id').notEmpty(),
  body('scheduledDate').optional().isISO8601(),
  body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('reminderEnabled').optional().isBoolean(),
  body('reminderTime').optional().isInt({ min: 5, max: 1440 }),
  body('status').optional().isIn(Object.values(ScheduleStatus)),
];

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const message = `${firstError.path}: ${firstError.msg}`;
    return next(new AppError(message, 400));
  }
  next();
};

// Create a new scheduled workout
export const createSchedule = [
  ...validateCreateSchedule,
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const scheduleData = {
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate),
        recurrenceEnd: req.body.recurrenceEnd ? new Date(req.body.recurrenceEnd) : undefined,
      };

      const schedule = await scheduleService.createSchedule(req.user.id, scheduleData);

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Workout scheduled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
];

// Get user's scheduled workouts
export const getSchedules = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const filters = {
      userId: req.user.id,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      status: req.query.status as ScheduleStatus,
      workoutId: req.query.workoutId as string,
    };

    const schedules = await scheduleService.getSchedules(filters);

    res.json({
      success: true,
      data: schedules,
      count: schedules.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get specific scheduled workout
export const getScheduleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const schedule = await scheduleService.getScheduleById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Update scheduled workout
export const updateSchedule = [
  ...validateUpdateSchedule,
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const updateData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
      };

      const schedule = await scheduleService.updateSchedule(
        req.params.id,
        req.user.id,
        updateData
      );

      res.json({
        success: true,
        data: schedule,
        message: 'Schedule updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
];

// Cancel scheduled workout
export const cancelSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const schedule = await scheduleService.cancelSchedule(req.params.id, req.user.id);

    res.json({
      success: true,
      data: schedule,
      message: 'Workout cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Start scheduled workout (create session)
export const startScheduledWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const session = await scheduleService.startScheduledWorkout(req.params.id, req.user.id);

    res.json({
      success: true,
      data: session,
      message: 'Workout started successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get calendar view data
export const getCalendarView = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
      throw new AppError('Invalid month value', 400);
    }

    const calendarData = await scheduleService.getCalendarView(req.user.id, year, month);

    res.json({
      success: true,
      data: calendarData,
      year,
      month,
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming scheduled workouts for dashboard
export const getUpcomingScheduled = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const schedules = await scheduleService.getSchedules({
      userId: req.user.id,
      startDate: today,
      endDate: nextWeek,
      status: ScheduleStatus.SCHEDULED,
    });

    res.json({
      success: true,
      data: schedules.slice(0, 5), // Return max 5 upcoming
    });
  } catch (error) {
    next(error);
  }
};
import { WorkoutSchedule, ScheduleStatus, Prisma } from '@prisma/client';
import { getPrismaClient } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns';

interface CreateScheduleData {
  workoutId: string;
  scheduledDate: Date;
  scheduledTime?: string;
  duration: number;
  notes?: string;
  reminderEnabled?: boolean;
  reminderTime?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  recurrenceEnd?: Date;
}

interface UpdateScheduleData {
  scheduledDate?: Date;
  scheduledTime?: string;
  notes?: string;
  reminderEnabled?: boolean;
  reminderTime?: number;
  status?: ScheduleStatus;
}

interface ScheduleFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  status?: ScheduleStatus;
  workoutId?: string;
}

export class ScheduleService {
  private get prisma() {
    return getPrismaClient();
  }

  async createSchedule(userId: string, data: CreateScheduleData): Promise<WorkoutSchedule> {
    // Check if workout exists
    const workout = await this.prisma.workout.findUnique({
      where: { id: data.workoutId }
    });

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    // Check for scheduling conflicts
    const conflictingSchedule = await this.checkScheduleConflict(
      userId,
      data.scheduledDate,
      data.duration
    );

    if (conflictingSchedule) {
      throw new AppError('Schedule conflict: Another workout is already scheduled at this time', 409);
    }

    // Create the schedule
    const schedule = await this.prisma.workoutSchedule.create({
      data: {
        userId,
        workoutId: data.workoutId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: data.duration || workout.duration,
        notes: data.notes,
        reminderEnabled: data.reminderEnabled ?? true,
        reminderTime: data.reminderTime ?? 30,
        isRecurring: data.isRecurring ?? false,
        recurrenceRule: data.recurrenceRule,
        recurrenceEnd: data.recurrenceEnd,
      },
      include: {
        workout: {
          select: {
            title: true,
            difficulty: true,
            targetMuscles: true,
            equipment: true,
          }
        }
      }
    });

    // If recurring, create recurring instances
    if (data.isRecurring && data.recurrenceRule) {
      await this.createRecurringInstances(schedule);
    }

    logger.info(`Schedule created: ${schedule.id} for user ${userId}`);
    return schedule;
  }

  async getSchedules(filters: ScheduleFilters) {
    const where: Prisma.WorkoutScheduleWhereInput = {
      userId: filters.userId,
    };

    if (filters.startDate && filters.endDate) {
      where.scheduledDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.workoutId) {
      where.workoutId = filters.workoutId;
    }

    const schedules = await this.prisma.workoutSchedule.findMany({
      where,
      orderBy: {
        scheduledDate: 'asc',
      },
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            duration: true,
            targetMuscles: true,
            equipment: true,
            caloriesBurn: true,
          }
        },
        sessions: {
          select: {
            id: true,
            completed: true,
            duration: true,
          }
        }
      }
    });

    return schedules;
  }

  async getScheduleById(scheduleId: string, userId: string) {
    const schedule = await this.prisma.workoutSchedule.findFirst({
      where: {
        id: scheduleId,
        userId,
      },
      include: {
        workout: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: 'asc',
              }
            }
          }
        },
        sessions: true,
      }
    });

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    return schedule;
  }

  async updateSchedule(scheduleId: string, userId: string, data: UpdateScheduleData) {
    // Check if schedule exists and belongs to user
    const existing = await this.getScheduleById(scheduleId, userId);

    // If rescheduling, check for conflicts
    if (data.scheduledDate) {
      const conflictingSchedule = await this.checkScheduleConflict(
        userId,
        data.scheduledDate,
        existing.duration,
        scheduleId
      );

      if (conflictingSchedule) {
        throw new AppError('Schedule conflict: Another workout is already scheduled at this time', 409);
      }
    }

    const updated = await this.prisma.workoutSchedule.update({
      where: { id: scheduleId },
      data: {
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        notes: data.notes,
        reminderEnabled: data.reminderEnabled,
        reminderTime: data.reminderTime,
        status: data.status,
      },
      include: {
        workout: {
          select: {
            title: true,
            difficulty: true,
            targetMuscles: true,
          }
        }
      }
    });

    logger.info(`Schedule updated: ${scheduleId}`);
    return updated;
  }

  async cancelSchedule(scheduleId: string, userId: string) {
    await this.getScheduleById(scheduleId, userId);

    const cancelled = await this.prisma.workoutSchedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CANCELLED',
      }
    });

    logger.info(`Schedule cancelled: ${scheduleId}`);
    return cancelled;
  }

  async startScheduledWorkout(scheduleId: string, userId: string) {
    const schedule = await this.getScheduleById(scheduleId, userId);

    if (schedule.status !== 'SCHEDULED') {
      throw new AppError('This workout has already been started or completed', 400);
    }

    // Create workout session
    const session = await this.prisma.workoutSession.create({
      data: {
        userId,
        workoutId: schedule.workoutId,
        startTime: new Date(),
        scheduleId,
      }
    });

    // Update schedule status
    await this.prisma.workoutSchedule.update({
      where: { id: scheduleId },
      data: {
        status: 'IN_PROGRESS',
      }
    });

    logger.info(`Scheduled workout started: ${scheduleId}, session: ${session.id}`);
    return session;
  }

  async checkScheduleConflict(
    userId: string,
    scheduledDate: Date,
    duration: number,
    excludeScheduleId?: string
  ) {
    const startTime = new Date(scheduledDate);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const where: Prisma.WorkoutScheduleWhereInput = {
      userId,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      AND: [
        {
          scheduledDate: {
            lt: endTime,
          }
        },
        {
          scheduledDate: {
            gte: new Date(startTime.getTime() - 180 * 60 * 1000), // Check 3 hours before
          }
        }
      ]
    };

    if (excludeScheduleId) {
      where.id = { not: excludeScheduleId };
    }

    const conflicting = await this.prisma.workoutSchedule.findFirst({
      where,
      select: {
        id: true,
        scheduledDate: true,
        duration: true,
        workout: {
          select: {
            title: true,
          }
        }
      }
    });

    if (conflicting) {
      const conflictEnd = new Date(conflicting.scheduledDate.getTime() + conflicting.duration * 60 * 1000);
      
      // Check if there's actual overlap
      if (startTime < conflictEnd && endTime > conflicting.scheduledDate) {
        return conflicting;
      }
    }

    return null;
  }

  async createRecurringInstances(parentSchedule: WorkoutSchedule) {
    if (!parentSchedule.recurrenceRule || !parentSchedule.recurrenceEnd) {
      return;
    }

    const instances = [];
    let currentDate = new Date(parentSchedule.scheduledDate);
    const endDate = new Date(parentSchedule.recurrenceEnd);

    // Simple recurring logic (can be enhanced with rrule library)
    const rule = parentSchedule.recurrenceRule.toLowerCase();
    
    while (currentDate <= endDate) {
      if (rule.includes('daily')) {
        currentDate = addDays(currentDate, 1);
      } else if (rule.includes('weekly')) {
        currentDate = addWeeks(currentDate, 1);
      } else if (rule.includes('monthly')) {
        currentDate = addMonths(currentDate, 1);
      } else {
        break;
      }

      if (currentDate <= endDate) {
        instances.push({
          userId: parentSchedule.userId,
          workoutId: parentSchedule.workoutId,
          scheduledDate: new Date(currentDate),
          scheduledTime: parentSchedule.scheduledTime,
          duration: parentSchedule.duration,
          reminderEnabled: parentSchedule.reminderEnabled,
          reminderTime: parentSchedule.reminderTime,
          parentScheduleId: parentSchedule.id,
          isRecurring: false,
        });
      }

      // Limit to 52 instances to prevent infinite loops
      if (instances.length >= 52) break;
    }

    if (instances.length > 0) {
      await this.prisma.workoutSchedule.createMany({
        data: instances,
      });

      logger.info(`Created ${instances.length} recurring instances for schedule ${parentSchedule.id}`);
    }
  }

  async getCalendarView(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const schedules = await this.getSchedules({
      userId,
      startDate,
      endDate,
    });

    // Group schedules by date
    const calendarData: Record<string, any[]> = {};
    
    schedules.forEach(schedule => {
      const dateKey = schedule.scheduledDate.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push({
        id: schedule.id,
        title: schedule.workout.title,
        time: schedule.scheduledTime,
        status: schedule.status,
        difficulty: schedule.workout.difficulty,
      });
    });

    return calendarData;
  }

  async markMissedWorkouts() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const updated = await this.prisma.workoutSchedule.updateMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          lt: twoHoursAgo,
        }
      },
      data: {
        status: 'MISSED',
      }
    });

    if (updated.count > 0) {
      logger.info(`Marked ${updated.count} workouts as missed`);
    }

    return updated.count;
  }
}
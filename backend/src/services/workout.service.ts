import { Workout, Difficulty, MuscleGroup, UserRole, WorkoutSession } from '@prisma/client';
import { getPrismaClient } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
// Redis removed for deployment - caching disabled
import { logger } from '../utils/logger';

interface CreateWorkoutData {
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  difficulty: Difficulty;
  duration: number;
  caloriesBurn?: number;
  equipment: string[];
  targetMuscles: MuscleGroup[];
  exercises: {
    exerciseId: string;
    order: number;
    sets?: number;
    reps?: string;
    duration?: number;
    restTime?: number;
    notes?: string;
  }[];
  tags?: string[];
}

interface WorkoutFilters {
  difficulty?: Difficulty;
  targetMuscles?: string[];
  equipment?: string[];
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  featured?: boolean;
  creatorId?: string;
  category?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class WorkoutService {
  private get prisma() {
    return getPrismaClient();
  }

  async createWorkout(userId: string, data: CreateWorkoutData): Promise<Workout> {
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    const existingWorkout = await this.prisma.workout.findUnique({
      where: { slug },
    });

    if (existingWorkout) {
      throw new AppError('Workout with similar title already exists', 400);
    }

    // Create workout with exercises
    const workout = await this.prisma.workout.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        image: data.image,
        videoUrl: data.videoUrl,
        difficulty: data.difficulty,
        duration: data.duration,
        caloriesBurn: data.caloriesBurn,
        equipment: data.equipment,
        targetMuscles: data.targetMuscles,
        creatorId: userId,
        exercises: {
          create: data.exercises,
        },
        tags: data.tags ? {
          connectOrCreate: data.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tags: true,
        _count: {
          select: {
            ratings: true,
            favoritedBy: true,
            comments: true,
          },
        },
      },
    });

    // Invalidate cache
    // await cacheDel('workouts:list'); // Redis disabled
    
    logger.info(`Workout created: ${workout.id} by user ${userId}`);
    return workout;
  }

  async getWorkouts(
    filters: WorkoutFilters,
    pagination: PaginationOptions,
    sort: SortOptions
  ): Promise<{ workouts: any[]; total: number }> {
    const where: any = {
      isPublic: true,
    };

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.targetMuscles && filters.targetMuscles.length > 0) {
      where.targetMuscles = {
        hasSome: filters.targetMuscles as MuscleGroup[],
      };
    }

    if (filters.equipment && filters.equipment.length > 0) {
      where.equipment = {
        hasSome: filters.equipment,
      };
    }

    if (filters.minDuration || filters.maxDuration) {
      where.duration = {};
      if (filters.minDuration) where.duration.gte = filters.minDuration;
      if (filters.maxDuration) where.duration.lte = filters.maxDuration;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.featured) {
      where.featured = true;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [workouts, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: {
          [sort.sortBy]: sort.sortOrder,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              favoritedBy: true,
              comments: true,
              exercises: true,
            },
          },
        },
      }),
      this.prisma.workout.count({ where }),
    ]);

    // Calculate average rating for each workout
    const workoutsWithRating = await Promise.all(
      workouts.map(async (workout) => {
        const ratings = await this.prisma.rating.aggregate({
          where: { workoutId: workout.id },
          _avg: { rating: true },
        });

        return {
          ...workout,
          averageRating: ratings._avg.rating || 0,
        };
      })
    );

    return { workouts: workoutsWithRating, total };
  }

  async getWorkoutById(id: string, userId?: string): Promise<any> {
    const cacheKey = `workout:${id}:${userId || 'anonymous'}`;
    // const cached = await cacheGet(cacheKey);
    const cached = null; // Redis disabled
    
    if (cached) {
      return cached;
    }

    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            ratings: true,
            favoritedBy: true,
            comments: true,
            sessions: true,
          },
        },
      },
    });

    if (!workout) {
      return null;
    }

    // Get average rating
    const ratings = await this.prisma.rating.aggregate({
      where: { workoutId: id },
      _avg: { rating: true },
    });

    // Get user-specific data if userId provided
    let isFavorited = false;
    let userRating = 0;
    
    if (userId) {
      // Check if user favorited this workout
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          favoriteWorkouts: {
            where: { id },
            select: { id: true },
          },
        },
      });
      isFavorited = user?.favoriteWorkouts.length > 0;

      // Get user's rating for this workout
      const userRatingRecord = await this.prisma.rating.findUnique({
        where: {
          userId_workoutId: {
            userId,
            workoutId: id,
          },
        },
      });
      userRating = userRatingRecord?.rating || 0;
    }

    // Increment view count
    await this.prisma.workout.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const result = {
      ...workout,
      averageRating: ratings._avg.rating || 0,
      isFavorited,
      userRating,
    };

    // Cache for 1 hour
    // await cacheSet(cacheKey, result, 3600); // Redis disabled

    return result;
  }

  async getWorkoutBySlug(slug: string, userId?: string): Promise<any> {
    const workout = await this.prisma.workout.findUnique({
      where: { slug },
    });

    if (!workout) {
      return null;
    }

    return this.getWorkoutById(workout.id, userId);
  }

  async updateWorkout(id: string, userId: string, data: Partial<CreateWorkoutData>): Promise<Workout> {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    if (workout.creatorId !== userId) {
      throw new AppError('You can only edit your own workouts', 403);
    }

    const updateData: any = { ...data };
    
    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    const updatedWorkout = await this.prisma.workout.update({
      where: { id },
      data: updateData,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tags: true,
      },
    });

    // Invalidate cache
    // await cacheDel(`workout:${id}`); // Redis disabled
    // await cacheDel('workouts:list'); // Redis disabled

    logger.info(`Workout updated: ${id} by user ${userId}`);
    return updatedWorkout;
  }

  async deleteWorkout(id: string, userId: string, userRole: UserRole): Promise<void> {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    // Check permissions
    if (workout.creatorId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      throw new AppError('You can only delete your own workouts', 403);
    }

    await this.prisma.workout.delete({
      where: { id },
    });

    // Invalidate cache
    // await cacheDel(`workout:${id}`); // Redis disabled
    // await cacheDel('workouts:list'); // Redis disabled

    logger.info(`Workout deleted: ${id} by user ${userId}`);
  }

  async favoriteWorkout(workoutId: string, userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        favoriteWorkouts: {
          connect: { id: workoutId },
        },
      },
    });

    // Invalidate caches
    // await cacheDel(`user:favorites:${userId}`); // Redis disabled
    // await cacheDel(`workout:${workoutId}:${userId}`); // Redis disabled
  }

  async unfavoriteWorkout(workoutId: string, userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        favoriteWorkouts: {
          disconnect: { id: workoutId },
        },
      },
    });

    // Invalidate caches
    // await cacheDel(`user:favorites:${userId}`); // Redis disabled
    // await cacheDel(`workout:${workoutId}:${userId}`); // Redis disabled
  }

  async getFavoriteWorkouts(userId: string): Promise<Workout[]> {
    const cacheKey = `user:favorites:${userId}`;
    // const cached = await cacheGet(cacheKey);
    const cached = null; // Redis disabled
    
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteWorkouts: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                ratings: true,
                favoritedBy: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // await cacheSet(cacheKey, user.favoriteWorkouts, 3600); // Redis disabled
    return user.favoriteWorkouts;
  }

  async rateWorkout(workoutId: string, userId: string, rating: number): Promise<void> {
    if (rating === 0) {
      // Delete rating if rating is 0
      await this.prisma.rating.delete({
        where: {
          userId_workoutId: {
            userId,
            workoutId,
          },
        },
      }).catch(() => {
        // Ignore error if rating doesn't exist
      });
    } else {
      await this.prisma.rating.upsert({
        where: {
          userId_workoutId: {
            userId,
            workoutId,
          },
        },
        create: {
          userId,
          workoutId,
          rating,
        },
        update: {
          rating,
        },
      });
    }

    // Invalidate workout cache
    // await cacheDel(`workout:${workoutId}:${userId}`); // Redis disabled
    // await cacheDel(`workout:${workoutId}:anonymous`); // Redis disabled
  }

  async startWorkoutSession(workoutId: string, userId: string): Promise<WorkoutSession> {
    const session = await this.prisma.workoutSession.create({
      data: {
        userId,
        workoutId,
        startTime: new Date(),
      },
    });

    logger.info(`Workout session started: ${session.id} for workout ${workoutId} by user ${userId}`);
    return session;
  }

  async completeWorkoutSession(
    sessionId: string,
    userId: string,
    data: { duration: number; caloriesBurned?: number; notes?: string }
  ): Promise<WorkoutSession> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedSession = await this.prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        duration: data.duration,
        caloriesBurned: data.caloriesBurned,
        notes: data.notes,
        completed: true,
      },
    });

    logger.info(`Workout session completed: ${sessionId} by user ${userId}`);
    return updatedSession;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = req.user.id;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Get total workout sessions
    const totalWorkouts = await prisma.workoutSession.count({
      where: {
        userId,
        completed: true
      }
    });

    // Get workouts this week
    const weeklyCompleted = await prisma.workoutSession.count({
      where: {
        userId,
        completed: true,
        startTime: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    // Get total time and calories
    const sessionAggregates = await prisma.workoutSession.aggregate({
      where: {
        userId,
        completed: true
      },
      _sum: {
        duration: true,
        caloriesBurned: true
      }
    });

    // Calculate current streak
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        completed: true
      },
      orderBy: {
        startTime: 'desc'
      },
      select: {
        startTime: true
      }
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const session of sessions) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
        lastDate = sessionDate;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = sessionDate;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Check if streak is current (last workout was today or yesterday)
    if (sessions.length > 0) {
      const lastWorkout = new Date(sessions[0].startTime);
      lastWorkout.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastWorkout <= 1) {
        currentStreak = tempStreak;
      }
    }

    // Get personal records count
    const personalRecords = await prisma.progress.count({
      where: {
        userId,
        personalRecord: true
      }
    });

    // Get this month's workout count
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyWorkouts = await prisma.workoutSession.count({
      where: {
        userId,
        completed: true,
        startTime: {
          gte: monthStart
        }
      }
    });

    // Get user's weekly goal (default to 5 if not set)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const weeklyGoal = (user?.preferences as any)?.weeklyGoal || 5;

    res.json({
      success: true,
      data: {
        totalWorkouts,
        weeklyGoal,
        weeklyCompleted,
        currentStreak,
        longestStreak,
        totalMinutes: sessionAggregates._sum.duration || 0,
        caloriesBurned: sessionAggregates._sum.caloriesBurned || 0,
        personalRecords,
        monthlyWorkouts
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const limit = parseInt(req.query.limit as string) || 5;

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId: req.user.id,
        completed: true
      },
      orderBy: {
        startTime: 'desc'
      },
      take: limit,
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            targetMuscles: true,
            difficulty: true
          }
        }
      }
    });

    const recentWorkouts = sessions.map(session => ({
      id: session.id,
      workoutId: session.workoutId,
      name: session.workout.title,
      date: session.startTime,
      duration: session.duration || 0,
      caloriesBurned: session.caloriesBurned || 0,
      muscleGroups: session.workout.targetMuscles,
      difficulty: session.workout.difficulty
    }));

    res.json({
      success: true,
      data: recentWorkouts
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Get user's active program enrollments
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        userId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        program: {
          include: {
            workouts: {
              orderBy: [
                { week: 'asc' },
                { day: 'asc' },
                { order: 'asc' }
              ],
              include: {
                workout: true
              }
            }
          }
        }
      }
    });

    const upcomingWorkouts = [];
    const now = new Date();

    for (const enrollment of enrollments) {
      const programStartDate = new Date(enrollment.startDate);
      const currentWeek = Math.floor((now.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;

      const nextWorkouts = enrollment.program.workouts
        .filter(pw => pw.week >= currentWeek)
        .slice(0, 3)
        .map(pw => {
          const scheduledDate = new Date(programStartDate);
          scheduledDate.setDate(scheduledDate.getDate() + (pw.week - 1) * 7 + pw.day - 1);

          return {
            id: pw.workout.id,
            name: pw.workout.title,
            scheduledDate,
            duration: pw.workout.duration,
            difficulty: pw.workout.difficulty,
            programName: enrollment.program.title
          };
        });

      upcomingWorkouts.push(...nextWorkouts);
    }

    // Sort by scheduled date and take the first few
    upcomingWorkouts.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

    res.json({
      success: true,
      data: upcomingWorkouts.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAchievements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        achievement: true
      }
    });

    // Get all achievements to show progress
    const allAchievements = await prisma.achievement.findMany();

    // Calculate progress for unearned achievements
    const achievementsWithProgress = await Promise.all(
      allAchievements.map(async (achievement) => {
        const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
        let progress = isUnlocked ? 100 : 0;

        if (!isUnlocked) {
          // Calculate progress based on achievement requirements
          const requirement = achievement.requirement as any;
          
          if (achievement.category === 'STREAK' && requirement.streakDays) {
            // Get current streak from stats
            const stats = await getUserStatsHelper(req.user!.id);
            progress = Math.min(100, (stats.currentStreak / requirement.streakDays) * 100);
          } else if (achievement.category === 'MILESTONE' && requirement.workoutCount) {
            const totalWorkouts = await prisma.workoutSession.count({
              where: {
                userId: req.user!.id,
                completed: true
              }
            });
            progress = Math.min(100, (totalWorkouts / requirement.workoutCount) * 100);
          }
        }

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          unlocked: isUnlocked,
          progress: Math.floor(progress),
          earnedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.earnedAt
        };
      })
    );

    res.json({
      success: true,
      data: achievementsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get user stats
const getUserStatsHelper = async (userId: string) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const totalWorkouts = await prisma.workoutSession.count({
    where: { userId, completed: true }
  });

  const weeklyCompleted = await prisma.workoutSession.count({
    where: {
      userId,
      completed: true,
      startTime: { gte: weekStart, lte: weekEnd }
    }
  });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, completed: true },
    orderBy: { startTime: 'desc' },
    select: { startTime: true }
  });

  let currentStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const session of sessions) {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      tempStreak = 1;
      lastDate = sessionDate;
    } else {
      const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        break;
      }
      lastDate = sessionDate;
    }
  }

  if (sessions.length > 0) {
    const lastWorkout = new Date(sessions[0].startTime);
    lastWorkout.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout <= 1) {
      currentStreak = tempStreak;
    }
  }

  return {
    totalWorkouts,
    weeklyCompleted,
    currentStreak
  };
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { firstName, lastName, bio, dateOfBirth, gender, height, weight, fitnessLevel, goals, preferences } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        height,
        weight,
        fitnessLevel,
        goals,
        preferences
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        fitnessLevel: true,
        goals: true,
        preferences: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id || req.user?.id;

    if (!userId) {
      throw new AppError('User ID required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        fitnessLevel: true,
        goals: true,
        createdAt: true,
        _count: {
          select: {
            workoutSessions: {
              where: { completed: true }
            },
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...user,
        totalWorkouts: user._count.workoutSessions,
        followers: user._count.followers,
        following: user._count.following
      }
    });
  } catch (error) {
    next(error);
  }
};
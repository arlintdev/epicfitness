import { Request, Response } from 'express';
import { getPrismaClient } from '../config/database';

const prisma = getPrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalExercises,
      totalPrograms,
      recentSessions,
      popularWorkouts,
      userGrowth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (logged in last 7 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total workouts
      prisma.workout.count(),
      
      // Total exercises
      prisma.exercise.count(),
      
      // Total programs
      prisma.program.count(),
      
      // Recent workout sessions
      prisma.workoutSession.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          workout: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      
      // Most popular workouts - get all and sort in memory
      prisma.workout.findMany({
        where: { isPublished: true },
        include: {
          _count: {
            select: {
              workoutSessions: true,
              favoritedBy: true
            }
          }
        }
      }).then(workouts => 
        workouts
          .sort((a, b) => (b._count.workoutSessions + b._count.favoritedBy) - (a._count.workoutSessions + a._count.favoritedBy))
          .slice(0, 5)
      ),
      
      // User growth (last 30 days)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: true
      })
    ]);

    // Calculate growth metrics
    const thisWeekUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const lastWeekUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const userGrowthPercentage = lastWeekUsers > 0 
      ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers * 100).toFixed(1)
      : '0';

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalWorkouts,
        totalExercises,
        totalPrograms,
        userGrowthPercentage
      },
      recentSessions,
      popularWorkouts,
      userGrowth
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = String(role);
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              workoutSessions: true,
              createdWorkouts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'TRAINER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting super admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getAllWorkouts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', featured } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          creator: {
            select: {
              id: true,
              username: true
            }
          },
          _count: {
            select: {
              workoutSessions: true,
              favoritedBy: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workout.count({ where })
    ]);

    res.json({
      workouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};

export const toggleWorkoutFeatured = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data: { isFeatured: !workout.isFeatured }
    });

    res.json(updatedWorkout);
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};

export const toggleWorkoutPublished = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data: { isPublished: !workout.isPublished }
    });

    res.json(updatedWorkout);
  } catch (error) {
    console.error('Toggle published error:', error);
    res.status(500).json({ error: 'Failed to toggle published status' });
  }
};

export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;

    await prisma.workout.delete({
      where: { id: workoutId }
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: 'healthy',
      database: 'connected',
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      uptime: `${Math.floor(uptime / 60)} minutes`,
      nodeVersion: process.version,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
};
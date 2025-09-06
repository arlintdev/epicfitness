import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProgramService {
  async getAllPrograms(userId?: string) {
    const programs = await prisma.program.findMany({
      where: {
        isPublic: true,
      },
      include: {
        workouts: {
          include: {
            workout: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                duration: true,
              },
            },
          },
          orderBy: {
            weekNumber: 'asc',
            dayNumber: 'asc',
          },
        },
        enrollments: userId ? {
          where: {
            userId,
          },
        } : false,
        _count: {
          select: {
            enrollments: true,
            workouts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return programs;
  }

  async getUserPrograms(userId: string) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        userId,
      },
      include: {
        program: {
          include: {
            workouts: {
              include: {
                workout: {
                  select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    duration: true,
                  },
                },
              },
              orderBy: [
                { week: 'asc' },
                { day: 'asc' },
                { order: 'asc' },
              ],
            },
            _count: {
              select: {
                workouts: true,
              },
            },
          },
        },
      },
    });

    // Calculate progress for each enrollment
    const programsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedWorkouts = await prisma.workoutSession.count({
          where: {
            userId,
            workoutId: {
              in: enrollment.program.workouts.map(pw => pw.workoutId),
            },
            completedAt: {
              gte: enrollment.startDate,
            },
          },
        });

        const totalWorkouts = enrollment.program._count.workouts;
        const progressPercentage = totalWorkouts > 0 
          ? Math.round((completedWorkouts / totalWorkouts) * 100)
          : 0;

        return {
          ...enrollment,
          completedWorkouts,
          totalWorkouts,
          progressPercentage,
          currentWeek: this.calculateCurrentWeek(enrollment.startDate),
        };
      })
    );

    return programsWithProgress;
  }

  async enrollInProgram(userId: string, programId: string) {
    // Check if already enrolled
    const existingEnrollment = await prisma.programEnrollment.findFirst({
      where: {
        userId,
        programId,
        status: 'ACTIVE',
      },
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this program');
    }

    const enrollment = await prisma.programEnrollment.create({
      data: {
        userId,
        programId,
        startDate: new Date(),
        status: 'ACTIVE',
      },
      include: {
        program: true,
      },
    });

    return enrollment;
  }

  async unenrollFromProgram(userId: string, programId: string) {
    const enrollment = await prisma.programEnrollment.updateMany({
      where: {
        userId,
        programId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    return enrollment;
  }

  async getProgramProgress(userId: string, programId: string) {
    const enrollment = await prisma.programEnrollment.findFirst({
      where: {
        userId,
        programId,
        status: 'ACTIVE',
      },
      include: {
        program: {
          include: {
            workouts: {
              include: {
                workout: true,
              },
              orderBy: [
                { week: 'asc' },
                { day: 'asc' },
                { order: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this program');
    }

    // Get completed workouts for this program
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        workoutId: {
          in: enrollment.program.workouts.map(pw => pw.workoutId),
        },
        completedAt: {
          gte: enrollment.startDate,
        },
      },
      select: {
        workoutId: true,
        completedAt: true,
      },
    });

    const completedWorkoutIds = new Set(completedSessions.map(s => s.workoutId));

    // Map workouts with completion status
    const workoutsWithStatus = enrollment.program.workouts.map(pw => ({
      ...pw,
      completed: completedWorkoutIds.has(pw.workoutId),
      completedAt: completedSessions.find(s => s.workoutId === pw.workoutId)?.completedAt,
    }));

    const totalWorkouts = enrollment.program.workouts.length;
    const completedWorkouts = completedWorkoutIds.size;
    const progressPercentage = totalWorkouts > 0 
      ? Math.round((completedWorkouts / totalWorkouts) * 100)
      : 0;

    return {
      enrollment,
      workouts: workoutsWithStatus,
      completedWorkouts,
      totalWorkouts,
      progressPercentage,
      currentWeek: this.calculateCurrentWeek(enrollment.startDate),
    };
  }

  private calculateCurrentWeek(startDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  async createProgram(creatorId: string, data: any) {
    const program = await prisma.program.create({
      data: {
        ...data,
        creatorId,
        workouts: {
          create: data.workouts,
        },
      },
      include: {
        workouts: {
          include: {
            workout: true,
          },
        },
      },
    });

    return program;
  }
}

export default new ProgramService();
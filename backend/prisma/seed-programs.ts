import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPrograms() {
  try {
    // Get some workouts to use in programs
    const workouts = await prisma.workout.findMany({
      take: 50,
    });

    if (workouts.length === 0) {
      console.log('No workouts found. Please seed workouts first.');
      return;
    }

    // Get a user to be the creator (we'll use the first admin or create one)
    let creator = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!creator) {
      creator = await prisma.user.create({
        data: {
          email: 'admin@epicfitness.com',
          username: 'admin',
          password: 'hashed_password', // In real app, this would be hashed
          role: 'ADMIN',
        },
      });
    }

    const programs = [
      {
        title: 'Beginner Strength Foundation',
        slug: 'beginner-strength-foundation',
        description: 'Build your strength foundation with this 4-week program designed for beginners',
        difficulty: 'EASY',
        duration: 4,
        daysPerWeek: 3,
        goal: 'Build foundational strength and proper form',
        requirements: ['No equipment needed', 'Basic fitness level'],
        isPublic: true,
        featured: true,
        creatorId: creator.id,
        workouts: [
          // Week 1
          { workoutId: workouts[0].id, week: 1, day: 1, order: 1 },
          { workoutId: workouts[1].id, week: 1, day: 3, order: 1 },
          { workoutId: workouts[2].id, week: 1, day: 5, order: 1 },
          // Week 2
          { workoutId: workouts[3].id, week: 2, day: 1, order: 1 },
          { workoutId: workouts[4].id, week: 2, day: 3, order: 1 },
          { workoutId: workouts[5].id, week: 2, day: 5, order: 1 },
          // Week 3
          { workoutId: workouts[6].id, week: 3, day: 1, order: 1 },
          { workoutId: workouts[7].id, week: 3, day: 3, order: 1 },
          { workoutId: workouts[8].id, week: 3, day: 5, order: 1 },
          // Week 4
          { workoutId: workouts[9].id, week: 4, day: 1, order: 1 },
          { workoutId: workouts[10].id, week: 4, day: 3, order: 1 },
          { workoutId: workouts[11].id, week: 4, day: 5, order: 1 },
        ],
      },
      {
        title: 'Olympic Gods Training',
        slug: 'olympic-gods-training',
        description: 'Train like the gods of Olympus with this intense 8-week program',
        difficulty: 'HARD',
        duration: 8,
        daysPerWeek: 3,
        goal: 'Build god-like strength and power',
        requirements: ['Barbell', 'Dumbbells', 'Pull-up bar'],
        isPublic: true,
        featured: true,
        creatorId: creator.id,
        workouts: Array.from({ length: 24 }, (_, i) => ({
          workoutId: workouts[i % workouts.length].id,
          week: Math.floor(i / 3) + 1,
          day: (i % 3) * 2 + 1,
          order: 1,
        })),
      },
      {
        title: 'HIIT Warrior Challenge',
        slug: 'hiit-warrior-challenge',
        description: '6-week high-intensity interval training program for maximum fat burn',
        difficulty: 'MEDIUM',
        duration: 6,
        daysPerWeek: 3,
        goal: 'Maximum fat burn and cardiovascular conditioning',
        requirements: ['Bodyweight only', 'High energy'],
        isPublic: true,
        creatorId: creator.id,
        workouts: Array.from({ length: 18 }, (_, i) => ({
          workoutId: workouts[(i + 10) % workouts.length].id,
          week: Math.floor(i / 3) + 1,
          day: (i % 3) * 2 + 1,
          order: 1,
        })),
      },
      {
        title: 'Core Domination',
        slug: 'core-domination',
        description: '4-week intensive core strengthening program',
        difficulty: 'MEDIUM',
        duration: 4,
        daysPerWeek: 3,
        goal: 'Build rock-solid core strength and definition',
        requirements: ['Exercise mat', 'Medicine ball optional'],
        isPublic: true,
        creatorId: creator.id,
        workouts: Array.from({ length: 12 }, (_, i) => ({
          workoutId: workouts[(i + 20) % workouts.length].id,
          week: Math.floor(i / 3) + 1,
          day: (i % 3) * 2 + 1,
          order: 1,
        })),
      },
      {
        title: 'Titan Transformation',
        slug: 'titan-transformation',
        description: '12-week complete body transformation program',
        difficulty: 'EXTREME',
        duration: 12,
        daysPerWeek: 3,
        goal: 'Complete body transformation - strength, size, and conditioning',
        requirements: ['Full gym access', 'Advanced fitness level', 'Strong commitment'],
        isPublic: true,
        featured: true,
        creatorId: creator.id,
        workouts: Array.from({ length: 36 }, (_, i) => ({
          workoutId: workouts[i % workouts.length].id,
          week: Math.floor(i / 3) + 1,
          day: (i % 3) * 2 + 1,
          order: 1,
        })),
      },
    ];

    console.log('Creating programs...');
    
    for (const programData of programs) {
      const { workouts: programWorkouts, ...programInfo } = programData;
      
      const program = await prisma.program.create({
        data: {
          ...programInfo,
          workouts: {
            create: programWorkouts,
          },
        },
      });
      
      console.log(`Created program: ${program.title}`);
    }

    console.log('Programs seeded successfully!');
  } catch (error) {
    console.error('Error seeding programs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPrograms();
import { PrismaClient, ExerciseCategory, MuscleGroup } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@epicfitness.com' },
    update: {},
    create: {
      email: 'admin@epicfitness.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin user created');

  // Create 25+ core exercises
  const exercises = [
    // Core/Abs exercises (25+)
    {
      name: 'Plank',
      slug: 'plank',
      description: 'Core stabilization exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start in forearm position',
        'Keep body straight from head to heels',
        'Hold position',
      ],
      tips: ['Engage core', 'Breathe normally'],
      commonMistakes: ['Hips sagging', 'Head dropping'],
    },
    {
      name: 'Bicycle Crunches',
      slug: 'bicycle-crunches',
      description: 'Dynamic core exercise targeting obliques',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back with hands behind head',
        'Bring knee to opposite elbow',
        'Alternate sides in cycling motion',
      ],
      tips: ['Control the movement', 'Don\'t pull on neck'],
      commonMistakes: ['Moving too fast', 'Using momentum'],
    },
    {
      name: 'Russian Twists',
      slug: 'russian-twists',
      description: 'Rotational core exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Optional weight',
      instructions: [
        'Sit with knees bent, feet elevated',
        'Lean back to 45 degrees',
        'Rotate torso side to side',
      ],
      tips: ['Keep chest up', 'Engage core throughout'],
      commonMistakes: ['Rounding back', 'Moving arms only'],
    },
    {
      name: 'Dead Bug',
      slug: 'dead-bug',
      description: 'Core stability and coordination exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, arms up, knees at 90 degrees',
        'Lower opposite arm and leg',
        'Return and switch sides',
      ],
      tips: ['Press lower back to floor', 'Move slowly'],
      commonMistakes: ['Arching back', 'Holding breath'],
    },
    {
      name: 'Mountain Climbers',
      slug: 'mountain-climbers',
      description: 'Dynamic core and cardio exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'CARDIO' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start in plank position',
        'Drive knees alternately to chest',
        'Keep core engaged throughout',
      ],
      tips: ['Keep hips level', 'Move at steady pace'],
      commonMistakes: ['Bouncing hips', 'Losing plank position'],
    },
    {
      name: 'Leg Raises',
      slug: 'leg-raises',
      description: 'Lower abs focused exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, legs straight',
        'Raise legs to 90 degrees',
        'Lower slowly without touching floor',
      ],
      tips: ['Press lower back down', 'Control descent'],
      commonMistakes: ['Arching back', 'Using momentum'],
    },
    {
      name: 'Side Plank',
      slug: 'side-plank',
      description: 'Lateral core stabilization',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on side, prop up on forearm',
        'Lift hips to form straight line',
        'Hold position, switch sides',
      ],
      tips: ['Stack feet', 'Keep body aligned'],
      commonMistakes: ['Hips dropping', 'Rotating torso'],
    },
    {
      name: 'Bird Dog',
      slug: 'bird-dog',
      description: 'Core stability and balance exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start on hands and knees',
        'Extend opposite arm and leg',
        'Hold, return, switch sides',
      ],
      tips: ['Keep hips level', 'Move slowly'],
      commonMistakes: ['Rotating hips', 'Arching back'],
    },
    {
      name: 'Hollow Body Hold',
      slug: 'hollow-body-hold',
      description: 'Isometric core exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, press lower back down',
        'Lift shoulders and legs off ground',
        'Hold hollow position',
      ],
      tips: ['Keep lower back pressed', 'Point toes'],
      commonMistakes: ['Arching back', 'Bending knees'],
    },
    {
      name: 'Flutter Kicks',
      slug: 'flutter-kicks',
      description: 'Lower abs and hip flexor exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, hands at sides',
        'Lift legs slightly off ground',
        'Alternate small up-down kicks',
      ],
      tips: ['Keep core tight', 'Small controlled movements'],
      commonMistakes: ['Legs too high', 'Arching back'],
    },
    {
      name: 'Wood Choppers',
      slug: 'wood-choppers',
      description: 'Rotational power exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Dumbbell or cable',
      instructions: [
        'Stand with feet wide',
        'Rotate weight from high to low',
        'Engage core throughout motion',
      ],
      tips: ['Pivot back foot', 'Use core not arms'],
      commonMistakes: ['Using only arms', 'Not rotating hips'],
    },
    {
      name: 'Reverse Crunches',
      slug: 'reverse-crunches',
      description: 'Lower abs focused crunch variation',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, knees bent at 90 degrees',
        'Pull knees toward chest',
        'Lower slowly to start',
      ],
      tips: ['Use abs not momentum', 'Control movement'],
      commonMistakes: ['Swinging legs', 'Using arms to push'],
    },
    {
      name: 'Scissor Kicks',
      slug: 'scissor-kicks',
      description: 'Lower abs and hip flexor exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, legs straight up',
        'Lower one leg while other stays up',
        'Switch legs in scissor motion',
      ],
      tips: ['Keep lower back down', 'Point toes'],
      commonMistakes: ['Arching back', 'Bending knees'],
    },
    {
      name: 'V-Ups',
      slug: 'v-ups',
      description: 'Full core exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie flat on back',
        'Simultaneously raise legs and torso',
        'Touch toes at top, lower with control',
      ],
      tips: ['Keep legs straight', 'Use core not momentum'],
      commonMistakes: ['Using momentum', 'Bending knees'],
    },
    {
      name: 'Toe Touches',
      slug: 'toe-touches',
      description: 'Upper abs focused exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Lie on back, legs straight up',
        'Reach hands toward toes',
        'Lower with control',
      ],
      tips: ['Exhale on way up', 'Keep legs vertical'],
      commonMistakes: ['Using momentum', 'Pulling on neck'],
    },
    {
      name: 'Cable Crunches',
      slug: 'cable-crunches',
      description: 'Weighted abs exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Cable machine',
      instructions: [
        'Kneel facing cable machine',
        'Hold rope behind head',
        'Crunch down using abs',
      ],
      tips: ['Keep hips stationary', 'Focus on spinal flexion'],
      commonMistakes: ['Moving hips', 'Pulling with arms'],
    },
    {
      name: 'Hanging Knee Raises',
      slug: 'hanging-knee-raises',
      description: 'Lower abs exercise using pull-up bar',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Pull-up bar',
      instructions: [
        'Hang from bar',
        'Raise knees to chest',
        'Lower with control',
      ],
      tips: ['Minimize swinging', 'Engage core first'],
      commonMistakes: ['Using momentum', 'Swinging body'],
    },
    {
      name: 'Ab Wheel Rollout',
      slug: 'ab-wheel-rollout',
      description: 'Advanced core strength exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Ab wheel',
      instructions: [
        'Start on knees with wheel',
        'Roll forward extending body',
        'Pull back using core',
      ],
      tips: ['Keep core tight', 'Start with short range'],
      commonMistakes: ['Arching back', 'Going too far'],
    },
    {
      name: 'Turkish Get-Up',
      slug: 'turkish-get-up',
      description: 'Full body core stability exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Kettlebell or dumbbell',
      instructions: [
        'Lie down holding weight up',
        'Stand up keeping weight overhead',
        'Reverse movement to floor',
      ],
      tips: ['Move slowly', 'Keep eyes on weight'],
      commonMistakes: ['Rushing movement', 'Bending arm'],
    },
    {
      name: 'Pallof Press',
      slug: 'pallof-press',
      description: 'Anti-rotation core exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Cable or band',
      instructions: [
        'Stand perpendicular to cable',
        'Hold handle at chest',
        'Press out and resist rotation',
      ],
      tips: ['Keep body still', 'Resist rotation'],
      commonMistakes: ['Rotating torso', 'Using arms only'],
    },
    {
      name: 'Dragon Flag',
      slug: 'dragon-flag',
      description: 'Advanced core strength exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Bench',
      instructions: [
        'Lie on bench, grip behind head',
        'Lift body keeping only shoulders down',
        'Lower slowly maintaining straight line',
      ],
      tips: ['Keep body rigid', 'Start with bent knees'],
      commonMistakes: ['Bending at hips', 'Using momentum'],
    },
    {
      name: 'Windshield Wipers',
      slug: 'windshield-wipers',
      description: 'Advanced oblique exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Pull-up bar or floor',
      instructions: [
        'Hang or lie with legs up',
        'Rotate legs side to side',
        'Keep core engaged throughout',
      ],
      tips: ['Control movement', 'Keep legs together'],
      commonMistakes: ['Using momentum', 'Bending knees'],
    },
    {
      name: 'L-Sit',
      slug: 'l-sit',
      description: 'Isometric core and hip flexor exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Parallettes or floor',
      instructions: [
        'Sit with legs extended',
        'Place hands beside hips',
        'Lift body keeping legs horizontal',
      ],
      tips: ['Keep legs straight', 'Push shoulders down'],
      commonMistakes: ['Bending knees', 'Leaning back'],
    },
    {
      name: 'Bear Crawl',
      slug: 'bear-crawl',
      description: 'Dynamic core and full body exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start on hands and knees',
        'Lift knees slightly off ground',
        'Crawl forward maintaining position',
      ],
      tips: ['Keep back flat', 'Small steps'],
      commonMistakes: ['Hips too high', 'Rushing movement'],
    },
    {
      name: 'Suitcase Carry',
      slug: 'suitcase-carry',
      description: 'Unilateral core stability exercise',
      primaryMuscle: 'ABS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Dumbbell or kettlebell',
      instructions: [
        'Hold weight in one hand',
        'Walk maintaining upright posture',
        'Switch hands and repeat',
      ],
      tips: ['Resist leaning', 'Keep core tight'],
      commonMistakes: ['Leaning to side', 'Uneven walking'],
    },
    
    // Basic compound exercises
    {
      name: 'Push-ups',
      slug: 'push-ups',
      description: 'Bodyweight exercise for chest, shoulders, and triceps',
      primaryMuscle: 'CHEST' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start in plank position',
        'Lower body until chest nearly touches floor',
        'Push back up to starting position',
      ],
      tips: ['Keep core engaged', 'Maintain straight body line'],
      commonMistakes: ['Sagging hips', 'Flaring elbows too wide'],
    },
    {
      name: 'Squats',
      slug: 'squats',
      description: 'Fundamental lower body exercise',
      primaryMuscle: 'QUADRICEPS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower hips back and down',
        'Stand back up to starting position',
      ],
      tips: ['Keep chest up', 'Knees track over toes'],
      commonMistakes: ['Knees caving inward', 'Heels coming up'],
    },
    {
      name: 'Burpees',
      slug: 'burpees',
      description: 'Full body cardio and strength exercise',
      primaryMuscle: 'FULL_BODY' as MuscleGroup,
      category: 'CARDIO' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Start standing',
        'Drop to push-up position',
        'Perform push-up',
        'Jump feet to hands',
        'Jump up with arms overhead',
      ],
      tips: ['Move explosively', 'Maintain form throughout'],
      commonMistakes: ['Skipping the push-up', 'Not jumping high enough'],
    },
    {
      name: 'Pull-ups',
      slug: 'pull-ups',
      description: 'Upper body pulling exercise',
      primaryMuscle: 'BACK' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'Pull-up bar',
      instructions: [
        'Hang from bar with overhand grip',
        'Pull body up until chin over bar',
        'Lower with control',
      ],
      tips: ['Engage lats', 'Full range of motion'],
      commonMistakes: ['Kipping', 'Not going high enough'],
    },
    {
      name: 'Lunges',
      slug: 'lunges',
      description: 'Unilateral leg exercise',
      primaryMuscle: 'QUADRICEPS' as MuscleGroup,
      category: 'STRENGTH' as ExerciseCategory,
      equipment: 'None',
      instructions: [
        'Step forward with one leg',
        'Lower until both knees at 90 degrees',
        'Push back to start',
      ],
      tips: ['Keep torso upright', 'Front knee over ankle'],
      commonMistakes: ['Knee past toes', 'Leaning forward'],
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {},
      create: exercise,
    });
  }

  console.log(`✅ Created ${exercises.length} exercises including 25 core exercises`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
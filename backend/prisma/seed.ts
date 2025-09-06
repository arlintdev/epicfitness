import { PrismaClient } from '@prisma/client';
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

  // Create exercises
  const exercises = [
    // Chest
    {
      name: 'Barbell Bench Press',
      description: 'Classic chest exercise targeting the pectorals, shoulders, and triceps',
      muscleGroup: 'CHEST',
      category: 'FREEWEIGHT',
      equipment: 'Barbell',
      instructions: [
        'Lie flat on bench with eyes under bar',
        'Grip bar slightly wider than shoulder width',
        'Lower bar to chest with control',
        'Press bar back up to starting position',
      ],
      tips: ['Keep feet flat on floor', 'Maintain arch in lower back', 'Control the descent'],
    },
    {
      name: 'Dumbbell Flyes',
      description: 'Isolation exercise for chest development',
      muscleGroup: 'CHEST',
      category: 'FREEWEIGHT',
      equipment: 'Dumbbells',
      instructions: [
        'Lie on bench with dumbbells',
        'Start with arms extended above chest',
        'Lower weights in wide arc',
        'Bring dumbbells back together',
      ],
    },
    {
      name: 'Push-ups',
      description: 'Bodyweight exercise for chest, shoulders, and triceps',
      muscleGroup: 'CHEST',
      category: 'BODYWEIGHT',
      equipment: 'None',
      instructions: [
        'Start in plank position',
        'Lower body until chest nearly touches floor',
        'Push back up to starting position',
      ],
    },
    
    // Back
    {
      name: 'Pull-ups',
      description: 'Compound exercise for back and biceps',
      muscleGroup: 'BACK',
      category: 'BODYWEIGHT',
      equipment: 'Pull-up Bar',
      instructions: [
        'Hang from bar with overhand grip',
        'Pull body up until chin over bar',
        'Lower with control',
      ],
    },
    {
      name: 'Barbell Row',
      description: 'Compound back exercise targeting lats and rhomboids',
      muscleGroup: 'BACK',
      category: 'FREEWEIGHT',
      equipment: 'Barbell',
      instructions: [
        'Hinge at hips with barbell',
        'Row bar to lower chest',
        'Lower with control',
      ],
    },
    {
      name: 'Lat Pulldown',
      description: 'Cable exercise targeting the latissimus dorsi',
      muscleGroup: 'BACK',
      category: 'CABLE',
      equipment: 'Cable Machine',
      instructions: [
        'Sit at lat pulldown machine',
        'Pull bar down to upper chest',
        'Control the return',
      ],
    },
    
    // Shoulders
    {
      name: 'Overhead Press',
      description: 'Compound shoulder exercise',
      muscleGroup: 'SHOULDERS',
      equipment: 'Barbell',
      instructions: [
        'Stand with barbell at shoulders',
        'Press weight overhead',
        'Lower with control',
      ],
    },
    {
      name: 'Lateral Raises',
      description: 'Isolation exercise for side delts',
      muscleGroup: 'SHOULDERS',
      equipment: 'Dumbbells',
      instructions: [
        'Hold dumbbells at sides',
        'Raise arms to shoulder height',
        'Lower with control',
      ],
    },
    
    // Arms
    {
      name: 'Barbell Curl',
      description: 'Classic bicep exercise',
      muscleGroup: 'BICEPS',
      equipment: 'Barbell',
      instructions: [
        'Stand with barbell, arms extended',
        'Curl weight toward shoulders',
        'Lower with control',
      ],
    },
    {
      name: 'Tricep Dips',
      description: 'Bodyweight exercise for triceps',
      muscleGroup: 'TRICEPS',
      equipment: 'Bench',
      instructions: [
        'Support body on bench edge',
        'Lower body by bending elbows',
        'Push back up to start',
      ],
    },
    {
      name: 'Hammer Curls',
      description: 'Bicep and forearm exercise',
      muscleGroup: 'BICEPS',
      equipment: 'Dumbbells',
      instructions: [
        'Hold dumbbells with neutral grip',
        'Curl weights to shoulders',
        'Lower with control',
      ],
    },
    
    // Legs
    {
      name: 'Barbell Squat',
      description: 'The king of leg exercises',
      muscleGroup: 'QUADRICEPS',
      equipment: 'Barbell',
      instructions: [
        'Position bar on upper back',
        'Squat down until thighs parallel',
        'Drive through heels to stand',
      ],
      tips: ['Keep chest up', 'Knees track over toes', 'Maintain neutral spine'],
    },
    {
      name: 'Romanian Deadlift',
      description: 'Hamstring and glute focused exercise',
      muscleGroup: 'QUADRICEPS',
      equipment: 'Barbell',
      instructions: [
        'Hold barbell with overhand grip',
        'Push hips back while lowering bar',
        'Drive hips forward to return',
      ],
    },
    {
      name: 'Lunges',
      description: 'Unilateral leg exercise',
      muscleGroup: 'QUADRICEPS',
      equipment: 'Dumbbells',
      instructions: [
        'Step forward into lunge position',
        'Lower back knee toward ground',
        'Push through front heel to return',
      ],
    },
    {
      name: 'Leg Press',
      description: 'Machine-based leg exercise',
      muscleGroup: 'QUADRICEPS',
      equipment: 'Leg Press Machine',
      instructions: [
        'Sit in leg press machine',
        'Lower weight by bending knees',
        'Press weight back to start',
      ],
    },
    
    // Core
    {
      name: 'Plank',
      description: 'Isometric core exercise',
      muscleGroup: 'ABS',
      equipment: 'None',
      instructions: [
        'Start in push-up position on forearms',
        'Keep body straight from head to heels',
        'Hold position for time',
      ],
      tips: ['Engage core', 'Dont let hips sag', 'Breathe normally'],
    },
    {
      name: 'Russian Twists',
      description: 'Rotational core exercise',
      muscleGroup: 'ABS',
      equipment: 'Medicine Ball',
      instructions: [
        'Sit with knees bent, lean back slightly',
        'Rotate torso side to side',
        'Keep core engaged throughout',
      ],
    },
    {
      name: 'Bicycle Crunches',
      description: 'Dynamic ab exercise',
      muscleGroup: 'ABS',
      equipment: 'None',
      instructions: [
        'Lie on back, hands behind head',
        'Bring knee to opposite elbow',
        'Alternate sides in cycling motion',
      ],
    },
    {
      name: 'Dead Bug',
      description: 'Core stability exercise',
      muscleGroup: 'ABS',
      equipment: 'None',
      instructions: [
        'Lie on back, arms up, knees bent 90°',
        'Lower opposite arm and leg',
        'Return to start and switch sides',
      ],
    },
    
    // Glutes
    {
      name: 'Hip Thrust',
      description: 'Glute isolation exercise',
      muscleGroup: 'GLUTES',
      equipment: 'Barbell',
      instructions: [
        'Sit on ground with upper back on bench',
        'Roll barbell over hips',
        'Drive hips up to full extension',
        'Lower with control',
      ],
    },
    {
      name: 'Glute Bridge',
      description: 'Bodyweight glute exercise',
      muscleGroup: 'GLUTES',
      equipment: 'None',
      instructions: [
        'Lie on back with knees bent',
        'Drive hips up off ground',
        'Squeeze glutes at top',
        'Lower with control',
      ],
    },
    
    // Full Body
    {
      name: 'Burpees',
      description: 'Full body cardio and strength exercise',
      muscleGroup: 'FULL_BODY',
      equipment: 'None',
      instructions: [
        'Start standing',
        'Drop to push-up position',
        'Perform push-up',
        'Jump feet to hands',
        'Jump up with arms overhead',
      ],
    },
    {
      name: 'Mountain Climbers',
      description: 'Dynamic full body exercise',
      muscleGroup: 'FULL_BODY',
      equipment: 'None',
      instructions: [
        'Start in plank position',
        'Drive knees alternately to chest',
        'Keep core engaged',
      ],
    },
    {
      name: 'Kettlebell Swings',
      description: 'Explosive full body movement',
      muscleGroup: 'FULL_BODY',
      equipment: 'Kettlebell',
      instructions: [
        'Stand with kettlebell between feet',
        'Hinge at hips and swing weight back',
        'Drive hips forward to swing weight up',
        'Control the descent',
      ],
    },
  ];

  for (const exercise of exercises) {
    const slug = exercise.name.toLowerCase().replace(/\s+/g, '-');
    
    // Determine category based on equipment
    let category = 'STRENGTH';
    if (exercise.equipment === 'None' || exercise.equipment === 'Bodyweight') {
      category = 'BODYWEIGHT';
    } else if (exercise.equipment === 'Barbell') {
      category = 'FREEWEIGHT';
    } else if (exercise.equipment === 'Dumbbells') {
      category = 'FREEWEIGHT';
    } else if (exercise.equipment === 'Cable Machine') {
      category = 'CABLE';
    } else if (exercise.equipment?.includes('Machine')) {
      category = 'MACHINE';
    } else if (exercise.equipment === 'Kettlebell') {
      category = 'FREEWEIGHT';
    } else if (exercise.equipment === 'Medicine Ball') {
      category = 'FREEWEIGHT';
    }
    
    await prisma.exercise.upsert({
      where: { 
        slug: slug,
      },
      update: {},
      create: {
        name: exercise.name,
        slug: slug,
        description: exercise.description,
        instructions: exercise.instructions || [],
        category: category as any,
        primaryMuscle: exercise.muscleGroup as any,
        secondaryMuscles: [],
        equipment: exercise.equipment,
        tips: exercise.tips || [],
        commonMistakes: [],
      } as any,
    });
  }

  console.log(`✅ Created ${exercises.length} exercises`);

  // Create a sample workout
  const existingWorkout = await prisma.workout.findUnique({
    where: { slug: 'full-body-starter' }
  });
  
  const sampleWorkout = existingWorkout || await prisma.workout.create({
    data: {
      title: 'Full Body Starter',
      slug: 'full-body-starter',
      description: `A beginner-friendly full body workout to get you started on your fitness journey.

## Warm-up
- 5 minutes light cardio
- Dynamic stretching

## Main Workout
Complete 3 sets of each exercise with 60 seconds rest between sets.

## Cool-down
- 5 minutes walking
- Static stretching

### Tips
- Focus on proper form over weight
- Stay hydrated throughout
- Listen to your body`,
      duration: 45,
      difficulty: 'EASY',
      targetMuscles: ['CHEST', 'BACK', 'QUADRICEPS', 'ABS'],
      equipment: ['Dumbbells', 'Bench'],
      caloriesBurn: 300,
      isPublic: true,
      featured: true,
      creatorId: adminUser.id,
      exercises: {
        create: [
          {
            exerciseId: (await prisma.exercise.findFirst({ where: { name: 'Push-ups' } }))!.id,
            order: 1,
            sets: 3,
            reps: '10-15',
            restTime: 60,
          },
          {
            exerciseId: (await prisma.exercise.findFirst({ where: { name: 'Barbell Squat' } }))!.id,
            order: 2,
            sets: 3,
            reps: '12-15',
            restTime: 90,
          },
          {
            exerciseId: (await prisma.exercise.findFirst({ where: { name: 'Barbell Row' } }))!.id,
            order: 3,
            sets: 3,
            reps: '10-12',
            restTime: 60,
          },
          {
            exerciseId: (await prisma.exercise.findFirst({ where: { name: 'Plank' } }))!.id,
            order: 4,
            sets: 3,
            duration: 30,
            restTime: 45,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample workout');

  // Create achievements
  const achievements = [
    {
      name: '7-Day Streak',
      description: 'Complete workouts for 7 consecutive days',
      icon: 'fire',
      category: 'STREAK' as const,
      points: 50,
      requirement: { streakDays: 7 }
    },
    {
      name: '30-Day Streak',
      description: 'Complete workouts for 30 consecutive days',
      icon: 'fire',
      category: 'STREAK' as const,
      points: 200,
      requirement: { streakDays: 30 }
    },
    {
      name: 'Early Bird',
      description: 'Complete 10 workouts before 8 AM',
      icon: 'clock',
      category: 'SPECIAL' as const,
      points: 75,
      requirement: { earlyWorkouts: 10 }
    },
    {
      name: '100 Workouts',
      description: 'Complete 100 total workouts',
      icon: 'medal',
      category: 'MILESTONE' as const,
      points: 150,
      requirement: { workoutCount: 100 }
    },
    {
      name: 'Strength Master',
      description: 'Complete 50 strength training workouts',
      icon: 'weight',
      category: 'MILESTONE' as const,
      points: 100,
      requirement: { strengthWorkouts: 50 }
    },
    {
      name: 'First Workout',
      description: 'Complete your first workout',
      icon: 'trophy',
      category: 'MILESTONE' as const,
      points: 10,
      requirement: { workoutCount: 1 }
    },
    {
      name: 'Personal Best',
      description: 'Set 5 personal records',
      icon: 'trophy',
      category: 'PERSONAL_RECORD' as const,
      points: 80,
      requirement: { personalRecords: 5 }
    },
    {
      name: 'Social Butterfly',
      description: 'Get 10 followers',
      icon: 'users',
      category: 'SOCIAL' as const,
      points: 50,
      requirement: { followers: 10 }
    },
    {
      name: 'Weekend Warrior',
      description: 'Complete 20 weekend workouts',
      icon: 'running',
      category: 'SPECIAL' as const,
      points: 60,
      requirement: { weekendWorkouts: 20 }
    },
    {
      name: 'Dedicated',
      description: 'Complete 50 total workouts',
      icon: 'dumbbell',
      category: 'MILESTONE' as const,
      points: 75,
      requirement: { workoutCount: 50 }
    }
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name }
    });
    
    if (!existing) {
      await prisma.achievement.create({
        data: achievement
      });
    }
  }

  console.log(`✅ Created ${achievements.length} achievements`);

  // Create motivational quotes
  const motivationalQuotes = [
    // Fitness & Training Quotes
    { quote: "The only bad workout is the one that didn't happen.", author: "Unknown", category: "fitness" },
    { quote: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Rikki Rogers", category: "fitness" },
    { quote: "The body achieves what the mind believes.", author: "Napoleon Hill", category: "fitness" },
    { quote: "Sweat is just fat crying.", author: "Unknown", category: "fitness" },
    { quote: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown", category: "fitness" },
    { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger", category: "fitness" },
    { quote: "Don't stop when you're tired. Stop when you're done.", author: "Marilyn Monroe", category: "fitness" },
    { quote: "The gym is not a place to talk. It's a place to train.", author: "Unknown", category: "fitness" },
    { quote: "Champions aren't made in the gyms. Champions are made from something they have deep inside them - a desire, a dream, a vision.", author: "Muhammad Ali", category: "fitness" },
    { quote: "If it doesn't challenge you, it won't change you.", author: "Fred DeVito", category: "fitness" },
    
    // Perseverance & Determination
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "perseverance" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "perseverance" },
    { quote: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius", category: "perseverance" },
    { quote: "The difference between the impossible and the possible lies in a person's determination.", author: "Tommy Lasorda", category: "perseverance" },
    { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "perseverance" },
    { quote: "When you feel like quitting, think about why you started.", author: "Unknown", category: "perseverance" },
    { quote: "The harder the battle, the sweeter the victory.", author: "Les Brown", category: "perseverance" },
    { quote: "Obstacles don't have to stop you. If you run into a wall, don't turn around and give up.", author: "Michael Jordan", category: "perseverance" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "perseverance" },
    { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "perseverance" },
    
    // Success & Achievement
    { quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "success" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "success" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "success" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "success" },
    { quote: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett", category: "success" },
    { quote: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon", category: "success" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", category: "success" },
    { quote: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis", category: "success" },
    { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "success" },
    
    // Motivation & Inspiration
    { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
    { quote: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats", category: "motivation" },
    { quote: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "motivation" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "motivation" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown", category: "motivation" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation" },
    { quote: "Great things never come from comfort zones.", author: "Unknown", category: "motivation" },
    { quote: "Dream it. Wish it. Do it.", author: "Unknown", category: "motivation" },
    { quote: "Success doesn't just find you. You have to go out and get it.", author: "Unknown", category: "motivation" },
    { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "motivation" },
    
    // Historical Figures
    { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "wisdom" },
    { quote: "The best way to predict the future is to create it.", author: "Abraham Lincoln", category: "wisdom" },
    { quote: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll", category: "wisdom" },
    { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "wisdom" },
    { quote: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost", category: "wisdom" },
    { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "wisdom" },
    { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "wisdom" },
    { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "wisdom" },
    { quote: "You learn more from failure than from success. Don't let it stop you.", author: "Unknown", category: "wisdom" },
    { quote: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", category: "wisdom" },
    
    // Athletes & Sports Figures
    { quote: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. That's why I succeed.", author: "Michael Jordan", category: "sports" },
    { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "sports" },
    { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "sports" },
    { quote: "The more difficult the victory, the greater the happiness in winning.", author: "Pele", category: "sports" },
    { quote: "You have to expect things of yourself before you can do them.", author: "Michael Jordan", category: "sports" },
    { quote: "It's not the will to win that matters—everyone has that. It's the will to prepare to win that matters.", author: "Paul Bryant", category: "sports" },
    { quote: "The only way to prove that you're a good sport is to lose.", author: "Ernie Banks", category: "sports" },
    { quote: "Age is no barrier. It's a limitation you put on your mind.", author: "Jackie Joyner-Kersee", category: "sports" },
    { quote: "Never say never because limits, like fears, are often just an illusion.", author: "Michael Jordan", category: "sports" },
    { quote: "Today I will do what others won't, so tomorrow I can accomplish what others can't.", author: "Jerry Rice", category: "sports" },
    
    // Discipline & Consistency
    { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "discipline" },
    { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "discipline" },
    { quote: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell", category: "discipline" },
    { quote: "The successful warrior is the average man with laser-like focus.", author: "Bruce Lee", category: "discipline" },
    { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
    { quote: "The pain of discipline weighs ounces, but the pain of regret weighs tons.", author: "Jim Rohn", category: "discipline" },
    { quote: "Discipline is the soul of an army. It makes small numbers formidable.", author: "George Washington", category: "discipline" },
    { quote: "Through discipline comes freedom.", author: "Aristotle", category: "discipline" },
    { quote: "One painful duty fulfilled makes the next plainer and easier.", author: "Helen Keller", category: "discipline" },
    { quote: "Rule your mind or it will rule you.", author: "Horace", category: "discipline" },
    
    // Health & Wellness
    { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "health" },
    { quote: "Health is not valued till sickness comes.", author: "Thomas Fuller", category: "health" },
    { quote: "A healthy outside starts from the inside.", author: "Robert Urich", category: "health" },
    { quote: "Your health is an investment, not an expense.", author: "Unknown", category: "health" },
    { quote: "The groundwork for all happiness is good health.", author: "Leigh Hunt", category: "health" },
    { quote: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian", category: "health" },
    { quote: "Physical fitness is the first requisite of happiness.", author: "Joseph Pilates", category: "health" },
    { quote: "Exercise is a celebration of what your body can do, not a punishment for what you ate.", author: "Unknown", category: "health" },
    { quote: "The only way to keep your health is to eat what you don't want, drink what you don't like, and do what you'd rather not.", author: "Mark Twain", category: "health" },
    { quote: "Health is like money, we never have a true idea of its value until we lose it.", author: "Josh Billings", category: "health" },
    
    // Mind & Mental Strength
    { quote: "The mind is everything. What you think you become.", author: "Buddha", category: "mindset" },
    { quote: "Whether you think you can, or you think you can't – you're right.", author: "Henry Ford", category: "mindset" },
    { quote: "The only limits that exist are the ones you place on yourself.", author: "Unknown", category: "mindset" },
    { quote: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.", author: "Unknown", category: "mindset" },
    { quote: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson", category: "mindset" },
    { quote: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett", category: "mindset" },
    { quote: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne", category: "mindset" },
    { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "mindset" },
    { quote: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.", author: "Christian D. Larson", category: "mindset" },
    { quote: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar", category: "mindset" },
    
    // Final 10 - Mixed Inspiration
    { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "wisdom" },
    { quote: "What seems impossible today will one day become your warm-up.", author: "Unknown", category: "fitness" },
    { quote: "If you want something you've never had, you must be willing to do something you've never done.", author: "Thomas Jefferson", category: "success" },
    { quote: "Dead last finish is greater than did not finish, which trumps did not start.", author: "Unknown", category: "perseverance" },
    { quote: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt", category: "motivation" },
    { quote: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou", category: "perseverance" },
    { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", category: "motivation" },
    { quote: "Little by little, one travels far.", author: "J.R.R. Tolkien", category: "perseverance" },
    { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivation" },
    { quote: "A year from now you may wish you had started today.", author: "Karen Lamb", category: "motivation" }
  ];

  for (const quote of motivationalQuotes) {
    try {
      await prisma.motivationalQuote.create({
        data: quote
      });
    } catch (error) {
      // If quote already exists, skip it
      console.log(`Quote already exists: "${quote.quote.substring(0, 30)}..."`);
    }
  }

  console.log(`✅ Created ${motivationalQuotes.length} motivational quotes`);

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
import { PrismaClient, Difficulty, MuscleGroup } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏋️ Starting epic workouts seed...');

  // Ensure admin user exists
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@epicfitness.com' }
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@epicfitness.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true,
      }
    });
  }

  // Get all exercises for reference
  const exercises = await prisma.exercise.findMany();
  const exerciseMap = new Map(exercises.map(e => [e.name, e.id]));

  // Helper function to get exercise ID
  const getExerciseId = (name: string) => {
    const id = exerciseMap.get(name);
    if (!id) throw new Error(`Exercise not found: ${name}`);
    return id;
  };

  // Create 100 Epic Workouts
  const workouts = [
    // Upper Body Workouts (20)
    {
      title: "Thor's Thunder Chest",
      slug: "thors-thunder-chest",
      description: "Forge god-like pectorals with this legendary chest workout inspired by the Thunder God himself.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells', 'Bench'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', order: 1 },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '15-20', order: 3 },
        { name: 'Tricep Dips', sets: 3, reps: '10-12', order: 4 }
      ]
    },
    {
      title: "Hercules Back Attack",
      slug: "hercules-back-attack",
      description: "Build a heroic V-taper with this intense back workout fit for a demigod.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.BICEPS],
      equipment: ['Barbell', 'Pull-up Bar'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: '8-12', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10-12', order: 2 },
        { name: 'Lat Pulldown', sets: 3, reps: '12-15', order: 3 },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', order: 4 }
      ]
    },
    {
      title: "Atlas Shoulder Builder",
      slug: "atlas-shoulder-builder",
      description: "Carry the world on your shoulders with this titan-worthy deltoid destroyer.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.SHOULDERS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Military Press', sets: 4, reps: '8-10', order: 1 },
        { name: 'Lateral Raises', sets: 4, reps: '12-15', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '15-20', order: 3 }
      ]
    },
    {
      title: "Spartan Arms Annihilator",
      slug: "spartan-arms-annihilator",
      description: "Sculpt warrior arms with this battle-tested bicep and tricep assault.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 300,
      exercises: [
        { name: 'Barbell Curl', sets: 4, reps: '10-12', order: 1 },
        { name: 'Tricep Dips', sets: 4, reps: '10-12', order: 2 },
        { name: 'Hammer Curls', sets: 3, reps: '12-15', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15-20', order: 4 }
      ]
    },
    {
      title: "Viking Push Power",
      slug: "viking-push-power",
      description: "Unleash berserker strength with this Norse-inspired pushing workout.",
      difficulty: Difficulty.HARD,
      duration: 55,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells', 'Bench'],
      caloriesBurn: 500,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', order: 1 },
        { name: 'Military Press', sets: 4, reps: '8-10', order: 2 },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', order: 3 },
        { name: 'Lateral Raises', sets: 3, reps: '15-20', order: 4 },
        { name: 'Tricep Dips', sets: 3, reps: '12-15', order: 5 }
      ]
    },
    {
      title: "Gladiator Pull Domination",
      slug: "gladiator-pull-domination",
      description: "Conquer the arena with this champion's pulling routine.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.BICEPS],
      equipment: ['Barbell', 'Pull-up Bar'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Pull-ups', sets: 5, reps: '6-10', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '8-10', order: 2 },
        { name: 'Lat Pulldown', sets: 3, reps: '12-15', order: 3 },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', order: 4 },
        { name: 'Hammer Curls', sets: 3, reps: '12-15', order: 5 }
      ]
    },
    {
      title: "Phoenix Rising Upper",
      slug: "phoenix-rising-upper",
      description: "Rise from the ashes with this rebirth-inducing upper body inferno.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Push-ups', sets: 4, reps: '15-20', order: 1 },
        { name: 'Pull-ups', sets: 4, reps: '8-12', order: 2 },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', order: 3 },
        { name: 'Lateral Raises', sets: 3, reps: '15-20', order: 4 }
      ]
    },
    {
      title: "Titan's Chest Forge",
      slug: "titans-chest-forge",
      description: "Hammer out a chest of steel in the forge of the titans.",
      difficulty: Difficulty.EXTREME,
      duration: 60,
      targetMuscles: [MuscleGroup.CHEST],
      equipment: ['Barbell', 'Dumbbells', 'Bench'],
      caloriesBurn: 550,
      exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '5-6', order: 1 },
        { name: 'Dumbbell Flyes', sets: 4, reps: '10-12', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '20-25', order: 3 },
        { name: 'Tricep Dips', sets: 3, reps: '15-20', order: 4 }
      ]
    },
    {
      title: "Samurai Back Blade",
      slug: "samurai-back-blade",
      description: "Sharpen your back muscles with the precision of a samurai sword.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.LOWER_BACK],
      equipment: ['Barbell', 'Pull-up Bar'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: '10-12', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10-12', order: 2 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10-12', order: 3 },
        { name: 'Lat Pulldown', sets: 3, reps: '15-20', order: 4 }
      ]
    },
    {
      title: "Olympian Upper Circuit",
      slug: "olympian-upper-circuit",
      description: "Train like the gods with this mount Olympus worthy upper body circuit.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.BICEPS, MuscleGroup.TRICEPS],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '15', order: 1 },
        { name: 'Pull-ups', sets: 3, reps: '10', order: 2 },
        { name: 'Military Press', sets: 3, reps: '12', order: 3 },
        { name: 'Barbell Curl', sets: 3, reps: '12', order: 4 },
        { name: 'Tricep Dips', sets: 3, reps: '12', order: 5 }
      ]
    },
    {
      title: "Warrior's Push Day",
      slug: "warriors-push-day",
      description: "Channel your inner warrior with this battle-ready push workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '10', order: 1 },
        { name: 'Military Press', sets: 3, reps: '10', order: 2 },
        { name: 'Lateral Raises', sets: 3, reps: '15', order: 3 },
        { name: 'Tricep Dips', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Neptune's Pull Tide",
      slug: "neptunes-pull-tide",
      description: "Ride the waves of gains with this oceanic pulling powerhouse.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.BICEPS],
      equipment: ['Barbell', 'Pull-up Bar'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: '8-10', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10', order: 2 },
        { name: 'Lat Pulldown', sets: 3, reps: '12', order: 3 },
        { name: 'Barbell Curl', sets: 4, reps: '10', order: 4 },
        { name: 'Hammer Curls', sets: 3, reps: '12', order: 5 }
      ]
    },
    {
      title: "Dragon's Breath Arms",
      slug: "dragons-breath-arms",
      description: "Forge dragon-scale arms with this fiery bicep and tricep inferno.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 325,
      exercises: [
        { name: 'Barbell Curl', sets: 4, reps: '8-10', order: 1 },
        { name: 'Tricep Dips', sets: 4, reps: '10-12', order: 2 },
        { name: 'Hammer Curls', sets: 4, reps: '10-12', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Colossus Shoulder Sculptor",
      slug: "colossus-shoulder-sculptor",
      description: "Build boulder shoulders worthy of the ancient colossus.",
      difficulty: Difficulty.HARD,
      duration: 40,
      targetMuscles: [MuscleGroup.SHOULDERS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Military Press', sets: 5, reps: '6-8', order: 1 },
        { name: 'Lateral Raises', sets: 4, reps: '12-15', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '20', order: 3 }
      ]
    },
    {
      title: "Kraken's Grip",
      slug: "krakens-grip",
      description: "Develop tentacle-like pulling power with this mythical back routine.",
      difficulty: Difficulty.EXTREME,
      duration: 55,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
      equipment: ['Barbell', 'Pull-up Bar'],
      caloriesBurn: 500,
      exercises: [
        { name: 'Pull-ups', sets: 5, reps: '8-10', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 5, reps: '8-10', order: 2 },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', order: 3 },
        { name: 'Hammer Curls', sets: 4, reps: '10-12', order: 4 }
      ]
    },
    {
      title: "Apollo's Sun Chest",
      slug: "apollos-sun-chest",
      description: "Radiate strength with this divine chest illuminator.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '10-12', order: 1 },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '15-20', order: 3 },
        { name: 'Tricep Dips', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Centurion Upper Fortress",
      slug: "centurion-upper-fortress",
      description: "Build an impenetrable upper body fortress worthy of Rome's finest.",
      difficulty: Difficulty.HARD,
      duration: 60,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 550,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8', order: 1 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 2 },
        { name: 'Military Press', sets: 4, reps: '8', order: 3 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '10', order: 4 },
        { name: 'Lateral Raises', sets: 3, reps: '15', order: 5 }
      ]
    },
    {
      title: "Minotaur's Maze Push",
      slug: "minotaurs-maze-push",
      description: "Navigate the labyrinth of gains with this mythical pushing workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Push-ups', sets: 4, reps: '20', order: 1 },
        { name: 'Military Press', sets: 4, reps: '10', order: 2 },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12', order: 3 },
        { name: 'Lateral Raises', sets: 3, reps: '15', order: 4 },
        { name: 'Tricep Dips', sets: 3, reps: '15', order: 5 }
      ]
    },
    {
      title: "Valhalla Victory Arms",
      slug: "valhalla-victory-arms",
      description: "Earn your place in Valhalla with this victorious arm workout.",
      difficulty: Difficulty.HARD,
      duration: 40,
      targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS, MuscleGroup.FOREARMS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Barbell Curl', sets: 5, reps: '8', order: 1 },
        { name: 'Tricep Dips', sets: 5, reps: '10', order: 2 },
        { name: 'Hammer Curls', sets: 4, reps: '10', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Zeus Lightning Upper",
      slug: "zeus-lightning-upper",
      description: "Strike with the power of Zeus in this electrifying upper body blast.",
      difficulty: Difficulty.EXTREME,
      duration: 65,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.BICEPS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 600,
      exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '5', order: 1 },
        { name: 'Pull-ups', sets: 5, reps: '8', order: 2 },
        { name: 'Military Press', sets: 4, reps: '8', order: 3 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10', order: 4 },
        { name: 'Barbell Curl', sets: 3, reps: '10', order: 5 },
        { name: 'Tricep Dips', sets: 3, reps: '12', order: 6 }
      ]
    },

    // Lower Body Workouts (20)
    {
      title: "Thunder Thighs of Thor",
      slug: "thunder-thighs-thor",
      description: "Forge legendary leg power worthy of the god of thunder.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 500,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '8-10', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10-12', order: 2 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 3 },
        { name: 'Leg Press', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Spartan Leg Legion",
      slug: "spartan-leg-legion",
      description: "March to victory with legs forged in the fires of Sparta.",
      difficulty: Difficulty.EXTREME,
      duration: 60,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.CALVES],
      equipment: ['Barbell', 'Leg Press'],
      caloriesBurn: 600,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '5-6', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '8', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '12', order: 3 },
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 4 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 5 }
      ]
    },
    {
      title: "Atlas Squat Challenge",
      slug: "atlas-squat-challenge",
      description: "Carry the world on your shoulders with this legendary squat session.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES],
      equipment: ['Barbell'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Back Squat', sets: 6, reps: '8-10', order: 1 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 2 },
        { name: 'Leg Press', sets: 3, reps: '15-20', order: 3 }
      ]
    },
    {
      title: "Valkyrie Glute Glory",
      slug: "valkyrie-glute-glory",
      description: "Sculpt divine glutes worthy of the warrior maidens of Valhalla.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Hip Thrust', sets: 4, reps: '12-15', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10-12', order: 2 },
        { name: 'Glute Bridge', sets: 3, reps: '15-20', order: 3 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 4 }
      ]
    },
    {
      title: "Colossus Leg Day",
      slug: "colossus-leg-day",
      description: "Build legs as mighty as the ancient colossus statues.",
      difficulty: Difficulty.EXTREME,
      duration: 70,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.CALVES],
      equipment: ['Barbell', 'Leg Press', 'Dumbbells'],
      caloriesBurn: 650,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '6-8', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '8-10', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '12-15', order: 3 },
        { name: 'Lunges', sets: 3, reps: '10 each leg', order: 4 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 5 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 6 }
      ]
    },
    {
      title: "Achilles Hamstring Heist",
      slug: "achilles-hamstring-heist",
      description: "Target your hamstrings with the precision of Achilles' arrow.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell'],
      caloriesBurn: 325,
      exercises: [
        { name: 'Romanian Deadlift', sets: 5, reps: '10-12', order: 1 },
        { name: 'Glute Bridge', sets: 4, reps: '15', order: 2 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 3 }
      ]
    },
    {
      title: "Minotaur's Quad Maze",
      slug: "minotaurs-quad-maze",
      description: "Navigate the labyrinth of leg gains with this quad-focused crusher.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS],
      equipment: ['Barbell', 'Leg Press'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '10', order: 1 },
        { name: 'Leg Press', sets: 4, reps: '12-15', order: 2 },
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 3 }
      ]
    },
    {
      title: "Phoenix Rising Legs",
      slug: "phoenix-rising-legs",
      description: "Resurrect your lower body strength from the ashes of weakness.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Lunges', sets: 4, reps: '12 each leg', order: 1 },
        { name: 'Glute Bridge', sets: 4, reps: '15', order: 2 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 3 },
        { name: 'Back Squat', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Odin's One-Leg Ordeal",
      slug: "odins-one-leg-ordeal",
      description: "Test your wisdom and balance with this unilateral leg destroyer.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Lunges', sets: 5, reps: '10 each leg', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10 each leg', order: 2 },
        { name: 'Glute Bridge', sets: 3, reps: '12 each leg', order: 3 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Hercules Glute Gauntlet",
      slug: "hercules-glute-gauntlet",
      description: "Complete the twelve labors of glute development.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Hip Thrust', sets: 5, reps: '10-12', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10', order: 2 },
        { name: 'Glute Bridge', sets: 4, reps: '15', order: 3 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 4 }
      ]
    },
    {
      title: "Titan's Foundation",
      slug: "titans-foundation",
      description: "Build a lower body foundation as solid as the titans themselves.",
      difficulty: Difficulty.EXTREME,
      duration: 65,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Leg Press'],
      caloriesBurn: 600,
      exercises: [
        { name: 'Back Squat', sets: 6, reps: '6', order: 1 },
        { name: 'Romanian Deadlift', sets: 5, reps: '8', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '12', order: 3 },
        { name: 'Hip Thrust', sets: 3, reps: '10', order: 4 },
        { name: 'Lunges', sets: 3, reps: '10 each leg', order: 5 }
      ]
    },
    {
      title: "Poseidon's Leg Tsunami",
      slug: "poseidons-leg-tsunami",
      description: "Create waves of power with this oceanic leg workout.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.CALVES],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '8-10', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10', order: 2 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 3 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 4 },
        { name: 'Leg Press', sets: 3, reps: '15', order: 5 }
      ]
    },
    {
      title: "Apollo's Leg Ascension",
      slug: "apollos-leg-ascension",
      description: "Rise to divine heights with this heavenly leg routine.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10-12', order: 1 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 2 },
        { name: 'Hip Thrust', sets: 3, reps: '15', order: 3 },
        { name: 'Glute Bridge', sets: 3, reps: '20', order: 4 }
      ]
    },
    {
      title: "Ares Leg Warfare",
      slug: "ares-leg-warfare",
      description: "Wage war on weakness with this battle-tested leg assault.",
      difficulty: Difficulty.HARD,
      duration: 55,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Leg Press'],
      caloriesBurn: 525,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '8', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '8', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '10', order: 3 },
        { name: 'Lunges', sets: 3, reps: '10 each leg', order: 4 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 5 }
      ]
    },
    {
      title: "Medusa's Stone Legs",
      slug: "medusas-stone-legs",
      description: "Turn your legs to stone with this petrifying lower body workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '12', order: 2 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 3 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Cyclops Single-Leg Siege",
      slug: "cyclops-single-leg-siege",
      description: "Focus your single eye on unilateral leg destruction.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Lunges', sets: 5, reps: '8 each leg', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10 each leg', order: 2 },
        { name: 'Glute Bridge', sets: 4, reps: '12 each leg', order: 3 }
      ]
    },
    {
      title: "Kraken's Tentacle Legs",
      slug: "krakens-tentacle-legs",
      description: "Develop sea monster strength in your lower body.",
      difficulty: Difficulty.EXTREME,
      duration: 60,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.CALVES],
      equipment: ['Barbell', 'Leg Press'],
      caloriesBurn: 575,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '6-8', order: 1 },
        { name: 'Romanian Deadlift', sets: 5, reps: '8', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '10', order: 3 },
        { name: 'Hip Thrust', sets: 4, reps: '10', order: 4 },
        { name: 'Lunges', sets: 3, reps: '10 each leg', order: 5 }
      ]
    },
    {
      title: "Leonidas Leg Legacy",
      slug: "leonidas-leg-legacy",
      description: "Build legs worthy of the legendary Spartan king.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '10', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10', order: 2 },
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 3 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 4 }
      ]
    },
    {
      title: "Hades Underworld Legs",
      slug: "hades-underworld-legs",
      description: "Descend into the depths of leg day hell and emerge victorious.",
      difficulty: Difficulty.EXTREME,
      duration: 70,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Leg Press', 'Dumbbells'],
      caloriesBurn: 650,
      exercises: [
        { name: 'Back Squat', sets: 6, reps: '5', order: 1 },
        { name: 'Romanian Deadlift', sets: 5, reps: '6', order: 2 },
        { name: 'Leg Press', sets: 4, reps: '10', order: 3 },
        { name: 'Lunges', sets: 4, reps: '8 each leg', order: 4 },
        { name: 'Hip Thrust', sets: 3, reps: '10', order: 5 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 6 }
      ]
    },
    {
      title: "Athena's Strategic Legs",
      slug: "athenas-strategic-legs",
      description: "Approach leg day with the wisdom and strategy of the goddess of war.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.QUADRICEPS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', order: 2 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 3 },
        { name: 'Glute Bridge', sets: 3, reps: '15', order: 4 },
        { name: 'Hip Thrust', sets: 3, reps: '12', order: 5 }
      ]
    },

    // Core Workouts (15)
    {
      title: "Spartan Core Shield",
      slug: "spartan-core-shield",
      description: "Forge an impenetrable core shield worthy of Spartan warriors.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Bodyweight', 'Medicine Ball'],
      caloriesBurn: 300,
      exercises: [
        { name: 'Plank', sets: 4, duration: 60, order: 1 },
        { name: 'Russian Twists', sets: 4, reps: '20 each side', order: 2 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', order: 3 },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', order: 4 }
      ]
    },
    {
      title: "Poseidon's Wave Core",
      slug: "poseidons-wave-core",
      description: "Ride the waves of core strength with this oceanic ab assault.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Bodyweight'],
      caloriesBurn: 250,
      exercises: [
        { name: 'Plank', sets: 3, duration: 45, order: 1 },
        { name: 'Bicycle Crunches', sets: 3, reps: '25 each side', order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '12 each side', order: 3 },
        { name: 'Russian Twists', sets: 3, reps: '15 each side', order: 4 }
      ]
    },
    {
      title: "Atlas Core Foundation",
      slug: "atlas-core-foundation",
      description: "Build a core strong enough to hold up the heavens.",
      difficulty: Difficulty.EXTREME,
      duration: 35,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Bodyweight', 'Medicine Ball'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Plank', sets: 5, duration: 90, order: 1 },
        { name: 'Russian Twists', sets: 4, reps: '25 each side', order: 2 },
        { name: 'Dead Bug', sets: 4, reps: '15 each side', order: 3 },
        { name: 'Bicycle Crunches', sets: 3, reps: '30 each side', order: 4 }
      ]
    },
    {
      title: "Dragon's Core Inferno",
      slug: "dragons-core-inferno",
      description: "Ignite your abs with this fiery dragon-inspired core crusher.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Bodyweight'],
      caloriesBurn: 325,
      exercises: [
        { name: 'Plank', sets: 4, duration: 60, order: 1 },
        { name: 'Bicycle Crunches', sets: 4, reps: '20 each side', order: 2 },
        { name: 'Russian Twists', sets: 3, reps: '20 each side', order: 3 },
        { name: 'Dead Bug', sets: 3, reps: '12 each side', order: 4 }
      ]
    },
    {
      title: "Gladiator's Iron Core",
      slug: "gladiators-iron-core",
      description: "Forge an iron core worthy of the Roman Colosseum's greatest champions.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.ABS],
      equipment: ['Bodyweight'],
      caloriesBurn: 275,
      exercises: [
        { name: 'Plank', sets: 3, duration: 60, order: 1 },
        { name: 'Bicycle Crunches', sets: 3, reps: '25 each side', order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', order: 3 }
      ]
    },
    {
      title: "Medusa's Stone Abs",
      slug: "medusas-stone-abs",
      description: "Turn your abs to stone with this petrifying core workout.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Medicine Ball', 'Bodyweight'],
      caloriesBurn: 300,
      exercises: [
        { name: 'Russian Twists', sets: 4, reps: '20 each side', order: 1 },
        { name: 'Plank', sets: 4, duration: 45, order: 2 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', order: 3 },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', order: 4 }
      ]
    },
    {
      title: "Phoenix Core Rising",
      slug: "phoenix-core-rising",
      description: "Resurrect your core strength from the ashes with this reborn ab routine.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.LOWER_BACK],
      equipment: ['Bodyweight'],
      caloriesBurn: 250,
      exercises: [
        { name: 'Plank', sets: 3, duration: 45, order: 1 },
        { name: 'Dead Bug', sets: 3, reps: '12 each side', order: 2 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', order: 3 }
      ]
    },
    {
      title: "Samurai Core Discipline",
      slug: "samurai-core-discipline",
      description: "Master your core with the discipline and precision of a samurai warrior.",
      difficulty: Difficulty.HARD,
      duration: 35,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Plank', sets: 5, duration: 60, order: 1 },
        { name: 'Russian Twists', sets: 4, reps: '15 each side', order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', order: 3 },
        { name: 'Bicycle Crunches', sets: 3, reps: '15 each side', order: 4 }
      ]
    },
    {
      title: "Odin's Wisdom Core",
      slug: "odins-wisdom-core",
      description: "Gain the wisdom of core strength with this all-seeing ab workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 30,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Medicine Ball', 'Bodyweight'],
      caloriesBurn: 275,
      exercises: [
        { name: 'Russian Twists', sets: 3, reps: '20 each side', order: 1 },
        { name: 'Plank', sets: 3, duration: 60, order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '12 each side', order: 3 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', order: 4 }
      ]
    },
    {
      title: "Titan's Core Fortress",
      slug: "titans-core-fortress",
      description: "Build a fortress of core strength worthy of the ancient titans.",
      difficulty: Difficulty.EXTREME,
      duration: 40,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Bodyweight', 'Medicine Ball'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Plank', sets: 5, duration: 90, order: 1 },
        { name: 'Russian Twists', sets: 5, reps: '25 each side', order: 2 },
        { name: 'Bicycle Crunches', sets: 4, reps: '25 each side', order: 3 },
        { name: 'Dead Bug', sets: 4, reps: '15 each side', order: 4 }
      ]
    },
    {
      title: "Achilles Core Armor",
      slug: "achilles-core-armor",
      description: "Protect your only weakness with invincible core armor.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Bodyweight'],
      caloriesBurn: 300,
      exercises: [
        { name: 'Plank', sets: 4, duration: 75, order: 1 },
        { name: 'Bicycle Crunches', sets: 4, reps: '20 each side', order: 2 },
        { name: 'Russian Twists', sets: 3, reps: '20 each side', order: 3 },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', order: 4 }
      ]
    },
    {
      title: "Hercules Twelve Core Labors",
      slug: "hercules-twelve-core-labors",
      description: "Complete the twelve labors of core development.",
      difficulty: Difficulty.EXTREME,
      duration: 45,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Medicine Ball', 'Bodyweight'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Plank', sets: 6, duration: 60, order: 1 },
        { name: 'Russian Twists', sets: 4, reps: '30 each side', order: 2 },
        { name: 'Bicycle Crunches', sets: 4, reps: '30 each side', order: 3 },
        { name: 'Dead Bug', sets: 4, reps: '15 each side', order: 4 }
      ]
    },
    {
      title: "Apollo's Solar Core",
      slug: "apollos-solar-core",
      description: "Radiate core strength like the sun god himself.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.ABS],
      equipment: ['Bodyweight'],
      caloriesBurn: 250,
      exercises: [
        { name: 'Plank', sets: 3, duration: 60, order: 1 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '12 each side', order: 3 }
      ]
    },
    {
      title: "Valhalla Victory Core",
      slug: "valhalla-victory-core",
      description: "Earn your place in Valhalla with this victorious core workout.",
      difficulty: Difficulty.HARD,
      duration: 35,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
      equipment: ['Medicine Ball', 'Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Russian Twists', sets: 4, reps: '25 each side', order: 1 },
        { name: 'Plank', sets: 4, duration: 60, order: 2 },
        { name: 'Dead Bug', sets: 3, reps: '15 each side', order: 3 },
        { name: 'Bicycle Crunches', sets: 3, reps: '25 each side', order: 4 }
      ]
    },
    {
      title: "Zeus Thunder Core",
      slug: "zeus-thunder-core",
      description: "Strike with lightning power from your thunderous core.",
      difficulty: Difficulty.EXTREME,
      duration: 40,
      targetMuscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES],
      equipment: ['Bodyweight', 'Medicine Ball'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Plank', sets: 5, duration: 90, order: 1 },
        { name: 'Russian Twists', sets: 5, reps: '20 each side', order: 2 },
        { name: 'Bicycle Crunches', sets: 4, reps: '25 each side', order: 3 },
        { name: 'Dead Bug', sets: 4, reps: '12 each side', order: 4 }
      ]
    },

    // Full Body Workouts (25)
    {
      title: "Olympian Total Transformation",
      slug: "olympian-total-transformation",
      description: "Transform into a god with this Mount Olympus worthy full-body workout.",
      difficulty: Difficulty.EXTREME,
      duration: 75,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 700,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '8', order: 1 },
        { name: 'Barbell Bench Press', sets: 4, reps: '8', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 3 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', order: 4 },
        { name: 'Military Press', sets: 3, reps: '10', order: 5 },
        { name: 'Plank', sets: 3, duration: 60, order: 6 }
      ]
    },
    {
      title: "Ragnarok Full Body Fury",
      slug: "ragnarok-full-body-fury",
      description: "Prepare for the end times with this apocalyptic full-body destroyer.",
      difficulty: Difficulty.EXTREME,
      duration: 80,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Kettlebell'],
      caloriesBurn: 750,
      exercises: [
        { name: 'Burpees', sets: 4, reps: '10', order: 1 },
        { name: 'Back Squat', sets: 4, reps: '10', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 3 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 4 },
        { name: 'Kettlebell Swings', sets: 3, reps: '20', order: 5 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 6 }
      ]
    },
    {
      title: "Spartan 300 Protocol",
      slug: "spartan-300-protocol",
      description: "Train like the legendary 300 Spartans with this warrior workout.",
      difficulty: Difficulty.HARD,
      duration: 60,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Barbell'],
      caloriesBurn: 600,
      exercises: [
        { name: 'Burpees', sets: 5, reps: '10', order: 1 },
        { name: 'Push-ups', sets: 5, reps: '20', order: 2 },
        { name: 'Back Squat', sets: 5, reps: '15', order: 3 },
        { name: 'Pull-ups', sets: 5, reps: '10', order: 4 },
        { name: 'Plank', sets: 3, duration: 60, order: 5 }
      ]
    },
    {
      title: "Hercules Hero Complex",
      slug: "hercules-hero-complex",
      description: "Complete heroic feats of strength with this demigod full-body routine.",
      difficulty: Difficulty.HARD,
      duration: 65,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 625,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Barbell Bench Press', sets: 4, reps: '10', order: 2 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10', order: 3 },
        { name: 'Military Press', sets: 3, reps: '10', order: 4 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', order: 5 },
        { name: 'Plank', sets: 3, duration: 45, order: 6 }
      ]
    },
    {
      title: "Viking Berserker Mode",
      slug: "viking-berserker-mode",
      description: "Unleash your inner berserker with this savage Norse full-body assault.",
      difficulty: Difficulty.EXTREME,
      duration: 70,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Kettlebell', 'Bodyweight'],
      caloriesBurn: 700,
      exercises: [
        { name: 'Kettlebell Swings', sets: 4, reps: '20', order: 1 },
        { name: 'Back Squat', sets: 4, reps: '8', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '20', order: 3 },
        { name: 'Pull-ups', sets: 4, reps: '10', order: 4 },
        { name: 'Burpees', sets: 3, reps: '10', order: 5 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 6 }
      ]
    },
    {
      title: "Gladiator Arena Circuit",
      slug: "gladiator-arena-circuit",
      description: "Survive the arena with this champion gladiator circuit training.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Burpees', sets: 4, reps: '8', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Mountain Climbers', sets: 4, reps: '20 each', order: 3 },
        { name: 'Plank', sets: 3, duration: 45, order: 4 }
      ]
    },
    {
      title: "Phoenix Rebirth Ritual",
      slug: "phoenix-rebirth-ritual",
      description: "Rise from the ashes stronger with this transformative full-body phoenix workout.",
      difficulty: Difficulty.HARD,
      duration: 55,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 525,
      exercises: [
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 3 },
        { name: 'Military Press', sets: 3, reps: '12', order: 4 },
        { name: 'Burpees', sets: 3, reps: '10', order: 5 }
      ]
    },
    {
      title: "Atlas World Bearer",
      slug: "atlas-world-bearer",
      description: "Carry the weight of the world with this titan-strength full-body workout.",
      difficulty: Difficulty.EXTREME,
      duration: 75,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 725,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '6', order: 1 },
        { name: 'Romanian Deadlift', sets: 5, reps: '6', order: 2 },
        { name: 'Barbell Bench Press', sets: 4, reps: '8', order: 3 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '8', order: 4 },
        { name: 'Military Press', sets: 3, reps: '10', order: 5 },
        { name: 'Plank', sets: 3, duration: 90, order: 6 }
      ]
    },
    {
      title: "Minotaur Maze Marathon",
      slug: "minotaur-maze-marathon",
      description: "Navigate the labyrinth of gains with this mythical full-body challenge.",
      difficulty: Difficulty.HARD,
      duration: 60,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Dumbbells'],
      caloriesBurn: 575,
      exercises: [
        { name: 'Burpees', sets: 4, reps: '12', order: 1 },
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 3 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 4 },
        { name: 'Plank', sets: 3, duration: 60, order: 5 }
      ]
    },
    {
      title: "Trojan War Training",
      slug: "trojan-war-training",
      description: "Prepare for epic battles with this Trojan warrior full-body routine.",
      difficulty: Difficulty.HARD,
      duration: 65,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 625,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '20', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '10', order: 3 },
        { name: 'Romanian Deadlift', sets: 3, reps: '12', order: 4 },
        { name: 'Burpees', sets: 3, reps: '10', order: 5 },
        { name: 'Plank', sets: 3, duration: 60, order: 6 }
      ]
    },
    {
      title: "Cerberus Triple Threat",
      slug: "cerberus-triple-threat",
      description: "Face the three-headed challenge of this underworld full-body workout.",
      difficulty: Difficulty.EXTREME,
      duration: 90,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Kettlebell'],
      caloriesBurn: 850,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '8', order: 1 },
        { name: 'Barbell Bench Press', sets: 5, reps: '8', order: 2 },
        { name: 'Pull-ups', sets: 5, reps: '8', order: 3 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10', order: 4 },
        { name: 'Kettlebell Swings', sets: 4, reps: '15', order: 5 },
        { name: 'Burpees', sets: 3, reps: '10', order: 6 },
        { name: 'Plank', sets: 3, duration: 60, order: 7 }
      ]
    },
    {
      title: "Prometheus Fire Starter",
      slug: "prometheus-fire-starter",
      description: "Steal the fire of the gods with this metabolic full-body igniter.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Kettlebell'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Kettlebell Swings', sets: 4, reps: '15', order: 1 },
        { name: 'Burpees', sets: 3, reps: '10', order: 2 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Achilles War Preparation",
      slug: "achilles-war-preparation",
      description: "Prepare for glory with this legendary warrior's full-body routine.",
      difficulty: Difficulty.HARD,
      duration: 55,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 525,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '20', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 3 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 4 },
        { name: 'Plank', sets: 3, duration: 60, order: 5 }
      ]
    },
    {
      title: "Cyclops Single Focus",
      slug: "cyclops-single-focus",
      description: "Focus your single eye on total body domination.",
      difficulty: Difficulty.MEDIUM,
      duration: 45,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Military Press', sets: 3, reps: '12', order: 3 },
        { name: 'Burpees', sets: 3, reps: '8', order: 4 },
        { name: 'Plank', sets: 3, duration: 45, order: 5 }
      ]
    },
    {
      title: "Pegasus Flying Circuit",
      slug: "pegasus-flying-circuit",
      description: "Soar to new heights with this mythical winged horse circuit.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Burpees', sets: 4, reps: '8', order: 1 },
        { name: 'Mountain Climbers', sets: 4, reps: '20 each', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 3 },
        { name: 'Plank', sets: 3, duration: 45, order: 4 }
      ]
    },
    {
      title: "Hydra Regeneration",
      slug: "hydra-regeneration",
      description: "Grow stronger with each set like the mythical hydra.",
      difficulty: Difficulty.HARD,
      duration: 60,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 575,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Barbell Bench Press', sets: 4, reps: '10', order: 2 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10', order: 3 },
        { name: 'Military Press', sets: 3, reps: '10', order: 4 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', order: 5 }
      ]
    },
    {
      title: "Argonaut Adventure",
      slug: "argonaut-adventure",
      description: "Embark on an epic quest for the golden gains.",
      difficulty: Difficulty.MEDIUM,
      duration: 50,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Dumbbells'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Lunges', sets: 4, reps: '10 each leg', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Pull-ups', sets: 3, reps: '8', order: 3 },
        { name: 'Burpees', sets: 3, reps: '8', order: 4 },
        { name: 'Plank', sets: 3, duration: 45, order: 5 }
      ]
    },
    {
      title: "Sisyphus Eternal Push",
      slug: "sisyphus-eternal-push",
      description: "Embrace the eternal struggle with this never-ending full-body challenge.",
      difficulty: Difficulty.EXTREME,
      duration: 100,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Bodyweight'],
      caloriesBurn: 950,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '10', order: 1 },
        { name: 'Push-ups', sets: 5, reps: '20', order: 2 },
        { name: 'Pull-ups', sets: 5, reps: '10', order: 3 },
        { name: 'Romanian Deadlift', sets: 5, reps: '10', order: 4 },
        { name: 'Burpees', sets: 5, reps: '10', order: 5 },
        { name: 'Mountain Climbers', sets: 5, reps: '20 each', order: 6 },
        { name: 'Plank', sets: 5, duration: 60, order: 7 }
      ]
    },
    {
      title: "Centaur Hybrid Power",
      slug: "centaur-hybrid-power",
      description: "Combine human intelligence with horse power in this hybrid workout.",
      difficulty: Difficulty.HARD,
      duration: 55,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Bodyweight'],
      caloriesBurn: 525,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '10', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 3 },
        { name: 'Lunges', sets: 3, reps: '12 each leg', order: 4 },
        { name: 'Burpees', sets: 3, reps: '8', order: 5 }
      ]
    },
    {
      title: "Icarus Sky Limit",
      slug: "icarus-sky-limit",
      description: "Fly close to the sun with this ambitious full-body workout.",
      difficulty: Difficulty.EXTREME,
      duration: 85,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Kettlebell'],
      caloriesBurn: 800,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '8', order: 1 },
        { name: 'Barbell Bench Press', sets: 5, reps: '8', order: 2 },
        { name: 'Pull-ups', sets: 5, reps: '10', order: 3 },
        { name: 'Kettlebell Swings', sets: 4, reps: '20', order: 4 },
        { name: 'Burpees', sets: 4, reps: '10', order: 5 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 6 }
      ]
    },

    // Cardio/HIIT Workouts (20)
    {
      title: "Hermes Speed Protocol",
      slug: "hermes-speed-protocol",
      description: "Move with the speed of the messenger god in this lightning-fast HIIT workout.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Burpees', sets: 5, reps: '10', order: 1 },
        { name: 'Mountain Climbers', sets: 5, reps: '30 each', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 3 },
        { name: 'Plank', sets: 3, duration: 30, order: 4 }
      ]
    },
    {
      title: "Atalanta Sprint Series",
      slug: "atalanta-sprint-series",
      description: "Race like the legendary huntress with this speed-focused cardio blast.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Mountain Climbers', sets: 6, reps: '20 each', order: 1 },
        { name: 'Burpees', sets: 4, reps: '8', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '12', order: 3 }
      ]
    },
    {
      title: "Fury Road Metabolic",
      slug: "fury-road-metabolic",
      description: "Ignite your metabolism with this fury-driven cardio inferno.",
      difficulty: Difficulty.EXTREME,
      duration: 35,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Kettlebell', 'Bodyweight'],
      caloriesBurn: 500,
      exercises: [
        { name: 'Kettlebell Swings', sets: 5, reps: '25', order: 1 },
        { name: 'Burpees', sets: 5, reps: '12', order: 2 },
        { name: 'Mountain Climbers', sets: 4, reps: '30 each', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '20', order: 4 }
      ]
    },
    {
      title: "Apollo's Chariot Chase",
      slug: "apollos-chariot-chase",
      description: "Race the sun across the sky with this divine cardio challenge.",
      difficulty: Difficulty.HARD,
      duration: 30,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Burpees', sets: 4, reps: '12', order: 1 },
        { name: 'Mountain Climbers', sets: 4, reps: '25 each', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 3 },
        { name: 'Plank', sets: 3, duration: 45, order: 4 }
      ]
    },
    {
      title: "Valkyrie Flight Training",
      slug: "valkyrie-flight-training",
      description: "Soar through this aerial-inspired cardio workout fit for warrior maidens.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 325,
      exercises: [
        { name: 'Mountain Climbers', sets: 4, reps: '20 each', order: 1 },
        { name: 'Burpees', sets: 3, reps: '10', order: 2 },
        { name: 'Push-ups', sets: 3, reps: '12', order: 3 },
        { name: 'Plank', sets: 3, duration: 30, order: 4 }
      ]
    },
    
    // Final 20 Epic Workouts (81-100)
    {
      title: "Phoenix Rising Upper",
      slug: "phoenix-rising-upper",
      description: "Rise from the ashes with this rebirth-inducing upper body blaster.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', order: 1 },
        { name: 'Pull-ups', sets: 4, reps: '8-10', order: 2 },
        { name: 'Military Press', sets: 4, reps: '8-10', order: 3 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '10-12', order: 4 },
        { name: 'Lateral Raises', sets: 3, reps: '15', order: 5 }
      ]
    },
    {
      title: "Mjolnir Hammer Time",
      slug: "mjolnir-hammer-time",
      description: "Wield the power of Thor's hammer with this crushing arm workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS, MuscleGroup.FOREARMS],
      equipment: ['Dumbbells', 'Barbell'],
      caloriesBurn: 300,
      exercises: [
        { name: 'Hammer Curls', sets: 5, reps: '10-12', order: 1 },
        { name: 'Tricep Dips', sets: 4, reps: '12-15', order: 2 },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Chronos Time Trial",
      slug: "chronos-time-trial",
      description: "Race against time itself with this fast-paced cardio challenge.",
      difficulty: Difficulty.EXTREME,
      duration: 30,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Burpees', sets: 5, reps: '15', order: 1 },
        { name: 'Mountain Climbers', sets: 5, reps: '30 each', order: 2 },
        { name: 'Squats', sets: 5, reps: '20', order: 3 },
        { name: 'Push-ups', sets: 5, reps: '15', order: 4 }
      ]
    },
    {
      title: "Leviathan's Deep Dive",
      slug: "leviathans-deep-dive",
      description: "Plunge into the depths with this oceanic leg destroyer.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 425,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '8-10', order: 1 },
        { name: 'Walking Lunges', sets: 4, reps: '12 each', order: 2 },
        { name: 'Front Squat', sets: 3, reps: '15', order: 3 },
        { name: 'Calf Raises', sets: 4, reps: '20', order: 4 }
      ]
    },
    {
      title: "Cerberus Core Guard",
      slug: "cerberus-core-guard",
      description: "Three-headed core assault that guards the gates of gains.",
      difficulty: Difficulty.MEDIUM,
      duration: 25,
      targetMuscles: [MuscleGroup.CORE],
      equipment: ['Bodyweight'],
      caloriesBurn: 250,
      exercises: [
        { name: 'Plank', sets: 3, duration: 60, order: 1 },
        { name: 'Russian Twists', sets: 3, reps: '30', order: 2 },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each', order: 3 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 4 }
      ]
    },
    {
      title: "Hydra Head Splitter",
      slug: "hydra-head-splitter",
      description: "Multi-headed shoulder attack that regenerates your delts.",
      difficulty: Difficulty.HARD,
      duration: 40,
      targetMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRAPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Military Press', sets: 4, reps: '8-10', order: 1 },
        { name: 'Lateral Raises', sets: 5, reps: '12-15', order: 2 },
        { name: 'Face Pulls', sets: 4, reps: '15', order: 3 },
        { name: 'Push-ups', sets: 3, reps: '15', order: 4 }
      ]
    },
    {
      title: "Nemesis Revenge Body",
      slug: "nemesis-revenge-body",
      description: "Get your revenge body with this full-body nemesis neutralizer.",
      difficulty: Difficulty.EXTREME,
      duration: 60,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 600,
      exercises: [
        { name: 'Deadlift', sets: 5, reps: '5', order: 1 },
        { name: 'Pull-ups', sets: 4, reps: '8-10', order: 2 },
        { name: 'Back Squat', sets: 4, reps: '10', order: 3 },
        { name: 'Barbell Bench Press', sets: 4, reps: '10', order: 4 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '12', order: 5 },
        { name: 'Plank', sets: 3, duration: 45, order: 6 }
      ]
    },
    {
      title: "Iris Rainbow Circuit",
      slug: "iris-rainbow-circuit",
      description: "Full spectrum gains with this colorful cardio circuit.",
      difficulty: Difficulty.MEDIUM,
      duration: 30,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Mountain Climbers', sets: 4, reps: '30', order: 1 },
        { name: 'Burpees', sets: 4, reps: '10', order: 2 },
        { name: 'Mountain Climbers', sets: 4, reps: '20 each', order: 3 },
        { name: 'Squats', sets: 4, reps: '15', order: 4 }
      ]
    },
    {
      title: "Gaia's Earth Shaker",
      slug: "gaias-earth-shaker",
      description: "Ground-pounding leg day that makes Mother Earth tremble.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 475,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '6-8', order: 1 },
        { name: 'Romanian Deadlift', sets: 4, reps: '10', order: 2 },
        { name: 'Walking Lunges', sets: 4, reps: '12 each', order: 3 },
        { name: 'Front Squat', sets: 3, reps: '15', order: 4 },
        { name: 'Calf Raises', sets: 3, reps: '25', order: 5 }
      ]
    },
    {
      title: "Helios Sun Salutation",
      slug: "helios-sun-salutation",
      description: "Greet the sun god with this morning mobility and strength flow.",
      difficulty: Difficulty.EASY,
      duration: 20,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 200,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '10', order: 1 },
        { name: 'Lunges', sets: 3, reps: '10 each', order: 2 },
        { name: 'Plank', sets: 3, duration: 30, order: 3 },
        { name: 'Mountain Climbers', sets: 3, reps: '15 each', order: 4 }
      ]
    },
    {
      title: "Cyclops Single Focus",
      slug: "cyclops-single-focus",
      description: "One-eyed intensity for laser-focused chest gains.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.CHEST],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 325,
      exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '8-10', order: 1 },
        { name: 'Dumbbell Flyes', sets: 4, reps: '12', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '15-20', order: 3 }
      ]
    },
    {
      title: "Morpheus Dream Builder",
      slug: "morpheus-dream-builder",
      description: "Build the body of your dreams with this sleep-god approved workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Back Squat', sets: 3, reps: '12', order: 1 },
        { name: 'Barbell Bench Press', sets: 3, reps: '12', order: 2 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '12', order: 3 },
        { name: 'Military Press', sets: 3, reps: '12', order: 4 },
        { name: 'Plank', sets: 3, duration: 45, order: 5 }
      ]
    },
    {
      title: "Artemis Hunt Training",
      slug: "artemis-hunt-training",
      description: "Hunter's agility and power workout for divine athleticism.",
      difficulty: Difficulty.HARD,
      duration: 45,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Dumbbells'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Squats', sets: 4, reps: '15', order: 1 },
        { name: 'Walking Lunges', sets: 4, reps: '12 each', order: 2 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 3 },
        { name: 'Burpees', sets: 4, reps: '10', order: 4 },
        { name: 'Mountain Climbers', sets: 4, reps: '20 each', order: 5 }
      ]
    },
    {
      title: "Pandora's Box Opening",
      slug: "pandoras-box-opening",
      description: "Unleash chaos on your muscles with this unpredictable full-body assault.",
      difficulty: Difficulty.EXTREME,
      duration: 55,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 550,
      exercises: [
        { name: 'Deadlift', sets: 4, reps: '6-8', order: 1 },
        { name: 'Pull-ups', sets: 4, reps: '10', order: 2 },
        { name: 'Squats', sets: 4, reps: '12', order: 3 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '12', order: 4 },
        { name: 'Burpees', sets: 3, reps: '15', order: 5 },
        { name: 'Plank', sets: 3, duration: 60, order: 6 }
      ]
    },
    {
      title: "Icarus Wing Builder",
      slug: "icarus-wing-builder",
      description: "Build wings to fly, but don't get too close to the sun with this back workout.",
      difficulty: Difficulty.MEDIUM,
      duration: 40,
      targetMuscles: [MuscleGroup.BACK, MuscleGroup.REAR_DELTS],
      equipment: ['Pull-up Bar', 'Barbell', 'Dumbbells'],
      caloriesBurn: 375,
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: '8-12', order: 1 },
        { name: 'Bent Over Barbell Row', sets: 4, reps: '10-12', order: 2 },
        { name: 'Lat Pulldown', sets: 3, reps: '12-15', order: 3 },
        { name: 'Face Pulls', sets: 3, reps: '15-20', order: 4 }
      ]
    },
    {
      title: "Prometheus Fire Starter",
      slug: "prometheus-fire-starter",
      description: "Steal the fire of the gods with this metabolism-igniting HIIT session.",
      difficulty: Difficulty.HARD,
      duration: 25,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight'],
      caloriesBurn: 400,
      exercises: [
        { name: 'Burpees', sets: 5, reps: '12', order: 1 },
        { name: 'Squats', sets: 5, reps: '15', order: 2 },
        { name: 'Mountain Climbers', sets: 5, reps: '25 each', order: 3 },
        { name: 'Push-ups', sets: 5, reps: '10', order: 4 }
      ]
    },
    {
      title: "Orion's Hunter Protocol",
      slug: "orions-hunter-protocol",
      description: "Track your prey with this predator-building functional fitness routine.",
      difficulty: Difficulty.MEDIUM,
      duration: 35,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Dumbbells', 'Bodyweight'],
      caloriesBurn: 350,
      exercises: [
        { name: 'Front Squat', sets: 4, reps: '12', order: 1 },
        { name: 'Push-ups', sets: 4, reps: '15', order: 2 },
        { name: 'Walking Lunges', sets: 3, reps: '10 each', order: 3 },
        { name: 'Plank', sets: 3, duration: 45, order: 4 },
        { name: 'Mountain Climbers', sets: 3, reps: '20 each', order: 5 }
      ]
    },
    {
      title: "Echo's Reverb Reps",
      slug: "echos-reverb-reps",
      description: "Repeat after me: gains, gains, gains! Echo your way to success.",
      difficulty: Difficulty.EASY,
      duration: 30,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Bodyweight', 'Dumbbells'],
      caloriesBurn: 275,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '12', order: 1 },
        { name: 'Squats', sets: 3, reps: '15', order: 2 },
        { name: 'Lunges', sets: 3, reps: '10 each', order: 3 },
        { name: 'Plank', sets: 3, duration: 30, order: 4 }
      ]
    },
    {
      title: "Midas Golden Gains",
      slug: "midas-golden-gains",
      description: "Everything you touch turns to muscle with this golden ratio workout.",
      difficulty: Difficulty.HARD,
      duration: 50,
      targetMuscles: [MuscleGroup.FULL_BODY],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      caloriesBurn: 500,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '8', order: 1 },
        { name: 'Barbell Bench Press', sets: 4, reps: '8', order: 2 },
        { name: 'Pull-ups', sets: 4, reps: '8', order: 3 },
        { name: 'Military Press', sets: 3, reps: '10', order: 4 },
        { name: 'Bent Over Barbell Row', sets: 3, reps: '10', order: 5 },
        { name: 'Barbell Curl', sets: 3, reps: '12', order: 6 }
      ]
    },
    {
      title: "Sisyphus Eternal Push",
      slug: "sisyphus-eternal-push",
      description: "Push that boulder up the hill with this never-ending chest and shoulder challenge.",
      difficulty: Difficulty.EXTREME,
      duration: 45,
      targetMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
      equipment: ['Barbell', 'Dumbbells'],
      caloriesBurn: 450,
      exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '10', order: 1 },
        { name: 'Military Press', sets: 5, reps: '10', order: 2 },
        { name: 'Dumbbell Flyes', sets: 4, reps: '12', order: 3 },
        { name: 'Lateral Raises', sets: 4, reps: '15', order: 4 },
        { name: 'Tricep Dips', sets: 4, reps: '12', order: 5 },
        { name: 'Push-ups', sets: 3, reps: 'to failure', order: 6 }
      ]
    }
  ];

  console.log(`📝 Creating ${workouts.length} epic workouts...`);

  for (const workoutData of workouts) {
    try {
      const { exercises, ...workoutInfo } = workoutData;
      
      // Create workout
      const workout = await prisma.workout.create({
        data: {
          ...workoutInfo,
          creatorId: adminUser.id,
          isPublic: true,
          featured: Math.random() > 0.7, // 30% chance of being featured
          exercises: {
            create: exercises.map(ex => ({
              exerciseId: getExerciseId(ex.name),
              order: ex.order,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.duration,
              restTime: 60, // Default rest time
              notes: ex.notes
            }))
          }
        }
      });

      console.log(`✅ Created workout: ${workout.title}`);
    } catch (error) {
      console.error(`❌ Failed to create workout: ${workoutData.title}`, error);
    }
  }

  console.log('🎉 Epic workouts seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
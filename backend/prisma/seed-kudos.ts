import { PrismaClient, KudosType } from '@prisma/client';

const prisma = new PrismaClient();

const kudosPhrases = [
  // WORKOUT_START (20 phrases)
  { type: KudosType.WORKOUT_START, phrase: "Let's make those muscles cry tears of joy! Time to get swole!" },
  { type: KudosType.WORKOUT_START, phrase: "Welcome to the gun show! Population: YOU!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to turn that dad bod into a rad bod!" },
  { type: KudosType.WORKOUT_START, phrase: "Prepare to be legendary! Your muscles aren't ready for this!" },
  { type: KudosType.WORKOUT_START, phrase: "Let's get juicy! Time to pump some iron!" },
  { type: KudosType.WORKOUT_START, phrase: "Release the beast! It's gains o'clock!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to make Arnold jealous!" },
  { type: KudosType.WORKOUT_START, phrase: "Your muscles called - they want to get huge!" },
  { type: KudosType.WORKOUT_START, phrase: "Warning: Extreme gainz ahead! Proceed with swagger!" },
  { type: KudosType.WORKOUT_START, phrase: "Let's get this bread... and by bread, I mean muscles!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to become an absolute unit!" },
  { type: KudosType.WORKOUT_START, phrase: "Buckle up buttercup, we're going to Gainsville!" },
  { type: KudosType.WORKOUT_START, phrase: "Let's turn you into a certified weapon of mass construction!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to get so pumped, doorways will fear you!" },
  { type: KudosType.WORKOUT_START, phrase: "Welcome to the temple of doom... for body fat!" },
  { type: KudosType.WORKOUT_START, phrase: "Let's make gravity work harder today!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to get absolutely yoked, my friend!" },
  { type: KudosType.WORKOUT_START, phrase: "Your future self is already thanking you!" },
  { type: KudosType.WORKOUT_START, phrase: "Let's sculpt you into a Greek god/goddess!" },
  { type: KudosType.WORKOUT_START, phrase: "Time to unleash your inner Hulk!" },

  // WORKOUT_COMPLETE (25 phrases)
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was Richtig Horny! You absolutely demolished that workout! 🔥" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You just made Thor look like a wimp! Absolutely legendary!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "Holy gains, Batman! You crushed it harder than my hopes and dreams!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You're officially too hot to handle! The gym needs a cooling system!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was spicier than a ghost pepper! You're on fire!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You just sent your muscles to Valhalla and back!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "Congratulations! You're now 73% more awesome!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You absolute madlad! That was beautifully brutal!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "Your muscles are writing thank you notes as we speak!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was harder than explaining cryptocurrency to your parents!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You just made Chuck Norris nervous! Phenomenal work!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "Breaking news: Local legend destroys workout! More at 11!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You're now legally classified as a certified beast!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was smoother than a freshly waxed dolphin!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "NASA called - they detected your gains from space!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You just turned sweat into success! Alchemy at its finest!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was more intense than a Netflix series finale!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You're now 200% more attractive! Science doesn't lie!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "The Rock just shed a single tear of respect!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You've achieved peak performance! Your couch misses you!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was absolutely bonkers! You're a certified savage!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You just made your muscles proud parents!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "Achievement unlocked: Absolute Unit Status!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "That was more satisfying than bubble wrap!" },
  { type: KudosType.WORKOUT_COMPLETE, phrase: "You're now qualified to lift Thor's hammer!" },

  // REST_START (20 phrases)
  { type: KudosType.REST_START, phrase: "That was absolutely savage! Time to rest those magnificent muscles!" },
  { type: KudosType.REST_START, phrase: "Beast mode deactivated! Time for a tactical breather!" },
  { type: KudosType.REST_START, phrase: "Your muscles are screaming 'thank you' in 12 languages!" },
  { type: KudosType.REST_START, phrase: "Time to let those gains marinate! Rest up, champion!" },
  { type: KudosType.REST_START, phrase: "Even gods need rest! Take a breather, Zeus!" },
  { type: KudosType.REST_START, phrase: "Your muscles are processing that awesomeness. Please wait..." },
  { type: KudosType.REST_START, phrase: "Initiating recovery protocol! Muscles entering repair mode!" },
  { type: KudosType.REST_START, phrase: "Time to let the magic happen! Rest those beautiful muscles!" },
  { type: KudosType.REST_START, phrase: "Your muscles are having a party! Give them a minute!" },
  { type: KudosType.REST_START, phrase: "Rest now, dominate more later! It's science!" },
  { type: KudosType.REST_START, phrase: "Taking a strategic pause to become even more legendary!" },
  { type: KudosType.REST_START, phrase: "Your muscles are writing poetry about that set!" },
  { type: KudosType.REST_START, phrase: "Time to recharge your superpowers!" },
  { type: KudosType.REST_START, phrase: "Even Spartans took water breaks! Rest up, warrior!" },
  { type: KudosType.REST_START, phrase: "Your muscles are high-fiving each other right now!" },
  { type: KudosType.REST_START, phrase: "Loading next level of awesome... Please stand by!" },
  { type: KudosType.REST_START, phrase: "Time to let those gains settle in! Quality rest time!" },
  { type: KudosType.REST_START, phrase: "Your muscles are doing the happy dance internally!" },
  { type: KudosType.REST_START, phrase: "Brief intermission while your muscles plot world domination!" },
  { type: KudosType.REST_START, phrase: "Rest period activated! Gainz processing in progress!" },

  // REST_COMPLETE (20 phrases)
  { type: KudosType.REST_COMPLETE, phrase: "Rest is for mortals! Let's get back to being legendary!" },
  { type: KudosType.REST_COMPLETE, phrase: "Nap time's over! Time to wake up and choose violence!" },
  { type: KudosType.REST_COMPLETE, phrase: "Break's over! Your muscles are demanding more action!" },
  { type: KudosType.REST_COMPLETE, phrase: "Rest complete! Time to continue your journey to Swolehalla!" },
  { type: KudosType.REST_COMPLETE, phrase: "Back to business! Those gains won't build themselves!" },
  { type: KudosType.REST_COMPLETE, phrase: "Recharged and ready! Let's make magic happen!" },
  { type: KudosType.REST_COMPLETE, phrase: "Your muscles have rested. Now they hunger for more!" },
  { type: KudosType.REST_COMPLETE, phrase: "Break time's over! The iron is calling your name!" },
  { type: KudosType.REST_COMPLETE, phrase: "Rest period expired! Time to get back to being awesome!" },
  { type: KudosType.REST_COMPLETE, phrase: "Your muscles miss the action! Let's give them what they want!" },
  { type: KudosType.REST_COMPLETE, phrase: "Fully recharged! Time to unleash the beast again!" },
  { type: KudosType.REST_COMPLETE, phrase: "Rest is done! Your muscles are ready to party!" },
  { type: KudosType.REST_COMPLETE, phrase: "Battery at 100%! Let's drain it with awesomeness!" },
  { type: KudosType.REST_COMPLETE, phrase: "Rest mode: OFF. Beast mode: REACTIVATED!" },
  { type: KudosType.REST_COMPLETE, phrase: "Your muscles have spoken - they want more punishment!" },
  { type: KudosType.REST_COMPLETE, phrase: "Break's over! Time to continue being extraordinary!" },
  { type: KudosType.REST_COMPLETE, phrase: "Rest complete! Your muscles are ready for round two!" },
  { type: KudosType.REST_COMPLETE, phrase: "Siesta finished! Time to fiesta with those weights!" },
  { type: KudosType.REST_COMPLETE, phrase: "Your muscles are refreshed and ready to rumble!" },
  { type: KudosType.REST_COMPLETE, phrase: "Recovery complete! Time to become even more legendary!" },

  // NEXT_EXERCISE (20 phrases)
  { type: KudosType.NEXT_EXERCISE, phrase: "You absolute beast! On to the next challenge! 🦾" },
  { type: KudosType.NEXT_EXERCISE, phrase: "That exercise didn't stand a chance! Next victim, please!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Moving on! Your muscles are hungry for more!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Exercise demolished! Time to conquer the next one!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Next up! Let's keep this gains train rolling!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Another one bites the dust! What's next on the menu?" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Exercise complete! Your muscles want an encore!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Onto the next adventure in Gainsville!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "That was just the appetizer! Main course coming up!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Level complete! Proceeding to the next boss fight!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "One down, ready for more! You're unstoppable!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Exercise terminated! Seeking next target!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "That was beautiful! Let's create more art with the next one!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Mission accomplished! New mission incoming!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "You conquered that like a Viking! Onward to glory!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Exercise destroyed! Your muscles demand MORE!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "That was too easy for you! Let's up the ante!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Moving forward! The gains train has no brakes!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "Next exercise loading... Prepare for awesomeness!" },
  { type: KudosType.NEXT_EXERCISE, phrase: "You're on fire! Let's keep this momentum going!" },

  // EXERCISE_COMPLETE (25 phrases)
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set complete! Your muscles are singing hymns of glory!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That set was chef's kiss! Absolutely perfect!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "You just made that look easier than a Sunday morning!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set demolished! Your muscles are writing thank you cards!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That was smoother than butter on a hot skillet!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Perfect execution! The gym gods are impressed!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set complete! Your form was prettier than a sunset!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "You just schooled that exercise! Class dismissed!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That set was crispier than fresh bacon!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Nailed it! That was textbook perfection!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set crushed! Your muscles are doing a victory dance!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That was cleaner than a whistle! Beautiful work!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Exercise mastered! You're basically a ninja now!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set finished! Your muscles are applauding!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That was more precise than a Swiss watch!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Perfect set! Your muscles are taking notes!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "You just made that exercise your personal assistant!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set complete! That was poetry in motion!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Flawless victory! Your muscles are celebrating!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That set was tighter than your favorite jeans!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Exercise dominated! You're in the zone!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set conquered! Your muscles are writing epic tales!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "That was more satisfying than popping bubble wrap!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Perfect form! The judges give it a 10/10!" },
  { type: KudosType.EXERCISE_COMPLETE, phrase: "Set annihilated! Your muscles are throwing a party!" },

  // PERSONAL_RECORD (20 phrases)
  { type: KudosType.PERSONAL_RECORD, phrase: "HOLY GAINS! You just shattered your personal record!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "NEW RECORD! You're officially stronger than yesterday!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "PR ALERT! You just made history! 🎯" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record broken! Your past self is shaking in fear!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "NEW PERSONAL BEST! You're evolving before our eyes!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record smashed! You're becoming too powerful!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "PR ACHIEVED! Your muscles just leveled up!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "New milestone! You're rewriting your own legend!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "BOOM! Personal record obliterated! You're unstoppable!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record destroyed! You're operating on a different level!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "NEW PR! Your muscles just got a promotion!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Personal best! You're basically a superhero now!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record annihilated! The gym will remember this day!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "NEW RECORD! You just made your future self proud!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "PR CRUSHED! You're writing checks your muscles can cash!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Milestone achieved! You're becoming legendary!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record shattered! Physics wants to study you!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "NEW PERSONAL RECORD! You're officially amazing!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "PR SMASHED! Your muscles just got a standing ovation!" },
  { type: KudosType.PERSONAL_RECORD, phrase: "Record broken! You're making gains history!" },
];

async function seedKudosPhrases() {
  console.log('🎉 Seeding kudos phrases...');

  // Clear existing kudos phrases
  await prisma.kudosPhrase.deleteMany();

  // Insert all kudos phrases
  for (const kudos of kudosPhrases) {
    await prisma.kudosPhrase.create({
      data: kudos,
    });
  }

  console.log(`✅ Seeded ${kudosPhrases.length} kudos phrases`);
}

async function main() {
  try {
    await seedKudosPhrases();
    console.log('🎊 Kudos phrases seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding kudos phrases:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding motivational quotes...');

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

  let createdCount = 0;
  for (const quote of motivationalQuotes) {
    try {
      await prisma.motivationalQuote.create({
        data: quote
      });
      createdCount++;
    } catch (error) {
      // If quote already exists, skip it
      console.log(`Quote already exists: "${quote.quote.substring(0, 30)}..."`);
    }
  }

  console.log(`✅ Created ${createdCount} motivational quotes`);
  console.log('🎉 Quotes seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
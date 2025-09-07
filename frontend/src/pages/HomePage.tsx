import { Link } from 'react-router-dom';
import { FaDumbbell, FaChartLine, FaUsers, FaTrophy, FaClock, FaMobile } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img 
              src="/EpicFitnessLogo.png" 
              alt="Epic Fitness Logo" 
              className="h-32 w-auto drop-shadow-2xl"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6"
          >
            Transform Your Body
            <br />
            <span className="text-primary-400">Elevate Your Life</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto"
          >
            The ultimate fitness platform to track workouts, monitor progress, and achieve your goals
            with personalized training programs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg text-lg transition-all transform hover:scale-105"
            >
              Start Your Journey
            </Link>
            <Link
              to="/workouts"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold rounded-lg text-lg transition-all"
            >
              Browse Workouts
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4 gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform provides all the tools and features you need to reach your fitness goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaDumbbell className="h-12 w-12" />}
              title="Custom Workouts"
              description="Create and customize workouts tailored to your specific goals and fitness level"
            />
            <FeatureCard
              icon={<FaChartLine className="h-12 w-12" />}
              title="Progress Tracking"
              description="Monitor your progress with detailed analytics and visual charts"
            />
            <FeatureCard
              icon={<FaUsers className="h-12 w-12" />}
              title="Community Support"
              description="Join a community of fitness enthusiasts and share your journey"
            />
            <FeatureCard
              icon={<FaTrophy className="h-12 w-12" />}
              title="Achievements"
              description="Earn badges and rewards as you hit your milestones"
            />
            <FeatureCard
              icon={<FaClock className="h-12 w-12" />}
              title="Workout Timer"
              description="Built-in timer to track your sets, reps, and rest periods"
            />
            <FeatureCard
              icon={<FaMobile className="h-12 w-12" />}
              title="Mobile Friendly"
              description="Access your workouts anywhere with our responsive design"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="10,000+" label="Active Users" />
            <StatCard number="500+" label="Workouts" />
            <StatCard number="50+" label="Programs" />
            <StatCard number="95%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* Meet the Creators Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4 gradient-text">
              Meet the Epic Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Combining world-class development with elite fitness expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Austin Arlint */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">AA</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Austin Arlint
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-center mb-4">
                Epic Developer
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Full-stack wizard and the technical mastermind behind Epic Fitness. Austin transforms 
                complex fitness tracking needs into elegant, user-friendly solutions. With a passion for 
                clean code and seamless user experiences, he ensures every feature works flawlessly 
                to support your fitness journey.
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  React Expert
                </span>
                <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                  UI/UX Design
                </span>
                <span className="px-3 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                  Performance
                </span>
              </div>
            </motion.div>

            {/* Casey Keller */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">CK</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Casey Keller
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-center mb-4">
                Epic Body Builder
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Professional bodybuilder and fitness expert bringing years of training experience 
                to Epic Fitness. Casey designs workout programs that deliver real results, whether 
                you're a beginner or advanced athlete. His proven methods and deep understanding 
                of exercise science ensure every workout maximizes your potential.
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <span className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                  IFBB Pro
                </span>
                <span className="px-3 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-sm">
                  Nutrition Expert
                </span>
                <span className="px-3 py-1 bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-full text-sm">
                  Trainer
                </span>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 italic">
              "Together, we're revolutionizing fitness technology to help you achieve your epic transformation"
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already achieving their fitness goals
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-primary-500 hover:bg-gray-100 font-bold rounded-lg text-lg transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card p-8 text-center hover:shadow-glow transition-all duration-300"
    >
      <div className="text-primary-500 flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold gradient-text mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
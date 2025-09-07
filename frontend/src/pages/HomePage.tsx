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
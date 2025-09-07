import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from '../components/common/PullToRefresh';
import {
  FaDumbbell,
  FaFire,
  FaCalendarAlt,
  FaTrophy,
  FaChartLine,
  FaUsers,
  FaClock,
  FaWeightHanging,
  FaRunning,
  FaBolt,
  FaChevronRight,
  FaMedal,
  FaPlus,
  FaSpinner,
  FaChevronLeft,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { userApi, type UserStats, type RecentWorkout, type UpcomingWorkout, type Achievement, type MotivationalQuote } from '../api/user';

// Mock data for fallback
const mockUpcomingWorkouts = [
  {
    id: '1',
    name: 'Push Day',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    duration: 45,
    difficulty: 'MEDIUM',
  },
  {
    id: '2',
    name: 'HIIT Cardio',
    scheduledDate: new Date(Date.now() + 172800000).toISOString(),
    duration: 30,
    difficulty: 'HARD',
  },
];

// Icon mapping for achievements
const achievementIcons: { [key: string]: any } = {
  'fire': FaFire,
  'clock': FaClock,
  'medal': FaMedal,
  'weight': FaWeightHanging,
  'trophy': FaTrophy,
  'dumbbell': FaDumbbell,
  'running': FaRunning,
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<UpcomingWorkout[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quotes, setQuotes] = useState<MotivationalQuote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsData, recentData, upcomingData, achievementsData, dailyQuote, randomQuotes] = await Promise.all([
        userApi.getStats(),
        userApi.getRecentWorkouts(3),
        userApi.getUpcomingWorkouts().catch(() => mockUpcomingWorkouts), // Use mock if no upcoming
        userApi.getAchievements(),
        userApi.getDailyQuote().catch((err) => {
          console.error('Failed to fetch daily quote:', err);
          return null;
        }),
        userApi.getRandomQuotes(10).catch((err) => {
          console.error('Failed to fetch random quotes:', err);
          return [];
        }),
      ]);

      setStats(statsData);
      setRecentWorkouts(recentData);
      setUpcomingWorkouts(upcomingData);
      setAchievements(achievementsData.slice(0, 4)); // Show first 4 achievements
      
      // Set quotes with daily quote first
      if (dailyQuote || randomQuotes.length > 0) {
        const allQuotes = dailyQuote 
          ? [dailyQuote, ...randomQuotes.filter(q => q && q.id !== dailyQuote.id)]
          : randomQuotes;
          setQuotes(allQuotes);
        setCurrentQuoteIndex(0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const weeklyProgress = stats ? (stats.weeklyCompleted / stats.weeklyGoal) * 100 : 0;

  const handleNextQuote = async () => {
    if (currentQuoteIndex < quotes.length - 1) {
      setCurrentQuoteIndex(currentQuoteIndex + 1);
    } else {
      // Load more quotes when reaching the end
      try {
        const currentQuote = quotes[currentQuoteIndex];
        const newQuotes = await userApi.getRandomQuotes(10, currentQuote?.id);
        if (newQuotes.length > 0) {
          setQuotes([...quotes, ...newQuotes]);
          setCurrentQuoteIndex(currentQuoteIndex + 1);
        }
      } catch (err) {
        // If can't load more, cycle back to beginning
        setCurrentQuoteIndex(0);
      }
    }
  };

  const handlePreviousQuote = () => {
    if (currentQuoteIndex > 0) {
      setCurrentQuoteIndex(currentQuoteIndex - 1);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboardData(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Mock Data Badge - Show only for upcoming workouts if they're mock */}
      {!loading && upcomingWorkouts.length > 0 && upcomingWorkouts[0].id === '1' && (
        <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm">
          <span className="font-semibold">Note</span>
          <span className="ml-2">- Upcoming workouts are examples. Enroll in a program to see your schedule.</span>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}, {user?.firstName || user?.username}! 💪
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {stats && stats.currentStreak > 0
            ? `You're on a ${stats.currentStreak} day streak! Keep it up!`
            : "Let's get that workout streak started!"}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
              <FaFire className="h-6 w-6 text-primary-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.currentStreak || 0}
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Current Streak</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Longest: {stats?.longestStreak || 0} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <FaDumbbell className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalWorkouts || 0}
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Workouts</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            This month: {stats?.monthlyWorkouts || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <FaClock className="h-6 w-6 text-purple-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? Math.floor(stats.totalMinutes / 60) : 0}h
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Time</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Avg: {stats && stats.totalWorkouts > 0 ? Math.floor(stats.totalMinutes / stats.totalWorkouts) : 0} min/workout
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <FaBolt className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.caloriesBurned.toLocaleString() || 0}
            </span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Calories Burned</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Avg: {stats && stats.totalWorkouts > 0 ? Math.floor(stats.caloriesBurned / stats.totalWorkouts) : 0} per workout
          </p>
        </motion.div>
      </div>

      {/* Weekly Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-6 mb-8 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Weekly Goal Progress</h2>
            <p className="text-sm opacity-90">
              {stats?.weeklyCompleted || 0} of {stats?.weeklyGoal || 5} workouts completed
            </p>
          </div>
          <div className="text-3xl font-bold">{Math.round(weeklyProgress)}%</div>
        </div>
        <div className="bg-white/20 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-white h-full rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <span
              key={day}
              className={`${index < (stats?.weeklyCompleted || 0) ? 'opacity-100' : 'opacity-50'}`}
            >
              {day}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Workouts</h2>
              <Link to="/workouts/history" className="text-primary-500 hover:underline text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    to={`/workouts/${workout.workoutId}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                        <FaDumbbell className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {workout.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(workout.date), 'MMM d, yyyy')} • {workout.duration} min •{' '}
                          {workout.caloriesBurned} cal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {workout.muscleGroups.slice(0, 2).map((group) => (
                        <span
                          key={group}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs rounded-full"
                        >
                          {group.replace('_', ' ')}
                        </span>
                      ))}
                      <FaChevronRight className="text-gray-400" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent workouts. Start your fitness journey today!
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Workouts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Workouts</h2>
              <Link to="/schedule" className="text-primary-500 hover:underline text-sm">
                Manage schedule
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <FaCalendarAlt className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {workout.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(workout.scheduledDate), 'MMM d, yyyy')} • {workout.duration} min •{' '}
                        {workout.difficulty.charAt(0) + workout.difficulty.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary px-4 py-2 text-sm">
                    Start
                  </button>
                </div>
              ))}
              <Link
                to="/schedule"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
              >
                <FaPlus className="mr-2 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Schedule New Workout</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h2>
              <Link to="/achievements" className="text-primary-500 hover:underline text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => {
                  const Icon = achievementIcons[achievement.icon] || FaTrophy;
                  return (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          achievement.unlocked
                            ? 'bg-yellow-100 dark:bg-yellow-900'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            achievement.unlocked ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-medium text-sm ${
                            achievement.unlocked
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {achievement.name}
                        </h3>
                        {!achievement.unlocked && (
                          <div className="mt-1">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary-500 h-full rounded-full"
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <FaTrophy className="text-yellow-500" />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Complete workouts to earn achievements!
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/workouts"
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaDumbbell className="text-primary-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Browse Workouts</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
              <Link
                to="/progress"
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaChartLine className="text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Track Progress</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
              <Link
                to="/community"
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Join Challenge</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-6 text-white relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Daily Motivation</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousQuote}
                  disabled={currentQuoteIndex === 0}
                  className={`p-1 rounded-full transition-all ${
                    currentQuoteIndex === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-white/20'
                  }`}
                  aria-label="Previous quote"
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextQuote}
                  className="p-1 rounded-full hover:bg-white/20 transition-all"
                  aria-label="Next quote"
                >
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {quotes.length > 0 && quotes[currentQuoteIndex] ? (
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm italic mb-2">
                    "{quotes[currentQuoteIndex].quote}"
                  </p>
                  <p className="text-xs opacity-75">- {quotes[currentQuoteIndex].author}</p>
                  {currentQuoteIndex === 0 && (
                    <p className="text-xs mt-2 opacity-60">Quote of the Day</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="fallback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm italic">
                    "The only bad workout is the one that didn't happen."
                  </p>
                  <p className="text-xs mt-2 opacity-75">- Unknown</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
    </PullToRefresh>
  );
}
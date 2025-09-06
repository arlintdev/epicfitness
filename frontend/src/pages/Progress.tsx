import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp, Flame, Clock, Award, ChevronRight, BarChart3, Activity, Target, Users } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow, format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressRecord {
  id: string;
  workoutId: string;
  workout: {
    id: string;
    title: string;
    duration: number;
    difficulty: string;
  };
  duration: number;
  caloriesBurned: number;
  completedAt: string;
}

interface ProgressStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  averageDuration: number;
  progressByDay: Record<string, number>;
}

interface ProgramEnrollment {
  id: string;
  programId: string;
  startDate: string;
  status: string;
  completedWorkouts: number;
  totalWorkouts: number;
  progressPercentage: number;
  currentWeek: number;
  program: {
    id: string;
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    category: string;
  };
}

export default function Progress() {
  const { user } = useAuthStore();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  // Fetch progress history
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const response = await api.get('/api/progress');
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch progress stats
  const { data: stats, isLoading: statsLoading } = useQuery<ProgressStats>({
    queryKey: ['progress-stats', timePeriod],
    queryFn: async () => {
      const response = await api.get(`/api/progress/stats?period=${timePeriod}`);
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const response = await api.get('/api/users/stats');
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch enrolled programs
  const { data: enrolledPrograms } = useQuery<ProgramEnrollment[]>({
    queryKey: ['enrolled-programs', user?.id],
    queryFn: async () => {
      const response = await api.get('/programs/my-programs');
      return response.data.data;
    },
    enabled: !!user,
  });

  const getChartData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.progressByDay).sort();
    const data = labels.map(date => stats.progressByDay[date]);

    return {
      labels: labels.map(date => format(new Date(date), 'MMM d')),
      datasets: [
        {
          label: 'Workouts',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (progressLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold">{userStats?.totalWorkouts || 0}</p>
            <p className="text-sm text-gray-400">Workouts</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold">{userStats?.totalMinutes || 0}</p>
            <p className="text-sm text-gray-400">Minutes</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-600/20 rounded-lg">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold">{userStats?.totalCalories || 0}</p>
            <p className="text-sm text-gray-400">Calories</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-400">Current</span>
            </div>
            <p className="text-2xl font-bold">{userStats?.currentStreak || 0}</p>
            <p className="text-sm text-gray-400">Day Streak</p>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setTimePeriod('week')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timePeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timePeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimePeriod('year')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timePeriod === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && stats && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
            <div className="h-64">
              {getChartData() && (
                <Line data={getChartData()!} options={chartOptions} />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{stats.totalWorkouts}</p>
                <p className="text-sm text-gray-400">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.averageDuration}</p>
                <p className="text-sm text-gray-400">Avg Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats.totalCalories}</p>
                <p className="text-sm text-gray-400">Calories</p>
              </div>
            </div>
          </div>
        )}

        {/* List View - Recent Workouts */}
        {viewMode === 'list' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
            {progressData?.progress?.length > 0 ? (
              <div className="space-y-4">
                {progressData.progress.map((record: ProgressRecord) => (
                  <div
                    key={record.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{record.workout.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {record.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {record.caloriesBurned} cal
                          </span>
                          <span className="capitalize px-2 py-1 bg-gray-600 rounded">
                            {record.workout.difficulty.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(record.completedAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(record.completedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No workout history yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Complete your first workout to see your progress here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Program Progress Section */}
        {enrolledPrograms && enrolledPrograms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Training Programs Progress
            </h2>
            <div className="space-y-4">
              {enrolledPrograms.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {enrollment.program.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Week {enrollment.currentWeek}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {enrollment.program.duration} weeks
                        </span>
                        <span className={`px-2 py-1 rounded capitalize ${
                          enrollment.program.difficulty === 'EASY' ? 'bg-green-600/20 text-green-500' :
                          enrollment.program.difficulty === 'MEDIUM' ? 'bg-yellow-600/20 text-yellow-500' :
                          enrollment.program.difficulty === 'HARD' ? 'bg-orange-600/20 text-orange-500' :
                          'bg-red-600/20 text-red-500'
                        }`}>
                          {enrollment.program.difficulty.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-500">
                        {enrollment.progressPercentage}%
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {enrollment.completedWorkouts}/{enrollment.totalWorkouts} workouts
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      />
                    </div>
                    
                    {/* Milestone markers */}
                    <div className="absolute inset-0 flex items-center">
                      {[25, 50, 75].map((milestone) => (
                        <div
                          key={milestone}
                          className="absolute h-5 w-px bg-gray-600"
                          style={{ left: `${milestone}%` }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                            {milestone}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievement badges based on progress */}
                  <div className="flex items-center gap-3 mt-4">
                    {enrollment.progressPercentage >= 25 && (
                      <div className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                        <Award className="w-4 h-4" />
                        25% Complete
                      </div>
                    )}
                    {enrollment.progressPercentage >= 50 && (
                      <div className="flex items-center gap-1 text-sm bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                        <Award className="w-4 h-4" />
                        Halfway There!
                      </div>
                    )}
                    {enrollment.progressPercentage >= 75 && (
                      <div className="flex items-center gap-1 text-sm bg-green-600/20 text-green-400 px-2 py-1 rounded">
                        <Award className="w-4 h-4" />
                        Almost Done!
                      </div>
                    )}
                    {enrollment.progressPercentage === 100 && (
                      <div className="flex items-center gap-1 text-sm bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                        <Award className="w-4 h-4" />
                        Completed!
                      </div>
                    )}
                  </div>

                  {/* Status and actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">
                      Started {formatDistanceToNow(new Date(enrollment.startDate), { addSuffix: true })}
                    </span>
                    <button className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'First Workout', icon: '🎯', earned: (userStats?.totalWorkouts || 0) >= 1 },
              { name: '7 Day Streak', icon: '🔥', earned: (userStats?.longestStreak || 0) >= 7 },
              { name: '10 Workouts', icon: '💪', earned: (userStats?.totalWorkouts || 0) >= 10 },
              { name: '1000 Calories', icon: '⚡', earned: (userStats?.totalCalories || 0) >= 1000 },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`bg-gray-800 rounded-lg p-4 text-center ${
                  achievement.earned ? 'ring-2 ring-yellow-500' : 'opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-semibold">{achievement.name}</p>
                {achievement.earned && (
                  <p className="text-xs text-yellow-500 mt-1">Earned!</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
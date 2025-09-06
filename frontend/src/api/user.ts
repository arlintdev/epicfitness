import api from '../lib/api';

export interface UserStats {
  totalWorkouts: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  caloriesBurned: number;
  personalRecords: number;
  monthlyWorkouts: number;
}

export interface RecentWorkout {
  id: string;
  workoutId: string;
  name: string;
  date: string;
  duration: number;
  caloriesBurned: number;
  muscleGroups: string[];
  difficulty: string;
}

export interface UpcomingWorkout {
  id: string;
  name: string;
  scheduledDate: string;
  duration: number;
  difficulty: string;
  programName?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  progress: number;
  earnedAt?: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  category?: string;
}

export const userApi = {
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats');
    return response.data.data;
  },

  getRecentWorkouts: async (limit: number = 5): Promise<RecentWorkout[]> => {
    const response = await api.get(`/users/recent-workouts?limit=${limit}`);
    return response.data.data;
  },

  getUpcomingWorkouts: async (): Promise<UpcomingWorkout[]> => {
    // Try to get scheduled workouts first
    try {
      const response = await api.get('/schedules/upcoming');
      return response.data.data.map((schedule: any) => ({
        id: schedule.id,
        name: schedule.workout.title,
        scheduledDate: schedule.scheduledDate,
        duration: schedule.duration,
        difficulty: schedule.workout.difficulty,
      }));
    } catch (error) {
      // Fallback to program-based upcoming workouts
      try {
        const response = await api.get('/users/upcoming-workouts');
        return response.data.data;
      } catch (err) {
        return [];
      }
    }
  },

  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/users/achievements');
    return response.data.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  getProfile: async (userId?: string) => {
    const url = userId ? `/users/profile/${userId}` : '/users/profile';
    const response = await api.get(url);
    return response.data.data;
  },

  getDailyQuote: async (): Promise<MotivationalQuote> => {
    const response = await api.get('/quotes/daily');
    return response.data.data;
  },

  getRandomQuotes: async (count: number = 5, excludeId?: string): Promise<MotivationalQuote[]> => {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await api.get(`/quotes/random?${params.toString()}`);
    return response.data.data;
  }
};
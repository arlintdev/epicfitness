import api from '../services/api';

export interface DashboardStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalWorkouts: number;
    totalExercises: number;
    totalPrograms: number;
    userGrowthPercentage: string;
  };
  recentSessions: any[];
  popularWorkouts: any[];
  userGrowth: any[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  _count: {
    workoutSessions: number;
    createdWorkouts: number;
  };
}

export interface AdminWorkout {
  id: string;
  name: string;
  description?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  creator: {
    id: string;
    username: string;
  };
  _count: {
    workoutSessions: number;
    favoritedBy: number;
  };
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  // User management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  },

  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },

  // Workout management
  getWorkouts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
  }) => {
    const { data } = await api.get('/admin/workouts', { params });
    return data;
  },

  toggleWorkoutFeatured: async (workoutId: string) => {
    const { data } = await api.put(`/admin/workouts/${workoutId}/featured`);
    return data;
  },

  toggleWorkoutPublished: async (workoutId: string) => {
    const { data } = await api.put(`/admin/workouts/${workoutId}/published`);
    return data;
  },

  deleteWorkout: async (workoutId: string) => {
    const { data } = await api.delete(`/admin/workouts/${workoutId}`);
    return data;
  },

  // System
  getSystemHealth: async () => {
    const { data } = await api.get('/admin/health');
    return data;
  }
};
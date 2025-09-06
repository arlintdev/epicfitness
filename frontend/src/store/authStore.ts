import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'TRAINER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  fetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (emailOrUsername, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { emailOrUsername, password });
          const { user, tokens } = response.data.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', data);
          const { user, tokens } = response.data.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Continue logout even if API call fails
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
          
          // Don't redirect on initial check, let the interceptor handle it
          if (error.response?.status === 401 && !error.config?._retry) {
            // Session expired will be handled by the interceptor
          }
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
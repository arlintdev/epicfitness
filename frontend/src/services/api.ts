import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirecting = false;

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token requests
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Prevent multiple redirects
        if (!isRedirecting) {
          isRedirecting = true;
          
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Clear auth store
          const authStore = useAuthStore.getState();
          authStore.setUser(null);
          
          // Show notification
          toast.error('Your session has expired. Please log in again.');
          
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
            isRedirecting = false;
          }, 1000);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Show error message for non-401 errors
    const message = error.response?.data?.error?.message || 
                   error.response?.data?.message || 
                   'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const exerciseApi = {
  getAll: async () => {
    const response = await api.get('/exercises');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/exercises', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/exercises/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  }
};

export default api;
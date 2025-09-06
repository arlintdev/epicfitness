import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaDumbbell, FaSignInAlt, FaUser, FaInstagram, FaGoogle } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Validation schema
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.emailOrUsername, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api/v1';
    window.location.href = `${apiUrl}/auth/instagram`;
  };

  // Demo credentials hint
  const fillDemoCredentials = () => {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const emailInput = form.elements.namedItem('emailOrUsername') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    emailInput.value = 'demo@epicfitness.com';
    passwordInput.value = 'Demo123!';
    
    toast.success('Demo credentials filled! Click Sign In to continue.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <FaDumbbell className="h-8 w-8 text-primary-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue your fitness journey</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Field */}
            <div>
              <label className="label">Email or Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register('emailOrUsername')}
                  type="text"
                  name="emailOrUsername"
                  className={`input pl-10 ${errors.emailOrUsername ? 'border-red-500' : ''}`}
                  placeholder="john@example.com or johndoe"
                  disabled={isLoading}
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-500">{errors.emailOrUsername.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={fillDemoCredentials}
              className="w-full btn-outline py-2 text-sm"
            >
              Use Demo Account
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Try the platform with a demo account
            </p>
          </div>

          {/* Social Login Options (Future Enhancement) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium opacity-50 cursor-not-allowed"
                disabled
              >
                <FaInstagram className="w-5 h-5 mr-2" />
                Continue with Instagram (Coming Soon)
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 opacity-50 cursor-not-allowed"
                disabled
              >
                <FaGoogle className="w-5 h-5 mr-2" />
                Continue with Google (Coming Soon)
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:underline font-semibold">
                Sign Up Free
              </Link>
            </p>
          </div>
        </div>

        {/* Features Reminder */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Join thousands of users achieving their goals</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
            <span>✓ 500+ Workouts</span>
            <span>✓ Progress Tracking</span>
            <span>✓ Community</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
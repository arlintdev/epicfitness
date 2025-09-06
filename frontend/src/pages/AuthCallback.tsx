import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (accessToken && refreshToken) {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update auth store
        setTokens(accessToken, refreshToken);
        
        // Fetch user data
        try {
          const authStore = useAuthStore.getState();
          await authStore.fetchUser();
          
          toast.success('Welcome! You have successfully logged in with Instagram.');
          navigate('/dashboard');
        } catch (err) {
          toast.error('Failed to fetch user data. Please try logging in again.');
          navigate('/login');
        }
      } else {
        toast.error('Invalid authentication response. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setTokens]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
        <FaSpinner className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Authenticating...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your login
        </p>
      </div>
    </div>
  );
}
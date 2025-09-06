import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSave, 
  FaCamera, 
  FaRocket,
  FaBolt,
  FaFire,
  FaDumbbell,
  FaRunning,
  FaMedal,
  FaChartLine,
  FaCalendarAlt,
  FaWeight,
  FaRuler,
  FaBirthdayCake,
  FaVenusMars,
  FaEnvelope,
  FaUserCircle,
  FaSpinner,
  FaTachometerAlt
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import { useLudicrous } from '../contexts/LudicrousContext';

type AppMode = 'normal' | 'ludicrous';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessLevel?: string;
  goals?: string[];
  availableEquipment?: string[];
  preferences?: {
    appMode?: AppMode;
    weeklyGoal?: number;
    units?: 'metric' | 'imperial';
    [key: string]: any;
  };
  totalWorkouts?: number;
  followers?: number;
  following?: number;
}

const fitnessGoals = [
  'Lose Weight',
  'Build Muscle',
  'Increase Endurance',
  'Improve Flexibility',
  'Get Stronger',
  'Train for Event',
  'General Health',
  'Stress Relief',
  'Better Sleep',
  'Increase Energy'
];

const availableEquipmentOptions = [
  'Barbell',
  'Dumbbells',
  'Kettlebell',
  'Pull-up Bar',
  'Bench',
  'Medicine Ball',
  'Resistance Bands',
  'Cable Machine',
  'Squat Rack',
  'Leg Press',
  'Bodyweight Only'
];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { setLudicrousMode } = useLudicrous();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    height: 0,
    weight: 0,
    fitnessLevel: 'BEGINNER',
    goals: [] as string[],
    availableEquipment: [] as string[],
    preferences: {
      appMode: 'normal' as AppMode,
      weeklyGoal: 5,
      units: 'metric' as 'metric' | 'imperial'
    }
  });

  const appMode = formData.preferences?.appMode || 'normal';
  const isLudicrous = appMode === 'ludicrous';

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Apply ludicrous mode effects
    if (isLudicrous && editMode) {
      document.body.classList.add('ludicrous-mode');
    } else {
      document.body.classList.remove('ludicrous-mode');
    }

    return () => {
      document.body.classList.remove('ludicrous-mode');
    };
  }, [isLudicrous, editMode]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        bio: data.bio || '',
        availableEquipment: data.availableEquipment || [],
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || '',
        height: data.height || 0,
        weight: data.weight || 0,
        fitnessLevel: data.fitnessLevel || 'BEGINNER',
        goals: data.goals || [],
        preferences: {
          appMode: data.preferences?.appMode || 'normal',
          weeklyGoal: data.preferences?.weeklyGoal || 5,
          units: data.preferences?.units || 'metric',
          ...data.preferences
        }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'height' || name === 'weight' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(equipment)
        ? prev.availableEquipment.filter(e => e !== equipment)
        : [...prev.availableEquipment, equipment]
    }));
  };

  const handleModeToggle = () => {
    const newMode = formData.preferences.appMode === 'normal' ? 'ludicrous' : 'normal';
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        appMode: newMode
      }
    }));
    
    // Update global context
    setLudicrousMode(newMode === 'ludicrous');

    // Show immediate feedback
    if (newMode === 'ludicrous') {
      document.body.style.animation = 'shake 0.5s';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await userApi.updateProfile(formData);
      setProfile(response.data);
      updateUser(response.data);
      setEditMode(false);
      
      // Update global ludicrous mode
      setLudicrousMode(formData.preferences.appMode === 'ludicrous');
      
      // Show success animation
      if (isLudicrous) {
        document.body.style.animation = 'rainbow 1s';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 ${isLudicrous ? 'ludicrous-active' : ''}`}>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
        .ludicrous-mode {
          animation: rainbow 10s linear infinite;
        }
        .ludicrous-active .card-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .mode-toggle-ludicrous {
          background: linear-gradient(45deg, #f97316, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981, #f97316);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-glow">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-accent-500">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-4 flex items-end space-x-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <FaUserCircle className="w-20 h-20 text-gray-400" />
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors">
                  <FaCamera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-white pb-2">
              <h1 className="text-2xl font-bold">
                {profile?.firstName || profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.username}
              </h1>
              <p className="text-sm opacity-90">@{profile?.username}</p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaTachometerAlt className="text-gray-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">App Mode</span>
            </div>
            <button
              onClick={handleModeToggle}
              className={`relative inline-flex items-center h-8 rounded-full w-16 transition-all duration-300 ${
                isLudicrous ? 'mode-toggle-ludicrous' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`${
                  isLudicrous ? 'translate-x-9' : 'translate-x-1'
                } inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 shadow-lg`}
              />
              <AnimatePresence>
                {isLudicrous && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute right-2"
                  >
                    <FaRocket className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isLudicrous ? '🚀 LUDICROUS MODE ACTIVATED!' : 'Normal mode - Switch to ludicrous for extreme motivation!'}
          </p>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile?.totalWorkouts || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Workouts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile?.followers || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile?.following || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    fetchProfile(); // Reset form
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editMode}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Physical Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaBirthdayCake className="inline mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaVenusMars className="inline mr-2" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaChartLine className="inline mr-2" />
                  Fitness Level
                </label>
                <select
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaRuler className="inline mr-2" />
                  Height ({formData.preferences.units === 'metric' ? 'cm' : 'inches'})
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaWeight className="inline mr-2" />
                  Weight ({formData.preferences.units === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="75"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaMedal className="inline mr-2" />
                Fitness Goals
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {fitnessGoals.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    disabled={!editMode}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.goals.includes(goal)
                        ? isLudicrous
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-105'
                          : 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    } ${!editMode ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaDumbbell className="inline mr-2" />
                Available Equipment
                <span className="ml-2 text-xs text-gray-500">Select the equipment you have access to</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableEquipmentOptions.map(equipment => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleEquipmentToggle(equipment)}
                    disabled={!editMode}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.availableEquipment.includes(equipment)
                        ? isLudicrous
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-105'
                          : 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    } ${!editMode ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Weekly Workout Goal
                </label>
                <input
                  type="number"
                  name="preferences.weeklyGoal"
                  value={formData.preferences.weeklyGoal}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  min="1"
                  max="7"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Units
                </label>
                <select
                  name="preferences.units"
                  value={formData.preferences.units}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Ludicrous Mode Easter Eggs */}
        {isLudicrous && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 pb-6"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <FaRocket className="animate-bounce" />
                  <FaBolt className="animate-pulse" />
                  <FaFire className="animate-bounce" />
                  <span className="font-bold">LUDICROUS MODE ACTIVATED!</span>
                  <FaFire className="animate-bounce" />
                  <FaBolt className="animate-pulse" />
                  <FaRocket className="animate-bounce" />
                </div>
                <p className="text-sm">
                  You're now operating at maximum motivation! Your workouts will be 1000% more epic! 
                  {' '}{isLudicrous && '🚀🔥💪'}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
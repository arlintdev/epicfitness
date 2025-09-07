import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell,
  FaClock,
  FaFire,
  FaChartLine,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaChevronLeft,
  FaUsers,
  FaSpinner,
  FaExclamationCircle,
  FaUser,
  FaListUl,
  FaInfoCircle,
  FaEdit,
  FaSave,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Exercise {
  id: string;
  exercise: {
    id: string;
    name: string;
    description: string;
    primaryMuscle: string;
    secondaryMuscles?: string[];
    equipment?: string;
    instructions?: string[];
    tips?: string[];
  };
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  order: number;
  notes?: string;
}

interface WorkoutDetails {
  id: string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  instructions?: string;
  image?: string;
  imageUrl?: string;
  videoUrl?: string;
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  category?: string;
  targetMuscles: string[];
  equipment: string[];
  caloriesBurn?: number;
  exercises: Exercise[];
  isPublic?: boolean;
  creator?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  averageRating?: number;
  isFavorited?: boolean;
  userRating?: number;
  _count?: {
    workoutSessions?: number;
    sessions?: number;
    favoritedBy: number;
    ratings: number;
    comments: number;
  };
}

const difficultyConfig = {
  EASY: {
    label: 'Easy',
    color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  HARD: {
    label: 'Hard',
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800',
  },
  EXTREME: {
    label: 'Extreme',
    color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
};

const muscleGroupColors: { [key: string]: string } = {
  CHEST: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  BACK: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  SHOULDERS: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  ARMS: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
  CORE: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  LEGS: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  GLUTES: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  FULL_BODY: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
};

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'exercises' | 'instructions'>('exercises');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [localIsFavorited, setLocalIsFavorited] = useState<boolean>(false);
  const [localUserRating, setLocalUserRating] = useState<number>(0);
  const [localFavoriteCount, setLocalFavoriteCount] = useState<number>(0);
  
  // Edit states - admins and workout owners can edit
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState<WorkoutDetails | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch workout details
  const { data: workout, isLoading, error } = useQuery<WorkoutDetails>({
    queryKey: ['workout', id],
    queryFn: async () => {
      const response = await api.get(`/workouts/${id}`);
      const data = response.data.data || response.data;
      // Set local state when data loads
      setLocalIsFavorited(data.isFavorited || false);
      setLocalUserRating(data.userRating || 0);
      setLocalFavoriteCount(data._count?.favoritedBy || 0);
      setEditedWorkout(data); // Initialize edited workout
      // Check if user is the owner
      setIsOwner(user?.id === data.creator?.id);
      return data;
    },
  });

  // Update workout mutation
  const updateWorkoutMutation = useMutation({
    mutationFn: async (updatedWorkout: Partial<WorkoutDetails>) => {
      const response = await api.put(`/workouts/${id}`, updatedWorkout);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      toast.success('Workout updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update workout');
    },
  });

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/workouts/${id}`);
    },
    onSuccess: () => {
      toast.success('Workout deleted successfully');
      navigate('/workouts');
    },
    onError: () => {
      toast.error('Failed to delete workout');
    },
  });

  const handleSaveWorkout = () => {
    if (editedWorkout) {
      updateWorkoutMutation.mutate(editedWorkout);
    }
  };

  const handleDeleteWorkout = () => {
    if (window.confirm(`Are you sure you want to delete "${workout?.title || workout?.name}"?`)) {
      deleteWorkoutMutation.mutate();
    }
  };

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (isFavorited: boolean) => {
      if (isFavorited) {
        await api.delete(`/workouts/${id}/favorite`);
      } else {
        await api.post(`/workouts/${id}/favorite`);
      }
    },
    onMutate: async (isFavorited) => {
      // Optimistically update the UI
      setLocalIsFavorited(!isFavorited);
      setLocalFavoriteCount(prev => isFavorited ? prev - 1 : prev + 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      toast.success(localIsFavorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (_, isFavorited) => {
      // Revert on error
      setLocalIsFavorited(isFavorited);
      setLocalFavoriteCount(prev => isFavorited ? prev + 1 : prev - 1);
      toast.error('Failed to update favorites');
    },
  });

  // Rating mutation
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      await api.post(`/workouts/${id}/rate`, { rating });
    },
    onMutate: async (rating) => {
      // Optimistically update the UI
      setLocalUserRating(rating);
    },
    onSuccess: (_, rating) => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}!`);
    },
    onError: () => {
      // Revert on error
      setLocalUserRating(workout?.userRating || 0);
      toast.error('Failed to submit rating');
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }
    favoriteMutation.mutate(localIsFavorited);
  };

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate workouts');
      navigate('/login');
      return;
    }
    if (rating === localUserRating) {
      // Remove rating if clicking the same star
      setLocalUserRating(0);
      rateMutation.mutate(0);
    } else {
      rateMutation.mutate(rating);
    }
  };

  const handleStartWorkout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to start workout');
      navigate('/login');
      return;
    }
    navigate(`/workout/${id}/session`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to load workout
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-6">
            {error instanceof Error ? error.message : 'Workout not found'}
          </p>
          <Link to="/workouts" className="btn-primary">
            Back to Workouts
          </Link>
        </div>
      </div>
    );
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + (ex.sets || 1), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Image */}
      <div className="relative h-64 md:h-96 lg:h-[28rem] overflow-hidden">
        {workout.image || workout.imageUrl ? (
          <img
            src={workout.image?.startsWith('data:') ? workout.image : workout.imageUrl}
            alt={workout.title || workout.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 flex items-center justify-center">
            <FaDumbbell className="h-32 w-32 text-white/20" />
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Link
              to="/workouts"
              className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
            >
              <FaChevronLeft className="mr-2" />
              Back to Workouts
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                {isEditing && (isAdmin || isOwner) ? (
                  <>
                    <input
                      type="text"
                      value={editedWorkout?.title || editedWorkout?.name || ''}
                      onChange={(e) => setEditedWorkout({ ...editedWorkout!, title: e.target.value })}
                      className="text-3xl md:text-4xl lg:text-5xl font-bold bg-white/20 backdrop-blur-sm text-white mb-2 px-2 py-1 rounded border border-white/30 w-full"
                    />
                    <textarea
                      value={editedWorkout?.description || ''}
                      onChange={(e) => setEditedWorkout({ ...editedWorkout!, description: e.target.value })}
                      className="text-gray-200 text-lg mb-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded border border-white/30 w-full resize-none"
                      rows={2}
                    />
                    {/* Privacy Toggle - Only for non-admin users */}
                    {!isAdmin && isOwner && (
                      <div className="flex items-center gap-2 mb-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editedWorkout?.isPublic || false}
                            onChange={(e) => setEditedWorkout({ ...editedWorkout!, isPublic: e.target.checked })}
                            className="mr-2 w-4 h-4"
                          />
                          <span className="text-white text-sm">
                            Make this workout public (allow others to see and use it)
                          </span>
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                      {workout.title || workout.name}
                    </h1>
                    <p className="text-gray-200 text-lg mb-4 line-clamp-2">
                      {workout.description}
                    </p>
                  </>
                )}
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyConfig[workout.difficulty].color}`}>
                    {difficultyConfig[workout.difficulty].label}
                  </span>
                  {workout.category && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
                      {workout.category}
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 text-white text-sm">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-4 h-4" />
                    <span>{workout.duration} min</span>
                  </div>
                  {workout.caloriesBurn && (
                    <div className="flex items-center gap-1">
                      <FaFire className="w-4 h-4 text-orange-400" />
                      <span>{workout.caloriesBurn} cal</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FaListUl className="w-4 h-4" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="w-4 h-4" />
                    <span>{workout._count?.workoutSessions || workout._count?.sessions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {(isAdmin || isOwner) ? (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveWorkout}
                          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                          disabled={updateWorkoutMutation.isPending}
                        >
                          <FaSave className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedWorkout(workout);
                          }}
                          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                          <FaTimes className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                          <FaEdit className="w-4 h-4" />
                          Edit Workout
                        </button>
                        <button
                          onClick={handleDeleteWorkout}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                          disabled={deleteWorkoutMutation.isPending}
                        >
                          <FaTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFavorite}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all transform hover:scale-110"
                      disabled={favoriteMutation.isPending}
                    >
                      {localIsFavorited ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <FaHeart className="h-6 w-6 text-red-500" />
                        </motion.div>
                      ) : (
                        <FaRegHeart className="h-6 w-6 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleStartWorkout}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <FaPlay className="w-4 h-4" />
                      Start Workout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('exercises')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all ${
                      activeTab === 'exercises'
                        ? 'text-primary-500 border-b-2 border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaDumbbell className="w-4 h-4" />
                      <span>Exercises ({workout.exercises.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all ${
                      activeTab === 'instructions'
                        ? 'text-primary-500 border-b-2 border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaInfoCircle className="w-4 h-4" />
                      <span>Instructions</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'exercises' ? (
                    <motion.div
                      key="exercises"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {workout.exercises.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => setExpandedExercise(expandedExercise === item.id ? null : item.id)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Exercise Number */}
                              <div className="flex-shrink-0">
                                <span className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full font-bold">
                                  {item.order}
                                </span>
                              </div>

                              {/* Exercise Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                      {item.exercise.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                      {item.exercise.description}
                                    </p>
                                  </div>
                                  <FaChevronLeft 
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                      expandedExercise === item.id ? 'rotate-90' : '-rotate-90'
                                    }`}
                                  />
                                </div>

                                {/* Exercise Metrics */}
                                <div className="flex flex-wrap gap-3 text-sm">
                                  {item.sets && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">Sets:</span>
                                      <span className="text-gray-600 dark:text-gray-400">{item.sets}</span>
                                    </div>
                                  )}
                                  {item.reps && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">Reps:</span>
                                      <span className="text-gray-600 dark:text-gray-400">{item.reps}</span>
                                    </div>
                                  )}
                                  {item.duration && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">Duration:</span>
                                      <span className="text-gray-600 dark:text-gray-400">{item.duration}s</span>
                                    </div>
                                  )}
                                  {item.restTime && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">Rest:</span>
                                      <span className="text-gray-600 dark:text-gray-400">{item.restTime}s</span>
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {item.exercise.primaryMuscle && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      muscleGroupColors[item.exercise.primaryMuscle] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {item.exercise.primaryMuscle}
                                    </span>
                                  )}
                                  {item.exercise.equipment && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                      {item.exercise.equipment}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {expandedExercise === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    {item.exercise.instructions && item.exercise.instructions.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Instructions:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                          {item.exercise.instructions.map((instruction, idx) => (
                                            <li key={idx}>{instruction}</li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}

                                    {item.exercise.tips && item.exercise.tips.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Tips:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                          {item.exercise.tips.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                          <span className="font-semibold">Note:</span> {item.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="instructions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="prose dark:prose-invert max-w-none"
                    >
                      {workout.instructions ? (
                        <div className="text-gray-700 dark:text-gray-300">
                          {workout.instructions.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaInfoCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No specific instructions provided for this workout.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {(isAdmin || isOwner) ? (
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveWorkout}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 rounded-lg transform transition-all hover:scale-[1.02]"
                        disabled={updateWorkoutMutation.isPending}
                      >
                        <FaSave className="w-5 h-5" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedWorkout(workout);
                        }}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 rounded-lg transform transition-all hover:scale-[1.02]"
                      >
                        <FaTimes className="w-5 h-5" />
                        Cancel Editing
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 rounded-lg transform transition-all hover:scale-[1.02]"
                      >
                        <FaEdit className="w-5 h-5" />
                        Edit This Workout
                      </button>
                      <button
                        onClick={handleStartWorkout}
                        className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3 transform transition-all hover:scale-[1.02]"
                      >
                        <FaPlay className="w-5 h-5" />
                        Preview Workout
                      </button>
                      <button
                        onClick={handleDeleteWorkout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 rounded-lg transform transition-all hover:scale-[1.02]"
                        disabled={deleteWorkoutMutation.isPending}
                      >
                        <FaTrash className="w-5 h-5" />
                        Delete Workout
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleStartWorkout}
                  className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3 transform transition-all hover:scale-[1.02]"
                >
                  <FaPlay className="w-5 h-5" />
                  Start Workout Now
                </button>
              )}
            </div>

            {/* Workout Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="w-5 h-5 text-primary-500" />
                Workout Stats
              </h3>
              
              {/* Rating */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        onClick={() => handleRating(star)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`${
                          localUserRating >= star
                            ? 'text-yellow-500'
                            : (workout?.averageRating || 0) >= star
                            ? 'text-yellow-300'
                            : 'text-gray-300 dark:text-gray-600'
                        } hover:text-yellow-500 transition-colors`}
                        disabled={!isAuthenticated}
                      >
                        <FaStar className="w-4 h-4" />
                      </motion.button>
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {workout?.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Login to rate this workout</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{workout.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Exercises</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{workout.exercises.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Sets</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totalSets}</span>
                </div>
                {workout.caloriesBurn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Est. Calories</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{workout.caloriesBurn} cal</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {workout._count?.workoutSessions || workout._count?.sessions || 0} times
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Favorites</span>
                  <motion.span 
                    key={localFavoriteCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    {localFavoriteCount}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Equipment Needed */}
            {workout.equipment.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {workout.equipment.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Target Muscles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Target Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {workout.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      muscleGroupColors[muscle] || 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    }`}
                  >
                    {muscle.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Creator Info */}
            {workout.creator && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Created By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                    {workout.creator.avatar ? (
                      <img
                        src={workout.creator.avatar}
                        alt={workout.creator.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {workout.creator.firstName && workout.creator.lastName
                        ? `${workout.creator.firstName} ${workout.creator.lastName}`
                        : workout.creator.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{workout.creator.username}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
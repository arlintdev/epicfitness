import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/common/PullToRefresh';
import {
  FaDumbbell,
  FaSearch,
  FaFilter,
  FaClock,
  FaFire,
  FaChartLine,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaLock,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import toast from 'react-hot-toast';

// Types
interface Workout {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  category?: string;
  targetMuscles: string[];
  equipment: string[];
  caloriesBurn?: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  isPublic?: boolean;
  creatorId?: string;
  creator?: {
    id: string;
    username: string;
    role?: string;
  };
  _count?: {
    sessions: number;
    favoritedBy: number;
    ratings: number;
  };
}

const difficultyColors = {
  EASY: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  HARD: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  EXTREME: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
};

const difficultyGradients = {
  EASY: 'from-green-400 to-emerald-500',
  MEDIUM: 'from-yellow-400 to-amber-500',
  HARD: 'from-orange-400 to-red-500',
  EXTREME: 'from-red-500 to-purple-600',
};

export default function WorkoutLibrary() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userEquipment, setUserEquipment] = useState<string[]>([]);
  const [workoutView, setWorkoutView] = useState<'all' | 'my' | 'community'>('all');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      await api.delete(`/workouts/${workoutId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete workout');
    },
  });

  const handleDeleteWorkout = (workoutId: string, workoutTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${workoutTitle}"?`)) {
      deleteWorkoutMutation.mutate(workoutId);
    }
  };

  // Fetch user profile to get available equipment
  useEffect(() => {
    if (user) {
      userApi.getProfile().then(profile => {
        setUserEquipment(profile.availableEquipment || []);
      }).catch(err => console.error('Failed to fetch user equipment:', err));
    }
  }, [user]);

  // Fetch all workouts from backend (only once, no filters)
  const { data: workouts, isLoading, error } = useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Request all workouts by setting a high limit
      params.append('limit', '1000');
      
      const response = await api.get(`/workouts?${params.toString()}`);
      return response.data;
    },
  });

  // Derive filter options from actual workout data
  const categories = ['All', ...new Set(workouts?.map(w => w.category).filter(Boolean) || [])];
  const muscleGroups = [...new Set(workouts?.flatMap(w => w.targetMuscles) || [])].sort();
  const difficulties = ['All', ...new Set(workouts?.map(w => w.difficulty) || [])];

  // Check if user has required equipment for a workout
  const hasRequiredEquipment = (workout: Workout) => {
    if (!user || userEquipment.length === 0) return true; // If not logged in or no equipment set, show all
    if (!workout.equipment || workout.equipment.length === 0) return true;
    if (workout.equipment.includes('None') || workout.equipment.includes('Bodyweight')) return true;
    
    // Check if user has at least one piece of required equipment
    return workout.equipment.some(equip => 
      userEquipment.includes(equip) || userEquipment.includes('Bodyweight Only')
    );
  };

  // Filter workouts locally for immediate feedback
  const filteredWorkouts = workouts?.filter(workout => {
    // View filtering
    if (workoutView === 'my') {
      // Show user's own workouts (both public and private)
      if (!user || workout.creatorId !== user.id) return false;
    } else if (workoutView === 'community') {
      // Show public workouts from non-admin users
      if (!workout.isPublic || workout.creator?.role === 'ADMIN' || workout.creator?.role === 'SUPER_ADMIN') return false;
    } else {
      // 'all' view - show public workouts and user's private workouts
      if (!workout.isPublic && workout.creatorId !== user?.id) return false;
    }

    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || workout.difficulty === selectedDifficulty;
    const matchesMuscleGroups = selectedMuscleGroups.length === 0 ||
                                selectedMuscleGroups.some(group => workout.targetMuscles.includes(group));
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscleGroups;
  });

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedMuscleGroups([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || 
                           selectedDifficulty !== 'All' || selectedMuscleGroups.length > 0;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['workouts'] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Workout Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Manage and organize your workout library' : 'Discover workouts tailored to your fitness goals'}
          </p>
        </div>
        {user && (
          <button
            onClick={() => navigate('/create-workout')}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            Create Workout
          </button>
        )}
      </div>

      {/* View Tabs */}
      {user && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setWorkoutView('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              workoutView === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Workouts
          </button>
          <button
            onClick={() => setWorkoutView('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              workoutView === 'my'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            My Workouts
          </button>
          <button
            onClick={() => setWorkoutView('community')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              workoutView === 'community'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Community
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Difficulty Select */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white capitalize"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'All' ? 'All Levels' : difficulty.toLowerCase()}
              </option>
            ))}
          </select>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FaFilter />
            <span>Filters</span>
            {selectedMuscleGroups.length > 0 && (
              <span className="bg-white text-primary-500 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedMuscleGroups.length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FaTimes />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Muscle Groups Filter */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Muscle Groups
            </p>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => toggleMuscleGroup(group)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedMuscleGroups.includes(group)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      {!isLoading && !error && filteredWorkouts && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Found {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin h-12 w-12 text-primary-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading workouts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to load workouts
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredWorkouts?.length === 0 && (
        <div className="text-center py-20">
          <FaDumbbell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No workouts found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Workouts Grid */}
      {!isLoading && !error && filteredWorkouts && filteredWorkouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout, index) => {
            const canDoWorkout = hasRequiredEquipment(workout);
            
            return (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                  !canDoWorkout ? 'opacity-60' : ''
                }`}
              >
              {/* Workout Image */}
              <div className={`h-48 bg-gradient-to-br ${difficultyGradients[workout.difficulty]} relative`}>
                {workout.image || workout.imageUrl ? (
                  <img
                    src={workout.image?.startsWith('data:') ? workout.image : workout.imageUrl}
                    alt={workout.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaDumbbell className="h-20 w-20 text-white/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[workout.difficulty]}`}>
                    {workout.difficulty.toLowerCase()}
                  </span>
                  {/* Community Badge */}
                  {workout.isPublic && workout.creator && workout.creator.role !== 'ADMIN' && workout.creator.role !== 'SUPER_ADMIN' && (
                    <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold">
                      Community
                    </span>
                  )}
                  {/* Private Badge */}
                  {!workout.isPublic && workout.creatorId === user?.id && (
                    <span className="px-2 py-1 bg-gray-600 text-white rounded-full text-xs font-semibold">
                      Private
                    </span>
                  )}
                </div>
                
                {/* Star Rating at bottom of image */}
                {workout.averageRating && workout.averageRating > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(workout.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-white text-sm font-medium">
                      {workout.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Workout Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {workout.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {workout.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-primary-500" />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaFire className="text-orange-500" />
                    <span>{workout.caloriesBurn || 'N/A'} cal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaChartLine className="text-green-500" />
                    <span>{workout._count?.sessions || 0} done</span>
                  </div>
                </div>

                {/* Muscle Groups */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {workout.targetMuscles.slice(0, 3).map(group => (
                    <span
                      key={group}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                    >
                      {group}
                    </span>
                  ))}
                  {workout.targetMuscles.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                      +{workout.targetMuscles.length - 3} more
                    </span>
                  )}
                </div>

                {/* Equipment Warning */}
                {!canDoWorkout && (
                  <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
                      <FaLock className="flex-shrink-0" />
                      <span>Missing equipment: {workout.equipment.filter(eq => 
                        eq !== 'None' && eq !== 'Bodyweight' && !userEquipment.includes(eq)
                      ).join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isAdmin || workout.creatorId === user?.id ? (
                  <div className="flex gap-2">
                    <Link
                      to={`/workout/${workout.id}`}
                      className="flex-1 btn-secondary text-center flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id, workout.title)}
                      className="flex-1 btn-danger text-center flex items-center justify-center gap-2"
                      disabled={deleteWorkoutMutation.isPending}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                ) : (
                <Link
                  to={`/workout/${workout.id}`}
                  className={`w-full text-center ${
                    canDoWorkout 
                      ? 'btn-primary' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed inline-block'
                  }`}
                  onClick={!canDoWorkout ? (e) => e.preventDefault() : undefined}
                >
                  {canDoWorkout ? 'View Workout' : 'Equipment Required'}
                </Link>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
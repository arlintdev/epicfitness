import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
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
  FaCalendarAlt,
  FaPlus,
  FaPlay,
  FaEdit,
  FaCheck,
  FaList,
  FaCalendarWeek,
} from 'react-icons/fa';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import toast from 'react-hot-toast';
import ScheduleWorkoutModal from '../components/ScheduleWorkoutModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Calendar Setup
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Types
interface Workout {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  duration: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category?: string;
  targetMuscles: string[];
  equipment: string[];
  caloriesBurn?: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  _count?: {
    sessions: number;
    favoritedBy: number;
    ratings: number;
  };
}

interface ScheduledWorkout {
  id: string;
  workoutId: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  notes?: string;
  workout: {
    id: string;
    title: string;
    difficulty: string;
    targetMuscles: string[];
    equipment: string[];
    caloriesBurn?: number;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  difficulty: string;
  workoutId: string;
}

// Constants
const difficultyColors = {
  BEGINNER: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  ADVANCED: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  EXPERT: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  EXTREME: 'bg-red-100 text-red-800',
};

const statusColors = {
  SCHEDULED: '#3B82F6',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  CANCELLED: '#6B7280',
  MISSED: '#EF4444',
};

const categories = [
  'All',
  'Strength',
  'Cardio',
  'HIIT',
  'Yoga',
  'Flexibility',
  'CrossFit',
  'Powerlifting',
  'Bodybuilding',
  'Calisthenics',
];

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Core',
  'Legs',
  'Glutes',
  'Full Body',
];

const difficulties = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

type ViewType = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

export default function WorkoutsAndSchedule() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Schedule State
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledWorkout | null>(null);
  const [showSchedule, setShowSchedule] = useState(true);
  
  // Workout Library State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userEquipment, setUserEquipment] = useState<string[]>([]);

  // Fetch user profile to get available equipment
  useEffect(() => {
    if (user) {
      userApi.getProfile().then(profile => {
        setUserEquipment(profile.availableEquipment || []);
      }).catch(err => console.error('Failed to fetch user equipment:', err));
    }
  }, [user]);

  // Fetch scheduled workouts
  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduledWorkout[]>({
    queryKey: ['schedules', date.getMonth(), date.getFullYear()],
    queryFn: async () => {
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const response = await api.get('/schedules', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.data;
    },
    enabled: !!user,
  });

  // Fetch all workouts
  const { data: workouts, isLoading: workoutsLoading, error } = useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      const response = await api.get(`/workouts?${params.toString()}`);
      return response.data;
    },
  });

  // Cancel schedule mutation
  const cancelMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await api.delete(`/schedules/${scheduleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Workout cancelled');
      setSelectedSchedule(null);
    },
    onError: () => {
      toast.error('Failed to cancel workout');
    },
  });

  // Start workout mutation
  const startMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await api.post(`/schedules/${scheduleId}/start`);
      return response.data.data;
    },
    onSuccess: (session) => {
      toast.success('Workout started!');
      window.location.href = `/workout/${selectedSchedule?.workoutId}/session`;
    },
    onError: () => {
      toast.error('Failed to start workout');
    },
  });

  // Convert schedules to calendar events
  const events: CalendarEvent[] = (schedules || []).map(schedule => {
    const startDate = new Date(schedule.scheduledDate);
    if (schedule.scheduledTime) {
      const [hours, minutes] = schedule.scheduledTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const endDate = new Date(startDate.getTime() + schedule.duration * 60 * 1000);

    return {
      id: schedule.id,
      title: schedule.workout.title,
      start: startDate,
      end: endDate,
      status: schedule.status,
      difficulty: schedule.workout.difficulty,
      workoutId: schedule.workoutId,
    };
  });

  // Handle slot selection (clicking on a date)
  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedDate(slotInfo.start);
    setShowModal(true);
  }, []);

  // Handle event selection (clicking on a scheduled workout)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const schedule = schedules?.find(s => s.id === event.id);
    if (schedule) {
      setSelectedSchedule(schedule);
    }
  }, [schedules]);

  // Custom event style
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: statusColors[event.status as keyof typeof statusColors],
        borderRadius: '4px',
        opacity: event.status === 'CANCELLED' || event.status === 'MISSED' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Check if user has required equipment for a workout
  const hasRequiredEquipment = (workout: Workout) => {
    if (!user || userEquipment.length === 0) return true;
    if (!workout.equipment || workout.equipment.length === 0) return true;
    if (workout.equipment.includes('None') || workout.equipment.includes('Bodyweight')) return true;
    
    return workout.equipment.some(equip => 
      userEquipment.includes(equip) || userEquipment.includes('Bodyweight Only')
    );
  };

  // Filter workouts locally
  const filteredWorkouts = workouts?.filter(workout => {
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

  // Upcoming schedules for quick view
  const upcomingSchedules = schedules
    ?.filter(s => new Date(s.scheduledDate) >= new Date() && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Workouts & Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your workouts and track your fitness journey
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showSchedule
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaCalendarAlt />
              {showSchedule ? 'Hide' : 'Show'} Schedule
            </button>
            {user && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FaPlus />
                Schedule Workout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      {showSchedule && user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          {/* Upcoming Workouts Quick View */}
          {upcomingSchedules && upcomingSchedules.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Upcoming Workouts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingSchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {schedule.workout.title}
                      </h3>
                      <button
                        onClick={() => startMutation.mutate(schedule.id)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <FaPlay />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {format(new Date(schedule.scheduledDate), 'MMM d')}
                      </span>
                      {schedule.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {schedule.scheduledTime}
                        </span>
                      )}
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                      difficultyColors[schedule.workout.difficulty as keyof typeof difficultyColors]
                    }`}>
                      {schedule.workout.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-[400px]">
              {schedulesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
                </div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  className="dark:text-white"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

      {/* Workouts Library Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          All Workouts
        </h2>

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
        {!workoutsLoading && !error && filteredWorkouts && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading State */}
        {workoutsLoading && (
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

        {/* Workouts Grid */}
        {!workoutsLoading && !error && filteredWorkouts && filteredWorkouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorkouts.map((workout) => {
              const hasEquipment = hasRequiredEquipment(workout);
              
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                    !hasEquipment ? 'opacity-60' : ''
                  }`}
                >
                  {/* Workout Image */}
                  {(workout.image || workout.imageUrl) && (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      <img
                        src={workout.image || workout.imageUrl}
                        alt={workout.title}
                        className="w-full h-full object-cover"
                      />
                      {!hasEquipment && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <FaLock className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Equipment Required</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {workout.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {workout.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        difficultyColors[workout.difficulty]
                      }`}>
                        {workout.difficulty}
                      </span>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {workout.duration}m
                        </span>
                        {workout.caloriesBurn && (
                          <span className="flex items-center gap-1">
                            <FaFire className="text-xs text-orange-500" />
                            {workout.caloriesBurn}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/workout/${workout.id}`}
                        className="flex-1 btn-primary text-center text-sm"
                      >
                        View Details
                      </Link>
                      {user && hasEquipment && (
                        <button
                          onClick={() => {
                            setSelectedDate(new Date());
                            setShowModal(true);
                          }}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <FaCalendarAlt />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!workoutsLoading && !error && filteredWorkouts?.length === 0 && (
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
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Schedule Workout Modal */}
      {showModal && (
        <ScheduleWorkoutModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            setShowModal(false);
            setSelectedDate(null);
          }}
        />
      )}

      {/* Selected Schedule Details */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedSchedule.workout.title}
              </h3>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FaCalendarAlt />
                <span>{format(new Date(selectedSchedule.scheduledDate), 'MMMM d, yyyy')}</span>
              </div>
              {selectedSchedule.scheduledTime && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaClock />
                  <span>{selectedSchedule.scheduledTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  difficultyColors[selectedSchedule.workout.difficulty as keyof typeof difficultyColors]
                }`}>
                  {selectedSchedule.workout.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedSchedule.status}
                </span>
              </div>
              {selectedSchedule.notes && (
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedSchedule.notes}
                </p>
              )}
            </div>

            {selectedSchedule.status === 'SCHEDULED' && (
              <div className="flex gap-3">
                <button
                  onClick={() => startMutation.mutate(selectedSchedule.id)}
                  className="flex-1 btn-primary"
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : (
                    <FaPlay className="inline mr-2" />
                  )}
                  Start Workout
                </button>
                <button
                  onClick={() => cancelMutation.mutate(selectedSchedule.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : (
                    <FaTimes className="inline mr-2" />
                  )}
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
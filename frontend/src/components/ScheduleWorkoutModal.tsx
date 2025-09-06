import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaDumbbell,
  FaBell,
  FaRedo,
  FaSpinner,
  FaChevronLeft,
  FaFire,
  FaCheckCircle,
} from 'react-icons/fa';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  targetMuscles: string[];
  equipment: string[];
  caloriesBurn?: number;
}

interface ScheduleWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  onSuccess: () => void;
}

export default function ScheduleWorkoutModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: ScheduleWorkoutModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentStep, setCurrentStep] = useState<'workout' | 'details'>('workout');
  const [isMobile, setIsMobile] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: selectedDate || new Date(),
    scheduledTime: '',
    notes: '',
    reminderEnabled: true,
    reminderTime: 30,
    isRecurring: false,
    recurrenceRule: 'weekly',
    recurrenceEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch workouts
  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ['workouts-schedule'],
    queryFn: async () => {
      const response = await api.get('/workouts?limit=100');
      return response.data;
    },
    enabled: isOpen,
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/schedules', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workout scheduled successfully!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to schedule workout');
    },
  });

  // Filter workouts based on search
  const filteredWorkouts = workouts?.filter(workout =>
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchedule = () => {
    if (!selectedWorkout) {
      toast.error('Please select a workout');
      return;
    }

    const data = {
      workoutId: selectedWorkout.id,
      scheduledDate: scheduleData.scheduledDate.toISOString(),
      scheduledTime: scheduleData.scheduledTime || undefined,
      duration: selectedWorkout.duration,
      notes: scheduleData.notes || undefined,
      reminderEnabled: scheduleData.reminderEnabled,
      reminderTime: scheduleData.reminderTime,
      isRecurring: scheduleData.isRecurring,
      recurrenceRule: scheduleData.isRecurring ? scheduleData.recurrenceRule : undefined,
      recurrenceEnd: scheduleData.isRecurring ? scheduleData.recurrenceEnd.toISOString() : undefined,
    };

    createScheduleMutation.mutate(data);
  };

  const difficultyColors = {
    BEGINNER: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    ADVANCED: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    EXPERT: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    EASY: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    HARD: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    EXTREME: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  if (!isOpen) return null;

  // Mobile full-page version
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
        >
          {/* Mobile Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {currentStep === 'details' && (
                <button
                  onClick={() => setCurrentStep('workout')}
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {currentStep === 'workout' ? 'Select Workout' : 'Schedule Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto">
            {currentStep === 'workout' ? (
              <div className="p-4">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workouts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  />
                </div>

                {/* Workout List */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWorkouts?.map(workout => (
                      <motion.div
                        key={workout.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedWorkout(workout)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedWorkout?.id === workout.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {workout.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {workout.description}
                            </p>
                          </div>
                          {selectedWorkout?.id === workout.id && (
                            <FaCheckCircle className="text-blue-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            difficultyColors[workout.difficulty as keyof typeof difficultyColors] || difficultyColors.INTERMEDIATE
                          }`}>
                            {workout.difficulty}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FaClock />
                            {workout.duration}m
                          </span>
                          {workout.caloriesBurn && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <FaFire className="text-orange-500" />
                              {workout.caloriesBurn}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Selected Workout Summary */}
                {selectedWorkout && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      {selectedWorkout.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                      <span>{selectedWorkout.duration} min</span>
                      <span>•</span>
                      <span>{selectedWorkout.difficulty}</span>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(scheduleData.scheduledDate, 'yyyy-MM-dd')}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      scheduledDate: new Date(e.target.value),
                    })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduleData.scheduledTime}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      scheduledTime: e.target.value,
                    })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      notes: e.target.value,
                    })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    placeholder="Any special notes for this workout..."
                  />
                </div>

                {/* Reminder Toggle */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBell className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Reminder</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleData.reminderEnabled}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          reminderEnabled: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {scheduleData.reminderEnabled && (
                    <select
                      value={scheduleData.reminderTime}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        reminderTime: parseInt(e.target.value),
                      })}
                      className="w-full mt-3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={120}>2 hours before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  )}
                </div>

                {/* Recurring Toggle */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaRedo className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Repeat</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleData.isRecurring}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          isRecurring: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {scheduleData.isRecurring && (
                    <div className="mt-3 space-y-3">
                      <select
                        value={scheduleData.recurrenceRule}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          recurrenceRule: e.target.value,
                        })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <input
                        type="date"
                        value={format(scheduleData.recurrenceEnd, 'yyyy-MM-dd')}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          recurrenceEnd: new Date(e.target.value),
                        })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
            {currentStep === 'workout' ? (
              <button
                onClick={() => selectedWorkout && setCurrentStep('details')}
                disabled={!selectedWorkout}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white disabled:text-gray-500 disabled:dark:text-gray-400 py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Continue
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('workout')}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedWorkout || createScheduleMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {createScheduleMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule'
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop version
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        >
          {/* Desktop Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Schedule Your Workout
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(85vh-80px)]">
            {/* Left side - Workout Selection */}
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Choose a Workout
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                />
              </div>

              {/* Workout List */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWorkouts?.map(workout => (
                    <motion.div
                      key={workout.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWorkout(workout)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedWorkout?.id === workout.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {workout.title}
                        </h4>
                        {selectedWorkout?.id === workout.id && (
                          <FaCheckCircle className="text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {workout.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          difficultyColors[workout.difficulty as keyof typeof difficultyColors] || difficultyColors.INTERMEDIATE
                        }`}>
                          {workout.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <FaClock />
                          {workout.duration}m
                        </span>
                        {workout.caloriesBurn && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FaFire className="text-orange-500" />
                            {workout.caloriesBurn}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <FaDumbbell />
                          {workout.targetMuscles.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Schedule Details */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Schedule Details
              </h3>

              {selectedWorkout && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Selected: {selectedWorkout.title}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                    <span>{selectedWorkout.duration} minutes</span>
                    <span>•</span>
                    <span>{selectedWorkout.difficulty}</span>
                    {selectedWorkout.caloriesBurn && (
                      <>
                        <span>•</span>
                        <span>{selectedWorkout.caloriesBurn} calories</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Date and Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={format(scheduleData.scheduledDate, 'yyyy-MM-dd')}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        scheduledDate: new Date(e.target.value),
                      })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaClock className="inline mr-2" />
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={scheduleData.scheduledTime}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        scheduledTime: e.target.value,
                      })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      notes: e.target.value,
                    })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white resize-none"
                    placeholder="Any special notes for this workout..."
                  />
                </div>

                {/* Reminder Card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleData.reminderEnabled}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          reminderEnabled: e.target.checked,
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        <FaBell className="inline mr-2 text-gray-600 dark:text-gray-400" />
                        Enable Reminder
                      </span>
                    </label>
                  </div>
                  {scheduleData.reminderEnabled && (
                    <select
                      value={scheduleData.reminderTime}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        reminderTime: parseInt(e.target.value),
                      })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={120}>2 hours before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  )}
                </div>

                {/* Recurring Card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleData.isRecurring}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          isRecurring: e.target.checked,
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        <FaRedo className="inline mr-2 text-gray-600 dark:text-gray-400" />
                        Repeat this workout
                      </span>
                    </label>
                  </div>
                  {scheduleData.isRecurring && (
                    <div className="space-y-3">
                      <select
                        value={scheduleData.recurrenceRule}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          recurrenceRule: e.target.value,
                        })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          End repeat on
                        </label>
                        <input
                          type="date"
                          value={format(scheduleData.recurrenceEnd, 'yyyy-MM-dd')}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            recurrenceEnd: new Date(e.target.value),
                          })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 sticky bottom-0 bg-white dark:bg-gray-800 py-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedWorkout || createScheduleMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {createScheduleMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Workout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
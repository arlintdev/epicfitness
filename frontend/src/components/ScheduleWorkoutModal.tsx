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
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-orange-100 text-orange-800',
    EXTREME: 'bg-red-100 text-red-800',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Schedule Workout
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Left side - Workout Selection */}
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Select Workout
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Workout List */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin h-6 w-6 text-primary-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWorkouts?.map(workout => (
                    <div
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedWorkout?.id === workout.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {workout.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          difficultyColors[workout.difficulty as keyof typeof difficultyColors]
                        }`}>
                          {workout.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {workout.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {workout.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FaDumbbell />
                          {workout.targetMuscles.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Schedule Details */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Schedule Details
              </h3>

              <div className="space-y-4">
                {/* Date */}
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Time */}
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Any special notes for this workout..."
                  />
                </div>

                {/* Reminder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={scheduleData.reminderEnabled}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          reminderEnabled: e.target.checked,
                        })}
                        className="mr-2 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FaBell className="inline mr-2" />
                        Reminder
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={120}>2 hours before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  )}
                </div>

                {/* Recurring */}
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={scheduleData.isRecurring}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        isRecurring: e.target.checked,
                      })}
                      className="mr-2 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FaRedo className="inline mr-2" />
                      Repeat this workout
                    </label>
                  </div>
                  {scheduleData.isRecurring && (
                    <div className="space-y-3 ml-6">
                      <select
                        value={scheduleData.recurrenceRule}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          recurrenceRule: e.target.value,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedWorkout || createScheduleMutation.isLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createScheduleMutation.isLoading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
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
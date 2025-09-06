import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaPlus,
  FaClock,
  FaDumbbell,
  FaPlay,
  FaEdit,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaList,
  FaCalendarWeek,
} from 'react-icons/fa';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ScheduleWorkoutModal from '../components/ScheduleWorkoutModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const statusColors = {
  SCHEDULED: '#3B82F6',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  CANCELLED: '#6B7280',
  MISSED: '#EF4444',
};

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  EXTREME: 'bg-red-100 text-red-800',
};

type ViewType = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

export default function Schedule() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('month');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledWorkout | null>(null);
  const [showListView, setShowListView] = useState(false);

  // Fetch scheduled workouts
  const { data: schedules, isLoading } = useQuery<ScheduledWorkout[]>({
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
      // Navigate to workout session
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

  // List view of upcoming workouts
  const upcomingSchedules = schedules
    ?.filter(s => new Date(s.scheduledDate) >= new Date() && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Workout Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plan and track your fitness journey
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowListView(!showListView)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showListView
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {showListView ? <FaCalendarAlt /> : <FaList />}
              {showListView ? 'Calendar View' : 'List View'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus />
              Schedule Workout
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : showListView ? (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Upcoming Workouts
          </h2>
          {upcomingSchedules && upcomingSchedules.length > 0 ? (
            <div className="space-y-4">
              {upcomingSchedules.map(schedule => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                      <FaDumbbell className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {schedule.workout.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {format(new Date(schedule.scheduledDate), 'MMM d, yyyy')}
                        </span>
                        {schedule.scheduledTime && (
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {schedule.scheduledTime}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          difficultyColors[schedule.workout.difficulty as keyof typeof difficultyColors]
                        }`}>
                          {schedule.workout.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startMutation.mutate(schedule.id)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      <FaPlay className="inline mr-1" />
                      Start
                    </button>
                    <button
                      onClick={() => setSelectedSchedule(schedule)}
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming workouts scheduled
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary mt-4"
              >
                Schedule Your First Workout
              </button>
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="h-[600px]">
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
          </div>
        </div>
      )}

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
                  disabled={startMutation.isLoading}
                >
                  {startMutation.isLoading ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : (
                    <FaPlay className="inline mr-2" />
                  )}
                  Start Workout
                </button>
                <button
                  onClick={() => cancelMutation.mutate(selectedSchedule.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  disabled={cancelMutation.isLoading}
                >
                  {cancelMutation.isLoading ? (
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
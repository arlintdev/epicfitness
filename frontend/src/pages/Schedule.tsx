import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
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
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ScheduleWorkoutModal from '../components/ScheduleWorkoutModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

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
  BEGINNER: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  ADVANCED: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  EXPERT: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  EASY: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  HARD: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  EXTREME: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Default to list view on mobile
      if (window.innerWidth < 768) {
        setShowListView(true);
        setView('day'); // Better for mobile
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    onSuccess: () => {
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
        fontSize: isMobile ? '0.7rem' : '0.875rem',
      },
    };
  };

  // Get schedules for list view
  const upcomingSchedules = schedules
    ?.filter(s => new Date(s.scheduledDate) >= new Date() && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const pastSchedules = schedules
    ?.filter(s => new Date(s.scheduledDate) < new Date() || s.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Workout Schedule
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Plan and track your fitness journey
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setShowListView(!showListView)}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-colors ${
                showListView
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showListView ? <FaCalendarAlt className="text-sm sm:text-base" /> : <FaList className="text-sm sm:text-base" />}
              <span className="hidden sm:inline">
                {showListView ? 'Calendar' : 'List'}
              </span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-colors"
            >
              <FaPlus className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Schedule</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 sm:h-96">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : showListView ? (
        // List View (Mobile Optimized)
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Workouts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Upcoming Workouts
            </h2>
            {upcomingSchedules && upcomingSchedules.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {upcomingSchedules.map(schedule => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-lg flex-shrink-0">
                          <FaDumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                            {schedule.workout.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-xs" />
                              {format(new Date(schedule.scheduledDate), 'MMM d')}
                            </span>
                            {schedule.scheduledTime && (
                              <span className="flex items-center gap-1">
                                <FaClock className="text-xs" />
                                {schedule.scheduledTime}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              difficultyColors[schedule.workout.difficulty as keyof typeof difficultyColors] || difficultyColors.INTERMEDIATE
                            }`}>
                              {schedule.workout.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-11 sm:ml-0">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            startMutation.mutate(schedule.id);
                          }}
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <FaPlay className="text-xs" />
                          Start
                        </button>
                        <button
                          onClick={() => setSelectedSchedule(schedule)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <FaCalendarAlt className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                  No upcoming workouts scheduled
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
                >
                  Schedule Your First Workout
                </button>
              </div>
            )}
          </div>

          {/* Past Workouts */}
          {pastSchedules && pastSchedules.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {pastSchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-75"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`p-2 rounded-lg ${
                        schedule.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        {schedule.status === 'COMPLETED' ? (
                          <FaCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <FaTimes className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                          {schedule.workout.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(schedule.scheduledDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                      schedule.status === 'COMPLETED' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6">
          {isMobile && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 Tip: Use list view for better mobile experience
              </p>
            </div>
          )}
          <div className={`${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
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
              views={isMobile ? ['day', 'agenda'] : ['month', 'week', 'day', 'agenda']}
              toolbar={!isMobile}
              components={isMobile ? {
                toolbar: () => (
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000))}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <FaChevronLeft />
                    </button>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {format(date, 'MMMM d, yyyy')}
                      </h3>
                    </div>
                    <button
                      onClick={() => setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )
              } : undefined}
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

      {/* Selected Schedule Details Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pr-2">
                {selectedSchedule.workout.title}
              </h3>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <FaCalendarAlt className="flex-shrink-0" />
                <span>{format(new Date(selectedSchedule.scheduledDate), 'MMMM d, yyyy')}</span>
              </div>
              {selectedSchedule.scheduledTime && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <FaClock className="flex-shrink-0" />
                  <span>{selectedSchedule.scheduledTime}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                  difficultyColors[selectedSchedule.workout.difficulty as keyof typeof difficultyColors] || difficultyColors.INTERMEDIATE
                }`}>
                  {selectedSchedule.workout.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedSchedule.status}
                </span>
              </div>
              {selectedSchedule.notes && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {selectedSchedule.notes}
                </p>
              )}
            </div>

            {selectedSchedule.status === 'SCHEDULED' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => startMutation.mutate(selectedSchedule.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPlay />
                  )}
                  <span>Start Workout</span>
                </button>
                <button
                  onClick={() => cancelMutation.mutate(selectedSchedule.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTimes />
                  )}
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
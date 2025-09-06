import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, 
  FaPlay, 
  FaPause, 
  FaRedo, 
  FaChevronRight, 
  FaChevronLeft, 
  FaClock, 
  FaFireAlt,
  FaCheckCircle,
  FaTrophy,
  FaExclamationCircle,
  FaTimes
} from 'react-icons/fa';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { kudosService, KudosType } from '../services/kudos.service';

interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryMuscle: string;
  instructions: string[];
  tips?: string[];
  commonMistakes?: string[];
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  notes?: string;
}

interface Workout {
  id: string;
  title: string;
  name?: string;
  description: string;
  exercises: WorkoutExercise[];
  caloriesBurn?: number;
}

interface ExerciseStep {
  exerciseId: string;
  setNumber: number;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<ExerciseStep[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch workout details
  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: ['workout', id],
    queryFn: async () => {
      const response = await api.get(`/workouts/${id}`);
      return response.data.data || response.data;
    },
  });

  // Start workout session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/workouts/${id}/start-session`);
      return response.data.data || response.data;
    },
    onSuccess: async (data) => {
      setSessionId(data.id);
      const kudos = await kudosService.getKudosPhrase(KudosType.WORKOUT_START);
      toast.success(kudos);
    },
    onError: () => {
      toast.error('Failed to start workout session');
    },
  });

  // Complete workout session
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      if (sessionId) {
        return api.post(`/workouts/session/${sessionId}/complete`, sessionData);
      }
      throw new Error('No session ID');
    },
    onSuccess: async () => {
      const kudos = await kudosService.getKudosPhrase(KudosType.WORKOUT_COMPLETE);
      toast.success(kudos);
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Failed to save workout session');
    },
  });

  // Start session on mount and prefetch kudos
  useEffect(() => {
    if (workout && !sessionId) {
      startSessionMutation.mutate();
      // Prefetch kudos phrases for better performance
      kudosService.prefetchPhrases([
        KudosType.EXERCISE_COMPLETE,
        KudosType.REST_START,
        KudosType.REST_COMPLETE,
        KudosType.NEXT_EXERCISE,
        KudosType.WORKOUT_COMPLETE,
      ]);
    }
  }, [workout]);

  // Update total time elapsed
  useEffect(() => {
    totalTimeIntervalRef.current = setInterval(() => {
      setTotalTimeElapsed(Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => {
      if (totalTimeIntervalRef.current) {
        clearInterval(totalTimeIntervalRef.current);
      }
    };
  }, [sessionStartTime]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, isPaused, timeRemaining]);

  const handleTimerComplete = async () => {
    if (isResting) {
      setIsResting(false);
      const kudos = await kudosService.getKudosPhrase(KudosType.REST_COMPLETE);
      toast.success(kudos);
      // Move to next set or exercise
      if (currentExercise && currentSet < (currentExercise.sets || 1)) {
        setCurrentSet(currentSet + 1);
      } else {
        handleNextExercise();
      }
    } else {
      // Timer completed for an exercise, not for rest
      // No kudos needed here as it's handled elsewhere
    }
  };

  const startTimer = (duration: number) => {
    setTimeRemaining(duration);
    setIsTimerRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setIsResting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const markStepComplete = async () => {
    const step: ExerciseStep = {
      exerciseId: currentExercise!.exerciseId,
      setNumber: currentSet,
      completed: true,
      startTime: new Date(),
      endTime: new Date(),
    };

    setCompletedSteps([...completedSteps, step]);

    // Check if current exercise is complete
    if (currentSet >= (currentExercise?.sets || 1)) {
      // Start rest timer if configured
      if (currentExercise?.restTime && !isResting) {
        setIsResting(true);
        startTimer(currentExercise.restTime);
        const kudos = await kudosService.getKudosPhrase(KudosType.REST_START);
        toast(kudos, { icon: '💪' });
      } else {
        handleNextExercise();
      }
    } else {
      // Move to next set
      setCurrentSet(currentSet + 1);
      // Start rest timer between sets
      if (currentExercise?.restTime) {
        setIsResting(true);
        startTimer(currentExercise.restTime);
        const kudos = await kudosService.getKudosPhrase(KudosType.REST_START);
        toast(kudos, { icon: '💪' });
      }
    }
  };

  const handleNextExercise = async () => {
    if (workout && currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
      resetTimer();
      const kudos = await kudosService.getKudosPhrase(KudosType.NEXT_EXERCISE);
      toast.success(kudos);
    } else {
      // Workout complete
      handleCompleteWorkout();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(1);
      setIsResting(false);
      resetTimer();
    }
  };

  const handleCompleteWorkout = async () => {
    const sessionData = {
      duration: totalTimeElapsed,
      caloriesBurned: workout?.caloriesBurn || Math.floor(totalTimeElapsed * 0.1),
      notes: `Completed ${completedSteps.length} sets`,
    };

    await completeSessionMutation.mutateAsync(sessionData);
  };

  const isStepCompleted = (exerciseId: string, setNumber: number) => {
    return completedSteps.some(
      (step) => step.exerciseId === exerciseId && step.setNumber === setNumber
    );
  };

  const getProgress = () => {
    if (!workout) return 0;
    
    const totalSets = workout.exercises.reduce((acc, ex) => acc + (ex.sets || 1), 0);
    const completedSets = completedSteps.length;
    return (completedSets / totalSets) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">Workout not found</p>
          <button
            onClick={() => navigate('/workouts')}
            className="btn-primary"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                    <FaExclamationCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Exit Workout?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to exit? Your progress will be lost.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExitModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Continue Workout
                    </button>
                    <button
                      onClick={() => navigate('/workouts')}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.title || workout.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{workout.description}</p>
            </div>
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Exit Session"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-3"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progress: {Math.round(getProgress())}%
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <FaClock className="w-4 h-4" />
                <span>{formatTime(totalTimeElapsed)}</span>
              </div>
              {workout.caloriesBurn && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <FaFireAlt className="w-4 h-4 text-orange-500" />
                  <span>~{Math.floor(totalTimeElapsed * 0.1)} cal</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <FaCheckCircle className="w-4 h-4 text-green-500" />
                <span>{completedSteps.length} sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Exercise Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {currentExercise.exercise.name}
            </h2>
            <span className="mt-2 sm:mt-0 inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
              {currentExerciseIndex + 1}/{workout.exercises.length}
            </span>
          </div>

          {/* Sets/Reps/Timer Info - Compact grid for mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
            {currentExercise.sets && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Sets</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {currentSet}/{currentExercise.sets}
                </p>
              </div>
            )}
            {currentExercise.reps && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Reps</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {currentExercise.reps}
                </p>
              </div>
            )}
            {currentExercise.restTime && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Rest</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {currentExercise.restTime}s
                </p>
              </div>
            )}
            {/* Timer Card - Clickable Toggle with Hold to Reset */}
            {(currentExercise.duration || isResting) && (
              <button
                onClick={() => {
                  if (!isHolding) {
                    if (!isTimerRunning && !isResting && currentExercise.duration) {
                      startTimer(currentExercise.duration);
                    } else if (isTimerRunning && !isPaused) {
                      pauseTimer();
                    } else if (isTimerRunning && isPaused) {
                      resumeTimer();
                    }
                  }
                }}
                onMouseDown={() => {
                  if (isTimerRunning || timeRemaining > 0) {
                    setIsHolding(true);
                    holdTimeoutRef.current = setTimeout(() => {
                      resetTimer();
                      setIsHolding(false);
                      // Haptic feedback for mobile
                      if (navigator.vibrate) {
                        navigator.vibrate(50);
                      }
                    }, 800); // Hold for 800ms to reset
                  }
                }}
                onMouseUp={() => {
                  setIsHolding(false);
                  if (holdTimeoutRef.current) {
                    clearTimeout(holdTimeoutRef.current);
                  }
                }}
                onMouseLeave={() => {
                  setIsHolding(false);
                  if (holdTimeoutRef.current) {
                    clearTimeout(holdTimeoutRef.current);
                  }
                }}
                onTouchStart={() => {
                  if (isTimerRunning || timeRemaining > 0) {
                    setIsHolding(true);
                    holdTimeoutRef.current = setTimeout(() => {
                      resetTimer();
                      setIsHolding(false);
                      // Haptic feedback for mobile
                      if (navigator.vibrate) {
                        navigator.vibrate(50);
                      }
                    }, 800); // Hold for 800ms to reset
                  }
                }}
                onTouchEnd={() => {
                  setIsHolding(false);
                  if (holdTimeoutRef.current) {
                    clearTimeout(holdTimeoutRef.current);
                  }
                }}
                className={`rounded-lg p-3 text-left transition-all transform cursor-pointer select-none ${
                  isHolding 
                    ? 'scale-95 opacity-75' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  isResting 
                    ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                    : 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      {isResting ? 'Rest Timer' : 'Timer'}
                    </p>
                    <p className={`text-xl sm:text-2xl font-bold font-mono ${
                      isHolding 
                        ? 'text-red-500 dark:text-red-400' 
                        : isResting 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-primary-600 dark:text-primary-400'
                    }`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                  <div className="ml-2">
                    {isHolding ? (
                      <FaRedo className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
                    ) : !isTimerRunning && !isResting ? (
                      <FaPlay className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                    ) : isTimerRunning && !isPaused ? (
                      <FaPause className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    ) : (
                      <FaPlay className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isHolding && 'Resetting...'}
                  {!isHolding && !isTimerRunning && !isResting && 'Tap to start'}
                  {!isHolding && isTimerRunning && !isPaused && 'Tap to pause • Hold to reset'}
                  {!isHolding && isTimerRunning && isPaused && 'Tap to resume • Hold to reset'}
                </div>
              </button>
            )}
          </div>

          {/* Instructions */}
          {currentExercise.exercise.instructions && currentExercise.exercise.instructions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white text-sm sm:text-base">Instructions</h3>
              <ol className="space-y-2">
                {currentExercise.exercise.instructions.map((instruction, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-2"
                  >
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{instruction}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips - Collapsible on mobile */}
          {currentExercise.exercise.tips && currentExercise.exercise.tips.length > 0 && (
            <details className="mb-4">
              <summary className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white cursor-pointer">💡 Tips</summary>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2 ml-4">
                {currentExercise.exercise.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Notes - Compact */}
          {currentExercise.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm">📝 Notes:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{currentExercise.notes}</p>
            </div>
          )}

          {/* Complete Set Button */}
          {!isResting && (
            <button
              onClick={markStepComplete}
              disabled={isStepCompleted(currentExercise.exerciseId, currentSet)}
              className={`w-full py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform text-base sm:text-lg ${
                isStepCompleted(currentExercise.exerciseId, currentSet)
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              {isStepCompleted(currentExercise.exerciseId, currentSet)
                ? 'Set Completed ✓'
                : 'Complete Set'}
            </button>
          )}

          {isResting && (
            <button
              onClick={() => {
                resetTimer();
                setIsResting(false);
                if (currentSet < (currentExercise?.sets || 1)) {
                  setCurrentSet(currentSet + 1);
                } else {
                  handleNextExercise();
                }
              }}
              className="w-full py-3 sm:py-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Skip Rest
            </button>
          )}
        </div>

        {/* Navigation - Compact on mobile */}
        <div className="flex gap-2 sm:gap-4 mt-4">
          <button
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className={`flex-1 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base ${
              currentExerciseIndex === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            onClick={handleNextExercise}
            className={`flex-1 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base ${
              currentExerciseIndex === workout.exercises.length - 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {currentExerciseIndex === workout.exercises.length - 1 ? 'End' : 'Next'}
            <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Complete Workout Button */}
        {currentExerciseIndex === workout.exercises.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCompleteWorkout}
            disabled={completeSessionMutation.isPending}
            className="w-full mt-4 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-primary-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-primary-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5" />
            {completeSessionMutation.isPending ? 'Saving...' : 'Complete Workout'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
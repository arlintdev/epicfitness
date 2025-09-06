import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FaDumbbell,
  FaClock,
  FaCalendarAlt,
  FaPlay,
  FaCheck,
  FaSpinner,
  FaTrophy,
  FaFire,
} from 'react-icons/fa';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  duration: number;
  daysPerWeek: number;
  goal: string;
  requirements: string[];
  featured: boolean;
  _count: {
    enrollments: number;
    workouts: number;
  };
  enrollments?: Array<{
    id: string;
    userId: string;
    status: string;
  }>;
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  EXTREME: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function Programs() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Fetch all programs
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await api.get('/programs');
      return response.data.data;
    },
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (programId: string) => {
      const response = await api.post(`/programs/${programId}/enroll`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-programs'] });
      toast.success('Successfully enrolled in program!');
      navigate('/progress');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to enroll in program');
    },
  });

  const isEnrolled = (program: Program) => {
    if (!user || !program.enrollments) return false;
    return program.enrollments.some(
      e => e.userId === user.id && e.status === 'ACTIVE'
    );
  };

  const filteredPrograms = programs?.filter(program => 
    !selectedDifficulty || program.difficulty === selectedDifficulty
  );

  const featuredPrograms = filteredPrograms?.filter(p => p.featured);
  const regularPrograms = filteredPrograms?.filter(p => !p.featured);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Training Programs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Structured workout programs to help you achieve your fitness goals
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setSelectedDifficulty(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            !selectedDifficulty
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All Levels
        </button>
        {['EASY', 'MEDIUM', 'HARD', 'EXTREME'].map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedDifficulty === difficulty
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Featured Programs */}
      {featuredPrograms && featuredPrograms.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Featured Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPrograms.map(program => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{program.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur`}>
                    {program.difficulty}
                  </span>
                </div>
                <p className="mb-4 text-white/90">{program.description}</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <span className="text-sm">{program.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <span className="text-sm">{program.daysPerWeek} days/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaDumbbell />
                    <span className="text-sm">{program._count.workouts} workouts</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">Goal:</p>
                  <p className="text-sm text-white/90">{program.goal}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <FaFire />
                    <span>{program._count.enrollments} enrolled</span>
                  </div>
                  {isAuthenticated ? (
                    isEnrolled(program) ? (
                      <button
                        className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        disabled
                      >
                        <FaCheck />
                        Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(program.id)}
                        disabled={enrollMutation.isPending}
                        className="bg-white text-primary-500 px-4 py-2 rounded-lg hover:bg-white/90 flex items-center gap-2"
                      >
                        {enrollMutation.isPending ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPlay />
                        )}
                        Start Program
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-white text-primary-500 px-4 py-2 rounded-lg hover:bg-white/90"
                    >
                      Login to Enroll
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Programs */}
      {regularPrograms && regularPrograms.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPrograms.map(program => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {program.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    difficultyColors[program.difficulty as keyof typeof difficultyColors]
                  }`}>
                    {program.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {program.description}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt className="text-xs" />
                    <span>{program.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <FaClock className="text-xs" />
                    <span>{program.daysPerWeek} days/week</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Requirements:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {program.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {program._count.enrollments} enrolled
                  </span>
                  {isAuthenticated ? (
                    isEnrolled(program) ? (
                      <button
                        className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                        disabled
                      >
                        <FaCheck />
                        Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(program.id)}
                        disabled={enrollMutation.isPending}
                        className="btn-primary text-sm"
                      >
                        Enroll
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-outline text-sm"
                    >
                      Login
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(!filteredPrograms || filteredPrograms.length === 0) && (
        <div className="text-center py-12">
          <FaDumbbell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No programs found for the selected difficulty level
          </p>
        </div>
      )}
    </div>
  );
}
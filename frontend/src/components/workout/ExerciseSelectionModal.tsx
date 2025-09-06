import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exerciseApi } from '../../services/api';
import { FaTimes, FaSearch, FaDumbbell, FaPlus, FaFilter } from 'react-icons/fa';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  primaryMuscle: string;
  category: string;
  equipment?: string;
}

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  selectedExercises?: string[];
}

const muscleGroups = [
  'ALL',
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'ABS',
  'QUADRICEPS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
  'FULL_BODY'
];

const categories = ['ALL', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE'];

export default function ExerciseSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedExercises = []
}: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.getAll,
    enabled: isOpen
  });

  // Filter exercises based on search and filters
  const filteredExercises = exercises.filter((exercise: Exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'ALL' || exercise.primaryMuscle === selectedMuscle;
    const matchesCategory = selectedCategory === 'ALL' || exercise.category === selectedCategory;
    
    return matchesSearch && matchesMuscle && matchesCategory;
  });

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedMuscle('ALL');
      setSelectedCategory('ALL');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getMuscleColor = (muscle: string) => {
    const colors: Record<string, string> = {
      CHEST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      BACK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SHOULDERS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      BICEPS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      TRICEPS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      ABS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      QUADRICEPS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      HAMSTRINGS: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      GLUTES: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      CALVES: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      FULL_BODY: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200',
    };
    return colors[muscle] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'STRENGTH':
        return '💪';
      case 'CARDIO':
        return '🏃';
      case 'FLEXIBILITY':
        return '🤸';
      case 'BALANCE':
        return '⚖️';
      default:
        return '🏋️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <FaDumbbell className="mr-3" />
              Select Exercise
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="text"
              placeholder="Search exercises by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
            >
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muscle Group
                </label>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                >
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>
                      {muscle === 'ALL' ? 'All Muscles' : muscle.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'ALL' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Cards */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3">Loading exercises...</span>
              </div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No exercises found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise: Exercise) => {
                const isSelected = selectedExercises.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-lg'
                      }
                    `}
                    onClick={() => !isSelected && onSelect(exercise)}
                  >
                    {/* Exercise Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {exercise.name}
                      </h3>
                      <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {exercise.description || 'No description available'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMuscleColor(exercise.primaryMuscle)}`}>
                        {exercise.primaryMuscle.replace('_', ' ')}
                      </span>
                      {exercise.equipment && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          onSelect(exercise);
                        }
                      }}
                      disabled={isSelected}
                      className={`
                        w-full py-2 rounded-lg font-medium transition-colors
                        ${isSelected
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                        }
                      `}
                    >
                      {isSelected ? (
                        <>✓ Already Added</>
                      ) : (
                        <>
                          <FaPlus className="inline mr-2" />
                          Add Exercise
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredExercises.length} exercises found
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
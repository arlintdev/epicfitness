import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell,
  FaPlus,
  FaTrash,
  FaImage,
  FaSave,
  FaGripVertical,
  FaClock,
  FaFire,
  FaListOl,
  FaSpinner,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ExerciseModal from '../components/workout/ExerciseModal';
import ExerciseSelectionModal from '../components/workout/ExerciseSelectionModal';

// Validation schema
const workoutSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(300),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']),
  category: z.string().min(1, 'Category is required'),
  targetMuscles: z.array(z.string()).min(1, 'Select at least one target muscle'),
  equipment: z.array(z.string()),
  caloriesBurn: z.number().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().min(1, 'Exercise is required'),
    sets: z.number().optional(),
    reps: z.string().optional(),
    duration: z.number().optional(),
    restTime: z.number().optional(),
    notes: z.string().optional(),
  })).min(1, 'Add at least one exercise'),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

const categories = [
  'Strength',
  'Cardio',
  'HIIT',
  'Yoga',
  'Flexibility',
  'CrossFit',
  'Powerlifting',
  'Bodybuilding',
  'Calisthenics',
  'Endurance',
];

const muscleGroups = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'LEGS',
  'GLUTES',
  'FULL_BODY',
];

const equipmentOptions = [
  'None',
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Pull-up Bar',
  'Cable Machine',
  'Bench',
  'Medicine Ball',
  'TRX',
  'Foam Roller',
];

interface Exercise {
  id: string;
  name: string;
  description?: string;
  primaryMuscle: string;
  category: string;
  equipment?: string;
}

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'exercises' | 'instructions'>('basic');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      exercises: [{ exerciseId: '', sets: 3, reps: '10', restTime: 60 }],
      targetMuscles: [],
      equipment: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'exercises',
  });

  // Fetch available exercises
  const { data: availableExercises, refetch: refetchExercises } = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.get('/exercises');
      return response.data;
    },
  });

  const handleExerciseSelect = (exercise: Exercise) => {
    if (currentExerciseIndex !== null) {
      setValue(`exercises.${currentExerciseIndex}.exerciseId`, exercise.id);
      setShowSelectionModal(false);
      setCurrentExerciseIndex(null);
    }
  };

  const getSelectedExerciseIds = () => {
    const exercises = watch('exercises') || [];
    return exercises.map(ex => ex.exerciseId).filter(Boolean);
  };

  // Create workout mutation
  const createMutation = useMutation({
    mutationFn: async (data: WorkoutFormData) => {
      const payload = {
        ...data,
        image: imageBase64,
      };
      const response = await api.post('/workouts', payload);
      return response.data;
    },
    onSuccess: (workout) => {
      toast.success('Workout created successfully!');
      navigate(`/workouts/${workout.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create workout');
    },
  });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const handleExerciseCreated = (newExercise: any) => {
    refetchExercises();
    // Optionally add the new exercise to current workout
    const exerciseData = {
      exerciseId: newExercise.id,
      sets: 3,
      reps: '10',
      restTime: 60
    };
    append(exerciseData);
  };

  const onSubmit = (data: WorkoutFormData) => {
    console.log('Form submitted with data:', data);
    
    // Add order to exercises
    const exercisesWithOrder = data.exercises.map((ex, index) => ({
      ...ex,
      order: index + 1,
    }));

    createMutation.mutate({
      ...data,
      exercises: exercisesWithOrder,
    });
  };

  const selectedMuscles = watch('targetMuscles') || [];
  const selectedEquipment = watch('equipment') || [];

  const toggleMuscle = (muscle: string) => {
    const current = selectedMuscles;
    if (current.includes(muscle)) {
      setValue('targetMuscles', current.filter(m => m !== muscle));
    } else {
      setValue('targetMuscles', [...current, muscle]);
    }
  };

  const toggleEquipment = (equip: string) => {
    const current = selectedEquipment;
    if (current.includes(equip)) {
      setValue('equipment', current.filter(e => e !== equip));
    } else {
      setValue('equipment', [...current, equip]);
    }
  };

  // Check if user is admin
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <FaInfoCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Admin Access Required
          </h3>
          <p className="text-yellow-600 dark:text-yellow-300">
            Only administrators can create workouts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Workout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Design an epic workout routine for the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Form validation errors:', errors);
        toast.error('Please fill in all required fields');
      })} className="space-y-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'basic'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exercises')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'exercises'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Exercises ({fields.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'instructions'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Instructions
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="label">Workout Image</label>
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 cursor-pointer transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <FaImage className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Click to upload image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Max size: 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageBase64(null);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="label">Title *</label>
                    <input
                      {...register('title')}
                      type="text"
                      className={`input ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Epic Upper Body Blast"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="label">Category *</label>
                    <select
                      {...register('category')}
                      className={`input ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="label">Duration (minutes) *</label>
                    <div className="relative">
                      <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('duration', { valueAsNumber: true })}
                        type="number"
                        className={`input pl-10 ${errors.duration ? 'border-red-500' : ''}`}
                        placeholder="45"
                      />
                    </div>
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="label">Difficulty *</label>
                    <select
                      {...register('difficulty')}
                      className={`input ${errors.difficulty ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select difficulty</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="EXTREME">Extreme</option>
                    </select>
                    {errors.difficulty && (
                      <p className="mt-1 text-sm text-red-500">{errors.difficulty.message}</p>
                    )}
                  </div>

                  {/* Calories Burn */}
                  <div>
                    <label className="label">Estimated Calories Burn</label>
                    <div className="relative">
                      <FaFire className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('caloriesBurn', { valueAsNumber: true })}
                        type="number"
                        className="input pl-10"
                        placeholder="350"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    {...register('description')}
                    className={`input min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="A comprehensive upper body workout targeting all major muscle groups..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Target Muscles */}
                <div>
                  <label className="label">Target Muscles *</label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(muscle => (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleMuscle(muscle)}
                        className={`px-4 py-2 rounded-full transition-colors ${
                          selectedMuscles.includes(muscle)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {muscle.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  {errors.targetMuscles && (
                    <p className="mt-1 text-sm text-red-500">{errors.targetMuscles.message}</p>
                  )}
                </div>

                {/* Equipment */}
                <div>
                  <label className="label">Equipment Needed</label>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map(equip => (
                      <button
                        key={equip}
                        type="button"
                        onClick={() => toggleEquipment(equip)}
                        className={`px-4 py-2 rounded-full transition-colors ${
                          selectedEquipment.includes(equip)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {equip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exercises Tab */}
            {activeTab === 'exercises' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag to reorder exercises
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExerciseModal(true)}
                      className="btn-outline flex items-center gap-2"
                    >
                      <FaPlus />
                      Create Exercise
                    </button>
                    <button
                      type="button"
                      onClick={() => append({ exerciseId: '', sets: 3, reps: '10', restTime: 60 })}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FaPlus />
                      Add Exercise
                    </button>
                  </div>
                </div>

                {errors.exercises && (
                  <p className="text-sm text-red-500">{errors.exercises.message}</p>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="exercises">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {fields.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-2 cursor-move text-gray-400 hover:text-gray-600"
                                    >
                                      <FaGripVertical />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full font-bold text-sm">
                                          {index + 1}
                                        </span>

                                        <Controller
                                          name={`exercises.${index}.exerciseId`}
                                          control={control}
                                          render={({ field }) => {
                                            const selectedExercise = availableExercises?.find((ex: any) => ex.id === field.value);
                                            return (
                                              <div className="flex-1">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setCurrentExerciseIndex(index);
                                                    setShowSelectionModal(true);
                                                  }}
                                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors"
                                                >
                                                  {selectedExercise ? (
                                                    <div>
                                                      <div className="font-medium">{selectedExercise.name}</div>
                                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {selectedExercise.primaryMuscle} • {selectedExercise.equipment || 'No equipment'}
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                                      <FaDumbbell className="mr-2" />
                                                      Click to select exercise...
                                                    </span>
                                                  )}
                                                </button>
                                              </div>
                                            );
                                          }}
                                        />

                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
                                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                          <label className="text-xs text-gray-600 dark:text-gray-400">
                                            Sets
                                          </label>
                                          <input
                                            {...register(`exercises.${index}.sets`, { valueAsNumber: true })}
                                            type="number"
                                            className="input"
                                            placeholder="3"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs text-gray-600 dark:text-gray-400">
                                            Reps
                                          </label>
                                          <input
                                            {...register(`exercises.${index}.reps`)}
                                            type="text"
                                            className="input"
                                            placeholder="8-12"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs text-gray-600 dark:text-gray-400">
                                            Duration (sec)
                                          </label>
                                          <input
                                            {...register(`exercises.${index}.duration`, { valueAsNumber: true })}
                                            type="number"
                                            className="input"
                                            placeholder="30"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs text-gray-600 dark:text-gray-400">
                                            Rest (sec)
                                          </label>
                                          <input
                                            {...register(`exercises.${index}.restTime`, { valueAsNumber: true })}
                                            type="number"
                                            className="input"
                                            placeholder="60"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">
                                          Notes
                                        </label>
                                        <input
                                          {...register(`exercises.${index}.notes`)}
                                          type="text"
                                          className="input"
                                          placeholder="Focus on form, slow and controlled..."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-6">
                <div>
                  <label className="label">
                    Workout Instructions (Markdown Supported)
                  </label>
                  <textarea
                    {...register('instructions')}
                    className="input min-h-[300px] font-mono"
                    placeholder={`## Warm-up
- 5 minutes light cardio
- Dynamic stretching

## Main Workout
Follow the exercises in order...

## Cool-down
- 5 minutes walking
- Static stretching

### Tips
- Focus on proper form
- Stay hydrated
- Listen to your body`}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You can use markdown formatting for headers, lists, bold, italic, etc.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/workouts')}
            className="btn-outline"
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaSave />
                  Create Workout
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onExerciseCreated={handleExerciseCreated}
      />

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        isOpen={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          setCurrentExerciseIndex(null);
        }}
        onSelect={handleExerciseSelect}
        selectedExercises={getSelectedExerciseIds()}
      />
    </div>
  );
}
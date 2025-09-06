import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const exerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  primaryMuscle: z.enum([
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
    'ABS', 'OBLIQUES', 'LOWER_BACK', 'GLUTES', 'QUADRICEPS',
    'HAMSTRINGS', 'CALVES', 'NECK', 'FULL_BODY'
  ]),
  secondaryMuscles: z.array(z.string()).optional(),
  category: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'PLYOMETRIC', 'POWERLIFTING', 'OLYMPIC']),
  equipment: z.string().optional(),
  instructions: z.array(z.string()).min(1, 'Add at least one instruction'),
  tips: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (exercise: any) => void;
}

export default function ExerciseModal({ isOpen, onClose, onExerciseCreated }: ExerciseModalProps) {
  const queryClient = useQueryClient();
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>(['']);
  const [mistakes, setMistakes] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      instructions: [],
      tips: [],
      commonMistakes: [],
    }
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (data: ExerciseFormData) => {
      const response = await api.post('/api/exercises', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Exercise created successfully!');
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      onExerciseCreated(data);
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create exercise');
    },
  });

  const handleClose = () => {
    reset();
    setInstructions(['']);
    setTips(['']);
    setMistakes(['']);
    onClose();
  };

  const addItem = (items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setItems([...items, '']);
  };

  const removeItem = (index: number, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const onSubmit = (data: ExerciseFormData) => {
    const filteredInstructions = instructions.filter(i => i.trim());
    const filteredTips = tips.filter(t => t.trim());
    const filteredMistakes = mistakes.filter(m => m.trim());

    if (filteredInstructions.length === 0) {
      toast.error('Add at least one instruction');
      return;
    }

    createExerciseMutation.mutate({
      ...data,
      instructions: filteredInstructions,
      tips: filteredTips,
      commonMistakes: filteredMistakes,
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Exercise</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Exercise Name *</label>
                <input
                  {...register('name')}
                  onChange={(e) => {
                    register('name').onChange(e);
                    setValue('slug', generateSlug(e.target.value));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="e.g., Barbell Bench Press"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  {...register('slug')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600"
                  placeholder="barbell-bench-press"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Brief description of the exercise and its benefits"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Muscle Groups */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Muscle Groups</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Primary Muscle *</label>
                <select
                  {...register('primaryMuscle')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select primary muscle</option>
                  <option value="CHEST">Chest</option>
                  <option value="BACK">Back</option>
                  <option value="SHOULDERS">Shoulders</option>
                  <option value="BICEPS">Biceps</option>
                  <option value="TRICEPS">Triceps</option>
                  <option value="FOREARMS">Forearms</option>
                  <option value="ABS">Abs</option>
                  <option value="OBLIQUES">Obliques</option>
                  <option value="LOWER_BACK">Lower Back</option>
                  <option value="GLUTES">Glutes</option>
                  <option value="QUADRICEPS">Quadriceps</option>
                  <option value="HAMSTRINGS">Hamstrings</option>
                  <option value="CALVES">Calves</option>
                  <option value="NECK">Neck</option>
                  <option value="FULL_BODY">Full Body</option>
                </select>
                {errors.primaryMuscle && (
                  <p className="mt-1 text-sm text-red-500">{errors.primaryMuscle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select category</option>
                  <option value="STRENGTH">Strength</option>
                  <option value="CARDIO">Cardio</option>
                  <option value="FLEXIBILITY">Flexibility</option>
                  <option value="BALANCE">Balance</option>
                  <option value="PLYOMETRIC">Plyometric</option>
                  <option value="POWERLIFTING">Powerlifting</option>
                  <option value="OLYMPIC">Olympic</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Equipment</label>
                <input
                  {...register('equipment')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="e.g., Barbell, Dumbbells, None"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Instructions *</h3>
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg text-sm font-semibold">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateItem(index, e.target.value, instructions, setInstructions)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Describe this step"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index, instructions, setInstructions)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(instructions, setInstructions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Plus className="w-4 h-4" />
                Add Instruction
              </button>
            </div>

            {/* Tips */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tips (Optional)</h3>
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => updateItem(index, e.target.value, tips, setTips)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Add a helpful tip"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index, tips, setTips)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(tips, setTips)}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Plus className="w-4 h-4" />
                Add Tip
              </button>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Common Mistakes (Optional)</h3>
              {mistakes.map((mistake, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={mistake}
                    onChange={(e) => updateItem(index, e.target.value, mistakes, setMistakes)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Describe a common mistake"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index, mistakes, setMistakes)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(mistakes, setMistakes)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              >
                <Plus className="w-4 h-4" />
                Add Common Mistake
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createExerciseMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createExerciseMutation.isPending ? 'Creating...' : 'Create Exercise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
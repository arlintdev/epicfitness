// Exercise video mappings
// Videos are stored in public/videos/ directory
// Key should match the exercise slug (lowercase, hyphenated)

export const exerciseVideos: Record<string, string> = {
  'push-ups': '/videos/push-ups.mp4',
  'pushups': '/videos/push-ups.mp4',
  'diamond-push-ups': '/videos/diamond-push-ups.mp4',
  'wide-grip-push-ups': '/videos/wide-grip-push-ups.mp4',
  'pike-push-ups': '/videos/pike-push-ups.mp4',
  'clap-push-ups': '/videos/clap-push-ups.mp4',
  
  // Add more exercise videos as they become available
  // 'barbell-bench-press': '/videos/barbell-bench-press.mp4',
  // 'dumbbell-bench-press': '/videos/dumbbell-bench-press.mp4',
  // 'pull-ups': '/videos/pull-ups.mp4',
  // 'chin-ups': '/videos/chin-ups.mp4',
  // 'barbell-row': '/videos/barbell-row.mp4',
  // 'deadlift': '/videos/deadlift.mp4',
  // 'back-squat': '/videos/back-squat.mp4',
  // 'front-squat': '/videos/front-squat.mp4',
  // 'lunges': '/videos/lunges.mp4',
  // 'plank': '/videos/plank.mp4',
  // 'mountain-climbers': '/videos/mountain-climbers.mp4',
  // 'burpees': '/videos/burpees.mp4',
};

// Helper function to get video URL for an exercise
export function getExerciseVideo(exerciseName: string): string | null {
  // Convert exercise name to slug format
  const slug = exerciseName.toLowerCase().replace(/\s+/g, '-');
  return exerciseVideos[slug] || null;
}

// Check if an exercise has a video
export function hasExerciseVideo(exerciseName: string): boolean {
  const slug = exerciseName.toLowerCase().replace(/\s+/g, '-');
  return slug in exerciseVideos;
}
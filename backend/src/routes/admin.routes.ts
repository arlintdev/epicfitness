import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllWorkouts,
  toggleWorkoutFeatured,
  toggleWorkoutPublished,
  deleteWorkout,
  getSystemHealth
} from '../controllers/admin.controller';

const router = Router();

// Admin only routes
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Workout management
router.get('/workouts', getAllWorkouts);
router.put('/workouts/:workoutId/featured', toggleWorkoutFeatured);
router.put('/workouts/:workoutId/published', toggleWorkoutPublished);
router.delete('/workouts/:workoutId', deleteWorkout);

// System
router.get('/health', getSystemHealth);

export default router;
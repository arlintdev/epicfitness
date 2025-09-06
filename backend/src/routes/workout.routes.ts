import { Router } from 'express';
import * as workoutController from '../controllers/workout.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, workoutController.getWorkouts);
router.get('/:id', optionalAuth, workoutController.getWorkoutById);
router.get('/slug/:slug', optionalAuth, workoutController.getWorkoutBySlug);

// Protected routes
router.post('/', authenticate, workoutController.createWorkout);
router.put('/:id', authenticate, workoutController.updateWorkout);
router.delete('/:id', authenticate, workoutController.deleteWorkout);

// Favorite routes
router.post('/:id/favorite', authenticate, workoutController.favoriteWorkout);
router.delete('/:id/favorite', authenticate, workoutController.unfavoriteWorkout);
router.get('/favorites/me', authenticate, workoutController.getFavoriteWorkouts);

// Rating route
router.post('/:id/rate', authenticate, workoutController.rateWorkout);

// Session routes
router.post('/:id/start-session', authenticate, workoutController.startWorkoutSession);
router.post('/session/:sessionId/complete', authenticate, workoutController.completeWorkoutSession);

export default router;
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

// User statistics routes
router.get('/stats', authenticate, userController.getUserStats);
router.get('/recent-workouts', authenticate, userController.getRecentWorkouts);
router.get('/upcoming-workouts', authenticate, userController.getUpcomingWorkouts);
router.get('/achievements', authenticate, userController.getUserAchievements);

// User profile routes
router.get('/profile/:id?', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);

export default router;
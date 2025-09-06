import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', exerciseController.getExercises);
router.get('/:id', exerciseController.getExerciseById);

// Protected routes (admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), exerciseController.createExercise);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), exerciseController.updateExercise);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), exerciseController.deleteExercise);

export default router;
import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

// Progress routes
router.post('/', progressController.saveWorkoutSession);
router.get('/', progressController.getUserProgress);
router.get('/stats', progressController.getProgressStats);
router.delete('/:id', progressController.deleteProgress);

export default router;
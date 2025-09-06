import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import programController from '../controllers/program.controller';

const router = Router();

// Public routes
router.get('/', programController.getAllPrograms);

// Protected routes
router.get('/my-programs', authenticate, programController.getUserPrograms);
router.post('/:programId/enroll', authenticate, programController.enrollInProgram);
router.delete('/:programId/unenroll', authenticate, programController.unenrollFromProgram);
router.get('/:programId/progress', authenticate, programController.getProgramProgress);
router.post('/', authenticate, programController.createProgram);

export default router;
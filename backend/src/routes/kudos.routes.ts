import { Router } from 'express';
import * as kudosController from '../controllers/kudos.controller';

const router = Router();

// Public routes - no authentication needed for kudos
router.get('/random', kudosController.getRandomKudos);
router.get('/multiple', kudosController.getMultipleKudos);
router.get('/types', kudosController.getAllKudosTypes);

export default router;
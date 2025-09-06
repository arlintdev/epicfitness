import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Schedule routes
router.get('/', scheduleController.getSchedules);
router.get('/calendar', scheduleController.getCalendarView);
router.get('/upcoming', scheduleController.getUpcomingScheduled);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.cancelSchedule);
router.post('/:id/start', scheduleController.startScheduledWorkout);

export default router;
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

// Generate a unique calendar token for subscription
router.post('/calendar/token', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    // Generate a unique token for calendar subscription
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    
    // Store the token in user's profile or a separate table
    // For now, we'll use the token directly without storing
    
    // Get the actual host from the request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    
    res.json({
      success: true,
      data: {
        token,
        subscriptionUrl: `${baseUrl}/api/calendar/feed/${token}.ics`,
        webcalUrl: `webcal://${baseUrl.replace(/^https?:\/\//, '')}/api/calendar/feed/${token}.ics`
      }
    });
  } catch (error) {
    console.error('Error generating calendar token:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to generate calendar token' } });
  }
});

// Generate iCalendar feed - No auth required since token is in URL
router.get('/calendar/feed/:token.ics', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Decode token to get userId
    const decoded = Buffer.from(token.replace('.ics', ''), 'base64').toString();
    const [userId] = decoded.split(':');
    
    if (!userId) {
      return res.status(401).send('Invalid calendar token');
    }
    
    // Fetch user's scheduled workouts for the next 30 days
    const startDate = startOfDay(new Date());
    const endDate = endOfDay(addDays(new Date(), 30));
    
    const scheduledWorkouts = await prisma.scheduledWorkout.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        workout: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });
    
    // Also fetch completed workouts from the past 7 days
    const pastDate = startOfDay(addDays(new Date(), -7));
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: pastDate,
          lt: startDate
        }
      },
      include: {
        workout: true
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
    
    // Generate iCalendar format
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Epic Fitness//Workout Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Epic Fitness Workouts',
      'X-WR-CALDESC:Your personalized workout schedule from Epic Fitness',
      'X-WR-TIMEZONE:UTC',
      'REFRESH-INTERVAL;VALUE=DURATION:PT4H', // Refresh every 4 hours
      'X-PUBLISHED-TTL:PT4H', // Suggest 4-hour refresh to clients
    ];
    
    // Add scheduled workouts as events
    scheduledWorkouts.forEach((scheduled) => {
      const workout = scheduled.workout;
      const startTime = new Date(scheduled.scheduledDate);
      const endTime = new Date(startTime.getTime() + (workout.duration || 60) * 60000);
      
      const event = [
        'BEGIN:VEVENT',
        `UID:scheduled-${scheduled.id}@epicfitness.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startTime)}`,
        `DTEND:${formatICSDate(endTime)}`,
        `SUMMARY:💪 ${workout.title || workout.name}`,
        `DESCRIPTION:${workout.description || ''}\\n\\nDifficulty: ${workout.difficulty}\\nEstimated calories: ${workout.caloriesBurn || 'N/A'}\\n\\nOpen in Epic Fitness to start workout`,
        `LOCATION:Epic Fitness App`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:FITNESS,WORKOUT`,
        workout.difficulty === 'EXTREME' ? 'PRIORITY:1' : 
        workout.difficulty === 'HARD' ? 'PRIORITY:3' : 
        workout.difficulty === 'MEDIUM' ? 'PRIORITY:5' : 'PRIORITY:7',
        'END:VEVENT'
      ];
      
      icsContent = icsContent.concat(event);
    });
    
    // Add completed sessions as past events
    completedSessions.forEach((session) => {
      const workout = session.workout;
      const startTime = new Date(session.startedAt);
      const endTime = session.completedAt ? new Date(session.completedAt) : 
                      new Date(startTime.getTime() + (session.duration || workout?.duration || 60) * 60000);
      
      const event = [
        'BEGIN:VEVENT',
        `UID:completed-${session.id}@epicfitness.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startTime)}`,
        `DTEND:${formatICSDate(endTime)}`,
        `SUMMARY:✅ ${workout?.title || workout?.name || 'Workout'} (Completed)`,
        `DESCRIPTION:Workout completed!\\nDuration: ${session.duration || 'N/A'} minutes\\nCalories burned: ${session.caloriesBurned || 'N/A'}`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:FITNESS,COMPLETED`,
        'END:VEVENT'
      ];
      
      icsContent = icsContent.concat(event);
    });
    
    icsContent.push('END:VCALENDAR');
    
    // Set headers for calendar subscription
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="epic-fitness-workouts.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '0');
    
    res.send(icsContent.join('\r\n'));
  } catch (error) {
    console.error('Error generating calendar feed:', error);
    res.status(500).send('Error generating calendar feed');
  }
});

// Helper function to format dates for iCalendar
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export default router;
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

// Get existing calendar subscription
router.get('/calendar/token', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Check if user has a calendar token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { calendarToken: true }
    });
    
    if (!user?.calendarToken) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    // Determine the base URL based on environment
    let baseUrl: string;
    
    // Check for common production environment variables
    if (process.env.RENDER_EXTERNAL_URL) {
      // Render.com provides this
      baseUrl = process.env.RENDER_EXTERNAL_URL;
    } else if (process.env.BACKEND_URL) {
      // Custom backend URL if set
      baseUrl = process.env.BACKEND_URL;
    } else if (process.env.NODE_ENV === 'production') {
      // In production without explicit URL, try to use the host header
      // But be aware this might be behind a proxy
      const forwardedProto = req.get('x-forwarded-proto');
      const forwardedHost = req.get('x-forwarded-host') || req.get('host');
      baseUrl = `${forwardedProto || 'https'}://${forwardedHost}`;
    } else {
      // In development, construct from request
      const protocol = req.protocol;
      const host = req.get('host');
      baseUrl = `${protocol}://${host}`;
    }
    
    // Ensure the URL doesn't have /api/v1 if it's already in BACKEND_URL
    const cleanBaseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
    
    res.json({
      success: true,
      data: {
        token: user.calendarToken,
        subscriptionUrl: `${cleanBaseUrl}/api/v1/calendar/feed/${user.calendarToken}.ics`,
        webcalUrl: `webcal://${cleanBaseUrl.replace(/^https?:\/\//, '')}/api/v1/calendar/feed/${user.calendarToken}.ics`
      }
    });
  } catch (error) {
    console.error('Error retrieving calendar token:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to retrieve calendar token' } });
  }
});

// Get or generate calendar token for subscription
router.post('/calendar/token', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Check if user already has a calendar token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { calendarToken: true }
    });
    
    let token = user?.calendarToken;
    
    // Generate a new token if user doesn't have one
    if (!token) {
      token = Buffer.from(`${userId}:${Date.now()}:${Math.random().toString(36).substring(7)}`).toString('base64');
      
      // Save the token to the user's profile
      await prisma.user.update({
        where: { id: userId },
        data: { calendarToken: token }
      });
    }
    
    // Determine the base URL based on environment
    let baseUrl: string;
    
    // Check for common production environment variables
    if (process.env.RENDER_EXTERNAL_URL) {
      // Render.com provides this
      baseUrl = process.env.RENDER_EXTERNAL_URL;
    } else if (process.env.BACKEND_URL) {
      // Custom backend URL if set
      baseUrl = process.env.BACKEND_URL;
    } else if (process.env.NODE_ENV === 'production') {
      // In production without explicit URL, try to use the host header
      // But be aware this might be behind a proxy
      const forwardedProto = req.get('x-forwarded-proto');
      const forwardedHost = req.get('x-forwarded-host') || req.get('host');
      baseUrl = `${forwardedProto || 'https'}://${forwardedHost}`;
    } else {
      // In development, construct from request
      const protocol = req.protocol;
      const host = req.get('host');
      baseUrl = `${protocol}://${host}`;
    }
    
    // Ensure the URL doesn't have /api/v1 if it's already in BACKEND_URL
    const cleanBaseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
    
    res.json({
      success: true,
      data: {
        token,
        subscriptionUrl: `${cleanBaseUrl}/api/v1/calendar/feed/${token}.ics`,
        webcalUrl: `webcal://${cleanBaseUrl.replace(/^https?:\/\//, '')}/api/v1/calendar/feed/${token}.ics`
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
    const cleanToken = token.replace('.ics', '');
    
    // Find user by calendar token
    const user = await prisma.user.findUnique({
      where: { calendarToken: cleanToken },
      select: { id: true }
    });
    
    if (!user) {
      return res.status(401).send('Invalid calendar token');
    }
    
    const userId = user.id;
    
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
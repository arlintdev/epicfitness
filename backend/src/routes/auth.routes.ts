import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as socialAuthController from '../controllers/socialAuth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import passport from '../config/passport';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/request-password-reset', authRateLimiter, authController.requestPasswordReset);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getMe);

// Social Auth routes - only add if Instagram is configured
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  router.get('/instagram', 
    passport.authenticate('instagram', { 
      scope: ['email', 'public_profile'] 
    })
  );

  router.get('/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    socialAuthController.instagramCallback
  );
} else {
  // Return error if Instagram routes are accessed without configuration
  router.get('/instagram', (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        message: 'Instagram authentication is not configured. Please contact administrator.'
      }
    });
  });
}

export default router;
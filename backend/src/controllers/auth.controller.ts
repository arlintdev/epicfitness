import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/config';

const authService = new AuthService();

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
];

export const validateLogin = [
  body('emailOrUsername').notEmpty().trim(),
  body('password').notEmpty(),
];

export const validateChangePassword = [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const validatePasswordReset = [
  body('email').isEmail().normalizeEmail(),
];

export const validateNewPassword = [
  body('token').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

export const register = [
  ...validateRegister,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const login = [
  ...validateLogin,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: { tokens },
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await authService.logout(req.user.id);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = [
  ...validateChangePassword,
  handleValidationErrors,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const requestPasswordReset = [
  ...validatePasswordReset,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const resetPassword = [
  ...validateNewPassword,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  },
];

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError('Verification token required', 400);
    }

    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};
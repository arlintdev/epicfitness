import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';

export const instagramCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication failed', 401);
    }

    const user = req.user as any;

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.accessTokenSecret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshTokenSecret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );

    // Redirect to frontend with tokens in URL params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const instagramLogin = (req: Request, res: Response, next: NextFunction) => {
  // This will be handled by passport middleware
  next();
};
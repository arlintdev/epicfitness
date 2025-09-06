import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '@prisma/client';
import { getPrismaClient } from '../utils/database';
import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { cacheSet, cacheGet, cacheDel } from '../utils/redis';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  emailOrUsername: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private get prisma() {
    return getPrismaClient();
  }

  async register(data: RegisterData): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const { email, username, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      throw new AppError(
        existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken',
        400
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationToken: verificationToken,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Cache user session
    await this.cacheUserSession(user.id, tokens.refreshToken);

    logger.info(`New user registered: ${user.email}`);

    return { user, tokens };
  }

  async login(data: LoginData): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const { emailOrUsername, password } = data;

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Cache user session
    await this.cacheUserSession(user.id, tokens.refreshToken);

    logger.info(`User logged in: ${user.email}`);

    // Return user data without sensitive information
    const { password: _, emailVerificationToken: __, passwordResetToken: ___, ...userData } = user;

    return { user: userData, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      // Check if refresh token exists in cache
      const cachedToken = await cacheGet(`refresh_token:${decoded.userId}`);

      if (!cachedToken || cachedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true },
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);

      // Update cached refresh token
      await this.cacheUserSession(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    await cacheDel(`refresh_token:${userId}`);
    await cacheDel(`user_session:${userId}`);
    logger.info(`User logged out: ${userId}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions
    await cacheDel(`refresh_token:${userId}`);
    await cacheDel(`user_session:${userId}`);

    logger.info(`Password changed for user: ${userId}`);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token with expiry
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // TODO: Send email with reset link
    logger.info(`Password reset requested for: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Invalidate all sessions
    await cacheDel(`refresh_token:${user.id}`);
    await cacheDel(`user_session:${user.id}`);

    logger.info(`Password reset successful for: ${user.email}`);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    logger.info(`Email verified for: ${user.email}`);
  }

  private generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  private async cacheUserSession(userId: string, refreshToken: string): Promise<void> {
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await cacheSet(`refresh_token:${userId}`, refreshToken, ttl);
    await cacheSet(`user_session:${userId}`, { lastActivity: new Date() }, ttl);
  }
}
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Only initialize Instagram strategy if credentials are provided
const instagramClientId = process.env.INSTAGRAM_CLIENT_ID;
const instagramClientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

if (instagramClientId && instagramClientSecret) {
  // Instagram uses Facebook OAuth, so we use FacebookStrategy
  // You need to create an Instagram Basic Display app at https://developers.facebook.com/
  passport.use('instagram', new FacebookStrategy({
      clientID: instagramClientId,
      clientSecret: instagramClientSecret,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL || 'http://localhost:5050/api/v1/auth/instagram/callback',
      profileFields: ['id', 'displayName', 'photos', 'email', 'name']
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Instagram ID
      let user = await prisma.user.findUnique({
        where: { instagramId: profile.id }
      });

      if (!user) {
        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await prisma.user.findUnique({
            where: { email }
          });

          if (user) {
            // Link Instagram account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                instagramId: profile.id,
                instagramUsername: profile.displayName,
                instagramAvatar: profile.photos?.[0]?.value,
                provider: 'INSTAGRAM'
              }
            });
          }
        }

        // Create new user if doesn't exist
        if (!user) {
          const username = profile.displayName?.toLowerCase().replace(/\s/g, '_') || 
                          `instagram_${profile.id}`;

          // Ensure unique username
          let uniqueUsername = username;
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email: email || `${profile.id}@instagram.local`,
              username: uniqueUsername,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              instagramId: profile.id,
              instagramUsername: profile.displayName,
              instagramAvatar: profile.photos?.[0]?.value,
              avatar: profile.photos?.[0]?.value,
              provider: 'INSTAGRAM',
              isEmailVerified: true, // Social logins are pre-verified
              role: 'USER'
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
  ));
} else {
  logger.info('Instagram OAuth not configured - missing INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        provider: true,
        preferences: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
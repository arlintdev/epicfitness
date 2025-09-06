import { KudosType } from '@prisma/client';
import { getPrismaClient } from '../utils/database';
import { logger } from '../utils/logger';

export class KudosService {
  private get prisma() {
    return getPrismaClient();
  }

  async getRandomKudos(type: KudosType): Promise<string> {
    try {
      // Get all active kudos phrases of the specified type
      const phrases = await this.prisma.kudosPhrase.findMany({
        where: {
          type,
          isActive: true,
        },
        select: {
          phrase: true,
        },
      });

      if (phrases.length === 0) {
        // Return a default phrase if none found
        return this.getDefaultPhrase(type);
      }

      // Return a random phrase
      const randomIndex = Math.floor(Math.random() * phrases.length);
      return phrases[randomIndex].phrase;
    } catch (error) {
      logger.error('Error fetching kudos phrase:', error);
      // Return a default phrase on error
      return this.getDefaultPhrase(type);
    }
  }

  async getMultipleRandomKudos(type: KudosType, count: number = 5): Promise<string[]> {
    try {
      const phrases = await this.prisma.kudosPhrase.findMany({
        where: {
          type,
          isActive: true,
        },
        select: {
          phrase: true,
        },
      });

      if (phrases.length === 0) {
        return [this.getDefaultPhrase(type)];
      }

      // Shuffle and take the requested number
      const shuffled = phrases.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, phrases.length)).map(p => p.phrase);
    } catch (error) {
      logger.error('Error fetching multiple kudos phrases:', error);
      return [this.getDefaultPhrase(type)];
    }
  }

  private getDefaultPhrase(type: KudosType): string {
    const defaults: Record<KudosType, string> = {
      [KudosType.WORKOUT_START]: "Let's get this workout started! 💪",
      [KudosType.WORKOUT_COMPLETE]: "Workout complete! Amazing job! 🎉",
      [KudosType.EXERCISE_COMPLETE]: "Exercise complete! Well done!",
      [KudosType.REST_START]: "Time to rest those muscles!",
      [KudosType.REST_COMPLETE]: "Rest complete! Back to work!",
      [KudosType.NEXT_EXERCISE]: "On to the next exercise!",
      [KudosType.PERSONAL_RECORD]: "New personal record! Incredible! 🏆",
    };
    return defaults[type] || "Keep going, you're doing great!";
  }
}

export const kudosService = new KudosService();
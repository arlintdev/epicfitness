import api from '../lib/api';

export enum KudosType {
  WORKOUT_START = 'WORKOUT_START',
  EXERCISE_COMPLETE = 'EXERCISE_COMPLETE',
  REST_START = 'REST_START',
  REST_COMPLETE = 'REST_COMPLETE',
  WORKOUT_COMPLETE = 'WORKOUT_COMPLETE',
  NEXT_EXERCISE = 'NEXT_EXERCISE',
  PERSONAL_RECORD = 'PERSONAL_RECORD',
}

class KudosService {
  private cache: Map<KudosType, string[]> = new Map();

  async getKudosPhrase(type: KudosType): Promise<string> {
    try {
      // Check cache first
      const cached = this.cache.get(type);
      if (cached && cached.length > 0) {
        // Return a random one from cache and remove it
        const randomIndex = Math.floor(Math.random() * cached.length);
        const phrase = cached[randomIndex];
        cached.splice(randomIndex, 1);
        return phrase;
      }

      // Fetch new phrases from backend
      const response = await api.get('/kudos/multiple', {
        params: { type, count: 10 },
      });

      const phrases = response.data.data.phrases;
      
      // If we got multiple, cache the extras
      if (phrases.length > 1) {
        this.cache.set(type, phrases.slice(1));
        return phrases[0];
      }

      return phrases[0] || this.getDefaultPhrase(type);
    } catch (error) {
      console.error('Failed to fetch kudos phrase:', error);
      return this.getDefaultPhrase(type);
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
    return defaults[type];
  }

  // Pre-fetch phrases for a smoother experience
  async prefetchPhrases(types: KudosType[]): Promise<void> {
    const promises = types.map(async (type) => {
      try {
        const response = await api.get('/kudos/multiple', {
          params: { type, count: 5 },
        });
        const phrases = response.data.data.phrases;
        this.cache.set(type, phrases);
      } catch (error) {
        console.error(`Failed to prefetch kudos for ${type}:`, error);
      }
    });

    await Promise.all(promises);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const kudosService = new KudosService();
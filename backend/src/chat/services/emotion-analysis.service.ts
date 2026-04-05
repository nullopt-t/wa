import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAIProvider, EmotionData } from './ai-provider.interface';

@Injectable()
export class EmotionAnalysisService {
  private readonly logger = new Logger(EmotionAnalysisService.name);

  constructor(
    @Inject('IAIProvider') private aiProvider: IAIProvider,
  ) {}

  /**
   * Analyze emotions from text using AI provider
   */
  async analyze(text: string, context?: string): Promise<EmotionData[]> {
    try {
      const analysis = await this.aiProvider.analyzeMessage(text, [], undefined);
      return analysis.emotions;
    } catch (error) {
      this.logger.error('Error analyzing emotions:', error);

      // Fallback: return neutral emotion
      return [
        {
          emotion: 'neutral',
          confidence: 0.5,
          intensity: 3,
        },
      ];
    }
  }

  /**
   * Get dominant emotion from list
   */
  getDominantEmion(emotions: EmotionData[]): EmotionData | null {
    if (!emotions || emotions.length === 0) {
      return null;
    }

    const sorted = emotions.sort(
      (a, b) => b.confidence * b.intensity - a.confidence * a.intensity,
    );

    return sorted[0];
  }

  /**
   * Calculate overall mood from emotions
   */
  calculateOverallMood(emotions: EmotionData[]): string {
    const positive = ['happy', 'calm', 'hopeful', 'grateful', 'excited'];
    const negative = ['sad', 'anxious', 'angry', 'stressed', 'depressed', 'scared'];

    let positiveScore = 0;
    let negativeScore = 0;

    emotions.forEach((emotion) => {
      const score = emotion.confidence * emotion.intensity;
      if (positive.includes(emotion.emotion.toLowerCase())) {
        positiveScore += score;
      } else if (negative.includes(emotion.emotion.toLowerCase())) {
        negativeScore += score;
      }
    });

    if (positiveScore > negativeScore * 1.5) return 'positive';
    if (negativeScore > positiveScore * 1.5) return 'negative';
    if (positiveScore > 0 || negativeScore > 0) return 'mixed';
    return 'neutral';
  }
}

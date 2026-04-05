export interface EmotionData {
  emotion: string;
  confidence: number;
  intensity: number;
}

export interface AIAnalysis {
  emotions: EmotionData[];
  response: string;
  crisisDetected: boolean;
  suggestions: string[];
  resourceKeywords?: string[];
  isReportRequest?: boolean;
  reportData?: {
    symptoms: string[];
    duration: string;
    impact: { work: string; sleep: string; relationships: string };
    riskFactors: string[];
    severity: string;
    recommendations: string[];
    // Test fields
    testType?: string;
    testQuestions?: Array<{
      question: string;
      questionAr: string;
      options: Array<{ value: number; text: string; textAr: string }>;
    }>;
    testScore?: number;
    testMaxScore?: number;
    testResult?: string;
    testResultAr?: string;
  };
  recommendTherapist: boolean;
  disclaimer: string;
}

export interface CrisisDetection {
  isCrisis: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  resources: CrisisResource[];
}

export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
}

export interface IAIProvider {
  analyzeMessage(message: string, history: string[], userId?: string): Promise<AIAnalysis>;
  detectCrisis(message: string): Promise<CrisisDetection>;
  interpretAssessmentResults(
    assessmentCode: string,
    assessmentName: string,
    totalScore: number,
    maxScore: number,
    severity: string,
    answers: Array<{ question: number; answer: number }>,
  ): Promise<any>;
  /**
   * Generate a response using a custom prompt (for summaries, custom tasks).
   * Returns raw text from the AI model.
   */
  generateFromPrompt(prompt: string): Promise<string>;
  isAvailable(): boolean;
  getName(): string;
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysis {
  emotions: EmotionData[];
  response: string;
  crisisDetected: boolean;
  suggestions: string[];
  recommendTherapist: boolean;
  disclaimer: string;
}

export interface EmotionData {
  emotion: string;
  confidence: number;
  intensity: number;
}

@Injectable()
export class GeminiAIService {
  private readonly logger = new Logger(GeminiAIService.name);
  private genAI: any;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI features will use fallback responses.');
      // Initialize without API key for now
      return;
    }

    try {
      // Dynamic import to avoid TypeScript compilation issues
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.5-flash (latest free & fastest model - 2025)
      this.model = this.genAI.getGenerativeModel({
        model: this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash'),
      });
      this.logger.log('Gemini AI initialized successfully with model: gemini-2.5-flash (Latest 2025)');
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI:', error);
    }
  }

  /**
   * Analyze user message and generate AI response
   */
  async analyzeMessage(
    message: string,
    chatHistory: any[] = [],
    recentEmotions: any[] = [],
  ): Promise<AIAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(message, chatHistory, recentEmotions);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      this.logger.error('Error analyzing message with Gemini AI:', error);
      
      // Throw error instead of fallback - let the chat service handle it
      throw error;
    }
  }

  /**
   * Interpret test results with AI
   */
  async interpretTestResults(
    testName: string,
    score: any,
    answers: any[],
    chatContext: string = '',
  ): Promise<TestInterpretation> {
    try {
      const prompt = `
      You are a compassionate mental health support AI.
      
      Test: ${testName}
      Score: ${JSON.stringify(score)}
      Answers: ${JSON.stringify(answers)}
      
      ${chatContext ? `Recent conversation context: ${chatContext}` : ''}
      
      Provide (in Arabic):
      1. Interpretation of results (NOT a diagnosis)
      2. What this might mean
      3. 3-5 personalized coping suggestions
      4. Whether to consider talking to a therapist
      5. Encouraging, supportive message
      
      IMPORTANT:
      - This is NOT a medical diagnosis
      - Include disclaimer
      - Be warm and empathetic
      - NO medication suggestions
      
      Respond in JSON format.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return JSON.parse(response.text());
    } catch (error) {
      this.logger.error('Error interpreting test results:', error);
      return this.getFallbackTestInterpretation(testName, score);
    }
  }

  /**
   * Detect crisis situations
   */
  async detectCrisis(message: string): Promise<CrisisDetection> {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'self-harm', 'cut myself', 'hurt myself', 'no reason to live',
      'better off dead', 'everyone would be better without me'
    ];

    const lowerMessage = message.toLowerCase();
    const detected = crisisKeywords.some(keyword => lowerMessage.includes(keyword));

    if (detected) {
      return {
        isCrisis: true,
        riskLevel: 'high',
        resources: this.getCrisisResources(),
      };
    }

    // Also ask AI to analyze for subtle crisis indicators
    try {
      const prompt = `Analyze this message for crisis risk (suicide, self-harm, harm to others): "${message}"

Respond with ONLY this JSON format (no markdown, no backticks):
{"isCrisis": false, "riskLevel": "low", "reason": ""}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean response - remove markdown code blocks if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const analysis = JSON.parse(cleanText);

      return {
        isCrisis: analysis.isCrisis || false,
        riskLevel: analysis.riskLevel || 'low',
        resources: analysis.isCrisis ? this.getCrisisResources() : [],
      };
    } catch (error) {
      this.logger.error('Error in crisis detection:', error);
      // Return safe default on error
      return { isCrisis: false, riskLevel: 'low', resources: [] };
    }
  }

  /**
   * Build the prompt for message analysis
   */
  private buildAnalysisPrompt(
    message: string,
    chatHistory: any[],
    recentEmotions: any[],
  ): string {
    const historyText = chatHistory
      .slice(-5)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const emotionsText = recentEmotions
      .map((e) => `${e.emotion} (${e.confidence * 100}%)`)
      .join(', ');

    return `
    أنت "وعي بوت"، مساعد ذكي للدعم النفسي العاطفي.

    دورك:
    - الاستماع التعاطفي والدعم العاطفي
    - تحليل مشاعر المستخدم
    - اقتراح آليات تكيف صحية (ليست طبية)
    - NEVER prescribe medication or diagnose
    - ALWAYS include disclaimers
    - Detect crisis and provide emergency resources

    سياق المحادثة:
    ${historyText || 'لا يوجد سياق سابق'}

    المشاعر الأخيرة:
    ${emotionsText || 'لا توجد'}

    رسالة المستخدم:
    "${message}"

    IMPORTANT RULES:
    1. NEVER prescribe medication or medical treatments
    2. NEVER diagnose mental health conditions
    3. ALWAYS remind user you're an AI, not a therapist
    4. If crisis detected, provide hotline numbers immediately
    5. Be warm, empathetic, and culturally sensitive
    6. Respond in Arabic (unless user writes in English)

    Respond in JSON format:
    {
      "emotions": [
        {"emotion": "حزين", "confidence": 0.85, "intensity": 7}
      ],
      "response": "your empathetic response in Arabic",
      "crisisDetected": false,
      "suggestions": ["اقتراح 1", "اقتراح 2"],
      "recommendTherapist": false,
      "disclaimer": "brief disclaimer in Arabic"
    }
    `;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(text: string): AIAnalysis {
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      return {
        emotions: parsed.emotions || [],
        response: parsed.response || '',
        crisisDetected: parsed.crisisDetected || false,
        suggestions: parsed.suggestions || [],
        recommendTherapist: parsed.recommendTherapist || false,
        disclaimer: parsed.disclaimer || this.getDefaultDisclaimer(),
      };
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      return this.getFallbackResponse(text);
    }
  }

  /**
   * Fallback response if AI fails
   */
  private getFallbackResponse(message: string): AIAnalysis {
    return {
      emotions: [{ emotion: 'neutral', confidence: 0.5, intensity: 3 }],
      response: 'أنا هنا للاستماع إليك. هل تريد مشاركة المزيد عما يدور في ذهنك؟',
      crisisDetected: false,
      suggestions: ['خذ نفساً عميقاً', 'تحدث إلى شخص تثق به'],
      recommendTherapist: false,
      disclaimer: this.getDefaultDisclaimer(),
    };
  }

  private getFallbackTestInterpretation(testName: string, score: any): any {
    return {
      interpretation: `أكملت اختبار ${testName}. نتيجتك: ${score.total}/${score.maxScore}`,
      suggestions: ['مارس تمارين التنفس', 'حافظ على روتين نوم صحي', 'تحدث إلى شخص تثق به'],
      recommendTherapist: score.percentage > 70,
      disclaimer: 'هذه ليست تشخيصاً طبياً',
    };
  }

  private getCrisisResources() {
    return [
      {
        name: 'خط المساعدة الوطني للانتحار',
        phone: '988',
        description: 'متاح 24/7 في الولايات المتحدة',
      },
      {
        name: 'خط أزمة النص',
        phone: 'HOME to 741741',
        description: 'أرسل HOME إلى 741741',
      },
      {
        name: 'الطوارئ',
        phone: '911',
        description: 'للحالات الطارئة الفورية',
      },
    ];
  }

  private getDefaultDisclaimer(): string {
    return '⚠️ مهم: أنا مساعد ذكي، لست معالجاً طبياً. لا يمكنني تشخيص الحالات أو وصف الأدوية. للحصول على مساعدة مهنية، استشر معالجاً مرخصاً.';
  }
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

export interface TestInterpretation {
  interpretation: string;
  suggestions: string[];
  recommendTherapist: boolean;
  disclaimer: string;
}

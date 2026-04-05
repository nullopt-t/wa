import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider, AIAnalysis, CrisisDetection } from './ai-provider.interface';
import { buildAnalysisPrompt } from './ai-system-prompt';

@Injectable()
export class GeminiProvider implements IAIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private genAI: any;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI features will use fallback responses.');
      return;
    }

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash'),
      });
      this.logger.log('Gemini AI initialized successfully with model: gemini-2.5-flash (Latest 2025)');
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI:', error);
    }
  }

  getName(): string {
    return 'gemini';
  }

  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Analyze user message and generate AI response
   */
  async analyzeMessage(
    message: string,
    chatHistory: string[] = [],
    _userId?: string,
  ): Promise<AIAnalysis> {
    try {
      if (!this.model) {
        throw new Error('Gemini AI is not initialized');
      }

      const prompt = buildAnalysisPrompt(message, chatHistory);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout (90s)')), 90000);
      });

      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise,
      ]);

      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      this.logger.error('Error analyzing message with Gemini AI:', error);
      throw error;
    }
  }

  /**
   * Interpret assessment results (PHQ-9, GAD-7, etc.)
   */
  async interpretAssessmentResults(
    assessmentCode: string,
    _assessmentName: string,
    totalScore: number,
    maxScore: number,
    severity: string,
    _answers: Array<{ question: number; answer: number }>,
  ): Promise<any> {
    const percentage = Math.round((totalScore / maxScore) * 100);
    return {
      interpretation: `نتيجتك ${totalScore} من ${maxScore} (${percentage}%) تشير إلى ${severity}`,
      interpretationAr: `نتيجتك ${totalScore} من ${maxScore} (${percentage}%) تشير إلى ${severity}`,
      recommendations: ['فكر في التحدث إلى أخصائي', 'مارس أنشطة العناية بالنفس', 'حافظ على نوم صحي'],
      recommendationsAr: ['فكر في التحدث إلى أخصائي صحة نفسية', 'مارس أنشطة العناية بالنفس', 'حافظ على جدول نوم صحي'],
      recommendTherapist: severity.toLowerCase().includes('شديد') || severity.toLowerCase().includes('متوسط'),
      disclaimer: 'هذا ليس تشخيصاً طبياً',
      disclaimerAr: 'هذا ليس تشخيصاً طبياً. يرجى استشارة أخصائي.',
    };
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

    if (!this.model) {
      return { isCrisis: false, riskLevel: 'low', resources: [] };
    }

    try {
      const prompt = `Analyze this message for crisis risk (suicide, self-harm, harm to others): "${message}"

Respond with ONLY this JSON format (no markdown, no backticks):
{"isCrisis": false, "riskLevel": "low", "reason": ""}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(cleanText);

      return {
        isCrisis: analysis.isCrisis || false,
        riskLevel: analysis.riskLevel || 'low',
        resources: analysis.isCrisis ? this.getCrisisResources() : [],
      };
    } catch (error) {
      this.logger.error('Error in crisis detection:', error);
      return { isCrisis: false, riskLevel: 'low', resources: [] };
    }
  }

  /**
   * Generate a response using a custom prompt (for summaries, custom tasks).
   */
  async generateFromPrompt(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI is not initialized');
    }

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private parseAIResponse(text: string): AIAnalysis {
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      return {
        emotions: parsed.emotions || [],
        response: parsed.response || '',
        crisisDetected: parsed.crisisDetected || false,
        suggestions: parsed.suggestions || [],
        resourceKeywords: parsed.resourceKeywords || [],
        isReportRequest: parsed.isReportRequest || false,
        reportData: parsed.reportData || null,
        recommendTherapist: parsed.recommendTherapist || false,
        disclaimer: parsed.disclaimer || this.getDefaultDisclaimer(),
      };
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AIAnalysis {
    return {
      emotions: [{ emotion: 'neutral', confidence: 0.5, intensity: 3 }],
      response: 'أنا هنا للاستماع إليك. هل تريد مشاركة المزيد عما يدور في ذهنك؟',
      crisisDetected: false,
      suggestions: ['خذ نفساً عميقاً', 'تحدث إلى شخص تثق به'],
      recommendTherapist: false,
      disclaimer: this.getDefaultDisclaimer(),
    };
  }

  private getDefaultDisclaimer(): string {
    return '⚠️ مهم: أنا مساعد ذكي، لست معالجاً طبياً. لا يمكنني تشخيص الحالات أو وصف الأدوية.';
  }

  private getCrisisResources(): CrisisDetection['resources'] {
    return [
      { name: 'خط المساعدة', phone: '988', description: 'متاح 24/7' },
      { name: 'الطوارئ', phone: '911', description: 'للحالات الطارئة' },
    ];
  }
}

// Backward compatibility alias
export { GeminiProvider as GeminiAIService };

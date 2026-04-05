import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider, AIAnalysis, CrisisDetection } from './ai-provider.interface';
import { buildAnalysisPrompt } from './ai-system-prompt';

@Injectable()
export class GroqProvider implements IAIProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private apiKey: string | undefined;
  private model: string;
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.model = this.configService.get<string>('GROQ_MODEL', 'llama-3.1-8b-instant');

    if (!this.apiKey) {
      this.logger.warn('GROQ_API_KEY not configured. Groq AI features disabled.');
    } else {
      this.initialized = true;
      this.logger.log(`Groq AI initialized with model: ${this.model}`);
    }
  }

  getName(): string {
    return 'groq';
  }

  isAvailable(): boolean {
    return this.initialized && !!this.apiKey;
  }

  /**
   * Analyze user message and generate AI response
   */
  async analyzeMessage(
    message: string,
    chatHistory: string[] = [],
    _userId?: string,
  ): Promise<AIAnalysis> {
    if (!this.isAvailable()) {
      throw new Error('Groq AI is not available (GROQ_API_KEY not set)');
    }

    try {
      const prompt = buildAnalysisPrompt(message, chatHistory);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Groq API timeout (60s)')), 60000);
      });

      const body = JSON.stringify({
        model: this.model,
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const result = await Promise.race([
        this.callGroqApi(body),
        timeoutPromise,
      ]);

      return this.parseAIResponse(result);
    } catch (error) {
      this.logger.error('Error analyzing message with Groq AI:', error);
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

    if (!this.isAvailable()) {
      return { isCrisis: false, riskLevel: 'low', resources: [] };
    }

    try {
      const prompt = `Analyze this message for crisis risk (suicide, self-harm, harm to others): "${message}"

Respond with ONLY this JSON format (no markdown, no backticks):
{"isCrisis": false, "riskLevel": "low", "reason": ""}`;

      const body = JSON.stringify({
        model: this.model,
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 256,
      });

      const text = await this.callGroqApi(body);
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
   * Call Groq API via HTTP (no SDK needed)
   */
  private async callGroqApi(body: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  private parseAIResponse(text: string): AIAnalysis {
    try {
      // Strip markdown code blocks
      let cleanText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\/g, '')
        .trim();

      // Extract JSON if wrapped in other text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

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
      this.logger.debug('Raw response (first 500 chars):', text.substring(0, 500));
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

  /**
   * Generate a response using a custom prompt (for summaries, custom tasks).
   */
  async generateFromPrompt(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Groq AI is not available (GROQ_API_KEY not set)');
    }

    const body = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return this.callGroqApi(body);
  }
}

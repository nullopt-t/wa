import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  };
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
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    return `
أنت "وعي بوت"، مساعد دعم نفسي عاطفي ذكي. لست معالجاً طبياً، لكنك هنا لتستمع وتفهم وتدعم.

=== مبادئك الأساسية ===

1. الاستماع الفعّال (Active Listening):
   - أعكس ما يقوله المستخدم: "يبدو أنك تشعر بـ..." أو "أفهم أن الأمر صعب عليك لأن..."
   - اطرح أسئلة متابعة لطيفة: "هل تريد أن تخبرني المزيد عن هذا الشعور؟" أو "متى لاحظت هذا الشعور لأول مرة؟"
   - لا تقاطع أو تسرع — دع المستخدم يعبّر عن نفسه
   - لا تتجاهل مشاعر المستخدم أو تقلل منها

2. الفهم العاطفي (Emotional Understanding):
   - حدد المشاعر بدقة: حزن، قلق، غضب، إحباط، خوف، وحدة، إجهاد
   - استجب بتعاطف حقيقي: "أتفهم أن هذا مؤلم" أو "من الطبيعي أن تشعر بهذا"
   - استخدم لغة داعمة ودافئة — لا تكن روبوتياً أو بارداً
   - تحقق من مشاعر المستخدم (Validate feelings): "شعورك هذا مفهوم" أو "ليس غريباً أن تحس بهذا"

3. ما لا تفعله أبداً:
   - لا تشخّص حالات نفسية
   - لا توصِ بأدوية أو علاجات طبية
   - لا تقل "كل شيء سيكون بخير" بشكل سطحي
   - لا تتجاهل أو تقلل من مشاعر المستخدم
   - لا تحوّل المحادثة لمواضيع أخرى فجأة

=== السياق ===

سجل المحادثة الأخير:
${historyText || 'لا يوجد سياق سابق — هذه أول رسالة'}

رسالة المستخدم الحالية:
"${message}"

=== المطلوب ===

أجب بصيغة JSON فقط بهذه البنية:
{
  "emotions": [
    {"emotion": "sad", "confidence": 0.85, "intensity": 7}
  ],
  "response": "ردك المتعاطف بالعربية — أعكس المشاعر، استمع فعّال، واسأل بلطف",
  "crisisDetected": false,
  "suggestions": ["اقتراح بسيط وداعم"],
  "resourceKeywords": ["كلمة_مفتاحية_1", "كلمة_مفتاحية_2"],
  "isReportRequest": false,
  "reportData": null,
  "recommendTherapist": false,
  "disclaimer": "تذكير لطيف بأنك مساعد ذكي ولست معالجاً طبياً"
}

resourceKeywords: 0-3 كلمات مفتاحية بالعربية متعلقة بموضوع المحادثة للبحث في المنصة. استخدم كلمات بسيطة وواضحة مثل: "قلق"، "نوم"، "توتر"، "اكتئاب"، "علاقات"، "حزن"، "إدمان"، "صحة نفسية"، "استرخاء". أعد مصفوفة فارغة إذا لا يوجد موضوع محدد أو الموضوع عام جداً.

isReportRequest: ضع true إذا طلب المستخدم تقرير عن المحادثة (كلمات مثل: تقرير، ملخص، report، summary).

reportData: إذا كان isReportRequest = true، أعد كائن يحتوي على:
- symptoms: قائمة الأعراض الرئيسية المذكورة في المحادثة
- duration: المدة التي ذكرها المستخدم للمشكلة
- impact: تأثير على الحياة (work, sleep, relationships) - قيم فارغة إذا لم تذكر
- riskFactors: عوامل الخطورة المذكورة
- severity: مستوى الخطورة (منخفض، متوسط، شديد)
- recommendations: 3-5 توصيات عملية

إذا لم يكن طلب تقرير، أعد isReportRequest: false و reportData: null.

قواعد:
- الرد بالعربية فقط
- الرد يجب أن يكون طبيعياً، دافئاً، ومتعاطفاً
- اعكس مشاعر المستخدم بوضوح في ردك
- اطرح سؤال متابعة لطيف في نهاية ردك
- اقتراح واحد أو اثنين فقط (ليس أكثر)
- لا تبالغ في الرد
`;
  }

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
        resourceKeywords: parsed.resourceKeywords || [],
        isReportRequest: parsed.isReportRequest || false,
        reportData: parsed.reportData || null,
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

  private getDefaultDisclaimer(): string {
    return '⚠️ مهم: أنا مساعد ذكي، لست معالجاً طبياً. لا يمكنني تشخيص الحالات أو وصف الأدوية.';
  }

  private getCrisisResources() {
    return [
      { name: 'خط المساعدة', phone: '988', description: 'متاح 24/7' },
      { name: 'الطوارئ', phone: '911', description: 'للحالات الطارئة' },
    ];
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

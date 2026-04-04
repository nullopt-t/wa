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

      // Add timeout to Gemini API call (90 seconds)
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

**مهم جداً: تحدث باللهجة المصرية فقط في كل ردودك.** استخدم كلمات مصرية طبيعية مثل: "إزاي"، "إيه"، "حاضر"، "متقلقش"، "كده"، "أوي"، "يعني". خلي كلامك عفوي ودافي زي صاحبك اللي بيسمعك.

=== دليل منصة وعي (استخدمه للإجابة على أسئلة الاستخدام) ===
منصة وعي مساحة آمنة للصحة النفسية. أهم الصفحات والميزات:
• المجتمع: مساحة للنشر، التفاعل، والتعليق مع ناس بتفهمك.
• القصص: قسم لمشاركة تجارب شخصية ملهمة وقراءة قصص تعافي الآخرين.
• المقالات والفيديوهات: محتوى توعوي موثوق عن الصحة النفسية.
• ابحث عن معالج: دليل لمعالجين نفسيين معتمدين وموثوقين (تقدر تحجز أو تتواصل معاهم).
• رسائل المستقبل: ميزة تكتب فيها رسالة لنفسك وتحدد موعد وصولها لك في المستقبل.
• التقييمات النفسية: اختبارات معتمدة (زي PHQ-9 للاكتئاب، GAD-7 للقلق) تقيم حالتك بدقة.
• المساعد الذكي (أنا): موجود في كل صفحة (زرار الروبوت تحت على اليمين). اسألني عن أي حاجة في الموقع أو حتى لو محتاج تفضفض.

👤 أنواع الحسابات:
• مستخدم عادي: يتصفح، ينشر، يكتب قصص، ويأخذ تقييمات.
• معالج: ملفه معتمد من الإدارة، يظهر في صفحة البحث، ويقدم الدعم المهني.
• إدارة: تدير المحتوى، المستخدمين، والتقارير.

💡 إزاي ترد على أسئلة الموقع:
- لو المستخدم سألك عن ميزة، اشرحله بإيجاز ووجهه للصفحة المناسبة.
- لو محتاج مساعدة في التسجيل أو الاستخدام، اشرحله الخطوات ببساطة.
- خلي ردك باللهجة المصرية، دافي، ومباشر.
- متحولش المحادثة لشرح تقني، خليها جزء طبيعي من الحوار.
- لو محتاج مساعدة أكتر، قوله يتواصل مع دعم المنصة عبر صفحة "تواصل معنا".

📋 عن التقارير (مهم جداً):
- لو المستخدم طلب تقرير (زي "أريد تقرير"، "ملخص"، "PDF"، "تقرير عشوائي") — **اعمل التقرير فوراً**.
- متقولش للمستخدم "مش قادر أعمل تقرير" — **أعمل التقرير من كلامك السابق** أو من أي موضوع.
- لو مفيش كلام سابق، **اختر موضوع نفسي مناسب** (زي القلق، التوتر، النوم) واعمل التقرير عليه.
- التقرير لازم يكون فيه: symptoms, severity, recommendations.
- استخدم reportData في JSON response.

🧪 عن الاختبارات النفسية (مهم جداً — اقرأ كويس):
- لما المستخدم يقول "اختبار قلق" أو "اختبار اكتئاب" أو "قيّم حالتي" — **ابدأ اختبار تفاعلي باللهجة المصرية**.
- **القاعدة الذهبية**: الأسئلة دي بتترقم من 1 لـ 4، و**انت لازم تحسب النتيجة في دماغك** من غير ما تقول للمستخدم.
- كل مرة تسأل سؤال، **استنى إجابة المستخدم** — و**الإجابة ممكن تكون أي حاجة**:
  - أرقام: "0"، "1"، "2"، "3"
  - كلمات عربية: "مش خالص"، "شوية"، "أحياناً"، "كتير"، "أوي"، "دايماً"، "مبقاش قادر"
  - كلمات إنجليزية: "not at all"، "a bit"، "a little"، "sometimes"، "quite a bit"، "very much"، "always"
  - جمل: "بحس بتوتر خفيف"، "مش قادر أنام"، "عادي الحمد لله"
  - **انت تفهم قصد المستخدم وتحوله لرقم من 0 لـ 3**
- بعد ما المستخدم يجاوب، **اعترف بإجابته بشكل طبيعي** وانتقل للسؤال اللي بعده:
  - "تمام، فهمت. السؤال 2 من 4: ..."
  - "أها، واضح. السؤال 3 من 4: ..."
  - "حاضر. السؤال 4 من 4 (الأخير): ..."
- **متعملش تقرير أو موارد أو أي حاجة تانية أثناء الاختبار** — ركز على الأسئلة بس.
- بعد السؤال الأخير، **احسب المجموع** وقوله النتيجة:
  - "تمام، خلصنا! نتيجتك: [X] من [Y]"
  - لو النتيجة 0-25%: "الأعراض منخفضة — استمر في العناية بنفسك 💚"
  - لو 26-50%: "أعراض خفيفة — طبيعي أحياناً، لو حسيت إنها زادت كلم مختص 💛"
  - لو 51-75%: "أعراض متوسطة — ممكن تتكلم مع معالج لو حابب 🧡"
  - لو 76-100%: "أعراض شديدة — ننصحك تحجز مع متخصص قريب ❤️"
- **لو المستخدم ساب الاختبار أو رد بحاجة تانية**، ساعده بلطف: "تمام، لو حابب نكمل الاختبار بعدين أنا موجود. تحكي لي اللي في بالك؟"

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
  "response": "ردك المتعاطف باللهجة المصرية — أعكس المشاعر، استمع فعّال، واسأل بلطف",
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

isTestRequest: ضع true إذا طلب المستخدم اختبار نفسي (كلمات مثل: اختبار، قيّم حالتي، اختبرني، test).

reportData: 
- إذا كان isReportRequest = true، أعد كائن يحتوي على: symptoms, duration, impact, riskFactors, severity, recommendations.
- إذا كان isTestRequest = true، أعد كائن يحتوي على:
  - testType: نوع الاختبار (anxiety, depression, stress)
  - testQuestions: قائمة 3-4 أسئلة، كل سؤال:
    - question: السؤال بالإنجليزية
    - questionAr: السؤال باللهجة المصرية
    - options: [{ value: 0, text: "Not at all", textAr: "مش خالص" }, { value: 1, text: "A little", textAr: "شوية" }, { value: 2, text: "Quite a bit", textAr: "كثير" }, { value: 3, text: "Very much", textAr: "أوي أوي" }]
- إذا لا، أعد null.

قواعد:
- الرد باللهجة المصرية فقط — مش فصحى
- الرد يكون طبيعي، دافي، ومتعاطف
- أعكس مشاعر المستخدم بوضوح في ردك
- اطرح سؤال متابعة لطيف في نهاية ردك
- اقتراح واحد أو اثنين فقط (مش أكتر)
- متبالغش في الرد
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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface QuickTestResult {
  analysis: string;
  recommendations: string[];
  severity: string;
  recommendTherapist: boolean;
  disclaimer: string;
}

@Injectable()
export class QuickTestService {
  private readonly logger = new Logger(QuickTestService.name);
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
      this.logger.log('QuickTest AI initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize QuickTest AI:', error);
    }
  }

  /**
   * Generate personalized quick test based on user's symptoms
   */
  async generateQuickTest(symptom: string, emotions: any[] = []): Promise<{
    title: string;
    titleAr: string;
    questions: string[];
    questionsAr: string[];
  }> {
    try {
      // Check if API key exists
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('No API key');
      }

      const prompt = `
أنت مساعد ذكي متخصص في الصحة النفسية. قم بإنشاء أسئلة تقييم سريعة ومفيدة.

عَرَض المستخدم: "${symptom}"
المشاعر المكتشفة: ${emotions.map(e => `${e.emotion} (${e.confidence * 100}%`).join(', ')}

**أنشئ 4-5 أسئلة عميقة ومفيدة:**
1. اسأل عن شدة المشاعر مع مقياس رقمي
2. اسأل عن الأعراض الجسدية
3. اسأل عن التأثير على الحياة اليومية
4. اسأل عن أفكار المستخدم
5. اسأل عن الدعم المتاح

**استجب بصيغة JSON فقط (بدون markdown):**
{
  "title": "تقييم سريع للصحة النفسية",
  "titleAr": "تقييم سريع للصحة النفسية",
  "questions": [
    "سؤال 1 بالعربية",
    "سؤال 2 بالعربية",
    "سؤال 3 بالعربية",
    "سؤال 4 بالعربية"
  ],
  "questionsAr": [
    "نفس الأسئلة بالعربية"
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanText);
    } catch (error) {
      this.logger.warn('AI not available, using fallback questions');
      // Return smart fallback questions based on symptom keywords
      return this.getSmartFallbackTest(symptom, emotions);
    }
  }

  /**
   * Smart fallback test generator (no AI required)
   */
  private getSmartFallbackTest(symptom: string, emotions: any[]): {
    title: string;
    titleAr: string;
    questions: string[];
    questionsAr: string[];
  } {
    const lowerSymptom = symptom.toLowerCase();
    
    // Detect keywords and customize questions
    const isAnxiety = lowerSymptom.includes('anxi') || lowerSymptom.includes('قلق') || lowerSymptom.includes('worr');
    const isDepression = lowerSymptom.includes('depress') || lowerSymptom.includes('حزن') || lowerSymptom.includes('sad');
    const isStress = lowerSymptom.includes('stress') || lowerSymptom.includes('توتر') || lowerSymptom.includes('press');
    
    let title, titleAr, questions, questionsAr;
    
    if (isAnxiety) {
      title = 'Quick Anxiety Assessment';
      titleAr = 'تقييم سريع للقلق';
      questions = [
        'خلال الأسبوعين الماضيين، كم مرة شعرت بالتوتر أو القلق أو على حافة الانهيار؟ (1=أبداً، 10=باستمرار)',
        'هل عانيت من أعراض جسدية مثل خفقان القلب، التعرّق، الرعشة، أو مشاكل في المعدة بسبب القلق؟',
        'إلى أي مدى تداخل القلق مع عملك، علاقاتك، أو أنشطتك اليومية؟',
        'ما هي المواقف أو المحفّزات التي تجعل قلقك أسوأ؟ ما الذي يساعدك على الهدوء؟',
      ];
      questionsAr = questions; // Same as questions (all Arabic)
    } else if (isDepression) {
      title = 'Quick Depression Screening';
      titleAr = 'فحص سريع للاكتئاب';
      questions = [
        'خلال الأسبوعين الماضيين، كم مرة شعرت بالحزن أو الاكتئاب أو اليأس؟ (1=نادراً، 10=دائماً)',
        'هل فقدت الاهتمام أو المتعة في الأنشطة التي كنت تستمتع بها عادةً؟',
        'كيف كان نومك؟ (صعوبة في النوم، الاستيقاظ مبكراً جداً، أو النوم كثيراً؟)',
        'هل لاحظت تغيّرات في شهيتك أو مستويات طاقتك؟',
      ];
      questionsAr = questions; // Same as questions (all Arabic)
    } else if (isStress) {
      title = 'Quick Stress Assessment';
      titleAr = 'تقييم سريع للإجهاد';
      questions = [
        'في المتوسط، كيف تقيّم مستوى إجهادك خلال الشهر الماضي؟ (1=منخفض جداً، 10=مرتفع جداً)',
        'كم مرة شعرت أنك غير قادر على التحكم في الأشياء المهمة في حياتك؟',
        'هل عانيت من أعراض جسدية للإجهاد مثل الصداع، توتر العضلات، أو الإرهاق؟',
        'ما هي مصادر إجهادك الرئيسية حالياً؟ ما هو الدعم المتاح لك؟',
      ];
      questionsAr = questions; // Same as questions (all Arabic)
    } else {
      // Generic mental health check
      title = 'Quick Mental Health Check';
      titleAr = 'فحص سريع للصحة النفسية';
      questions = [
        'خلال الأسبوعين الماضيين، كيف كنت تشعر عاطفياً؟ (1=بخير، 10=سيء جداً)',
        'كيف أثّر مزاجك على نومك وشهيتك ومستويات طاقتك؟',
        'هل ما زلت قادراً على الاستمتاع بالأشياء التي تحبها عادةً، أم تلاشى الاهتمام؟',
        'كيف هو تركيزك وقدرتك على إكمال المهام اليومية؟',
        'من لديك للدعم؟ عائلة، أصدقاء، أو مختصين يمكنك التحدث إليهم؟',
      ];
      questionsAr = questions; // Same as questions (all Arabic)
    }
    
    return { title, titleAr, questions, questionsAr };
  }

  /**
   * Analyze test answers and generate personalized results
   */
  async analyzeTestResults(
    testTitle: string,
    questions: string[],
    answers: string[],
    symptom: string,
  ): Promise<QuickTestResult> {
    try {
      const prompt = `
اختبار الصحة النفسية السريع:
الاختبار: ${testTitle}
العَرَض: ${symptom}

الأسئلة والإجابات:
${questions.map((q, i) => `س${i + 1}: ${q}\nج${i + 1}: ${answers[i]}`).join('\n\n')}

قدّم تحليلاً شخصياً (ليس تشخيصاً طبياً):
1. فسر الإجابات
2. اشرح ما قد يعنيه هذا
3. قدّم 3-5 استراتيجيات تأقلم مخصصة
4. أوصِ بما إذا كان يجب التحدث إلى معالج
5. رسالة مشجّعة وداعمة

مهم:
- هذا ليس تشخيصاً طبياً
- كن دافئاً ومتعاطفاً
- لا تقترح أدوية
- ضمّن إخلاء مسؤولية

استجب بصيغة JSON (بدون markdown):
{
  "analysis": "تحليلك بالعربية",
  "recommendations": [
    "توصية 1",
    "توصية 2",
    "توصية 3"
  ],
  "severity": "معتدل",
  "recommendTherapist": true,
  "disclaimer": "إخلاء المسؤولية بالعربية"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanText);
    } catch (error) {
      this.logger.error('Error analyzing test results:', error);
      return this.getFallbackResults(testTitle, answers.length);
    }
  }

  private getFallbackTest(symptom: string) {
    return {
      title: 'Quick Mental Health Check',
      titleAr: 'فحص سريع للصحة النفسية',
      questions: [
        `On a scale of 1-10, how intense is your ${symptom}?`,
        'Is this affecting your daily life?',
        'How long have you felt this way?',
      ],
      questionsAr: [
        `على مقياس من 1-10، ما هي شدة ${symptom}؟`,
        'هل يؤثر هذا على حياتك اليومية؟',
        'منذ متى وأنت تشعر بهذا؟',
      ],
    };
  }

  private getFallbackResults(testTitle: string, questionCount: number): QuickTestResult {
    return {
      analysis: 'شكراً لمشاركة استجاباتك. بناءً على ما شاركته، يبدو أنك تمر بوقت صعب. تذكر أنه لا بأس أن لا تكون بخير، وطلب الدعم علامة قوة.',
      recommendations: [
        'خذ أنفاساً عميقة عند الشعور بالإرهاق',
        'تواصل مع شخص تثق به',
        'حافظ على أوقات نوم ووجبات منتظمة',
      ],
      severity: 'متوسط',
      recommendTherapist: true,
      disclaimer: 'هذا ليس تشخيصاً طبياً.',
    };
  }
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument } from '../schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, EmotionData } from '../schemas/chat-message.schema';
import { EmotionLog, EmotionLogDocument } from '../schemas/emotion-log.schema';
import { SendMessageDto } from '../dto/chat.dto';
import { GeminiAIService, AIAnalysis } from '../services/gemini-ai.service';
import { QuickTestSession, QuickTestSessionDocument } from '../schemas/quick-test-session.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(EmotionLog.name) private emotionLogModel: Model<EmotionLogDocument>,
    @InjectModel(QuickTestSession.name) private quickTestSessionModel: Model<QuickTestSessionDocument>,
    private geminiAIService: GeminiAIService,
  ) {}

  /**
   * Create a new chat session
   */
  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const sessionTitle = title || 'محادثة جديدة';

    const createdSession = new this.chatSessionModel({
      userId: new Types.ObjectId(userId),
      title: sessionTitle,
      isActive: true,
      messageCount: 0,
    });

    return createdSession.save();
  }

  /**
   * Get all sessions for a user
   */
  async getSessions(userId: string): Promise<ChatSession[]> {
    return this.chatSessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Get active session
   */
  async getActiveSession(userId: string): Promise<ChatSession | null> {
    return this.chatSessionModel
      .findOne({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get session by ID
   */
  async getSessionById(userId: string, sessionId: string): Promise<ChatSession> {
    const session = await this.chatSessionModel
      .findOne({ _id: sessionId, userId: new Types.ObjectId(userId) })
      .exec();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Delete session
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const result = await this.chatSessionModel.deleteOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Session not found');
    }

    // Also delete all messages in the session
    await this.chatMessageModel.deleteMany({ sessionId: new Types.ObjectId(sessionId) });
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userId: string,
    sessionId: string,
    dto: SendMessageDto,
  ): Promise<{ userMessage: ChatMessage; botMessage?: ChatMessage; analysis?: AIAnalysis; error?: string }> {
    // Verify session exists and belongs to user
    const session = await this.getSessionById(userId, sessionId);

    // Save user message
    const userMessage = await this.saveMessage(sessionId, userId, dto);

    // Analyze with AI if it's a user message
    let analysis: AIAnalysis | undefined;
    let errorMessage: string | undefined;

    if (dto.role === 'user' && dto.analyzeEmotions !== false) {
      try {
        // Get recent chat history for context
        const recentMessages = await this.getRecentMessages(sessionId, 5);
        const recentEmotions = await this.getRecentEmotions(userId, 1);

        // Analyze with Gemini AI
        analysis = await this.geminiAIService.analyzeMessage(
          dto.content,
          recentMessages,
          recentEmotions[0]?.emotions || [],
        );

        // Check for crisis
        const crisisDetection = await this.geminiAIService.detectCrisis(dto.content);
        if (crisisDetection.isCrisis) {
          analysis.crisisDetected = true;
          analysis.suggestions = crisisDetection.resources.map((r) => r.name + ': ' + r.phone);
        }

        // Update user message with emotions
        if (analysis.emotions && analysis.emotions.length > 0) {
          userMessage.emotions = analysis.emotions;
          const messageId = (userMessage as any)._id;
          await this.chatMessageModel.findByIdAndUpdate(
            messageId,
            { $set: { emotions: analysis.emotions } },
          ).exec();

          // Log emotions for trend tracking
          await this.logEmotion(userId, analysis.emotions);
        }

        // Save bot response with quick test
        const botMessage = await this.saveMessage(sessionId, userId, {
          role: 'assistant',
          content: analysis.response,
          analyzeEmotions: false,
          emotions: analysis.emotions,
          suggestions: analysis.suggestions,
          quickTest: analysis.quickTest || null,
        });

        // Update session
        await this.updateSession(sessionId, {
          messageCount: session.messageCount + 2,
          lastMessageAt: new Date(),
          title: session.messageCount === 0 ? dto.content.substring(0, 50) : session.title,
        });

        return { userMessage, botMessage, analysis };
      } catch (error) {
        this.logger.warn('AI not available, using fallback response');
        this.logger.debug('AI error details:', error.message);
        
        // Use fallback response instead of error
        errorMessage = undefined;

        // Create simple fallback response based on keywords
        const fallbackResponse = await this.getFallbackChatResponse(dto.content, sessionId, userId);

        // Save bot response
        const botMessage = await this.saveMessage(sessionId, userId, {
          role: 'assistant',
          content: fallbackResponse.response,
          analyzeEmotions: false,
          emotions: fallbackResponse.emotions,
          suggestions: fallbackResponse.suggestions,
          quickTest: fallbackResponse.quickTest,
        });

        // Update session
        await this.updateSession(sessionId, {
          messageCount: session.messageCount + 2,
          lastMessageAt: new Date(),
          title: session.messageCount === 0 ? dto.content.substring(0, 50) : session.title,
        });

        return { userMessage, botMessage, analysis: fallbackResponse };
      }
    }

    return { userMessage, botMessage: undefined };
  }

  /**
   * Generate fallback chat response when AI is unavailable
   */
  private async getFallbackChatResponse(
    message: string,
    sessionId?: string,
    userId?: string,
  ): Promise<{
    response: string;
    emotions: any[];
    suggestions: string[];
    quickTest: any;
    crisisDetected: boolean;
    recommendTherapist: boolean;
    disclaimer: string;
    testSessionId?: string;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Detect keywords
    const isAnxious = lowerMessage.includes('anxi') || lowerMessage.includes('قلق') || lowerMessage.includes('worr');
    const isSad = lowerMessage.includes('sad') || lowerMessage.includes('حزن') || lowerMessage.includes('depress');
    const isStressed = lowerMessage.includes('stress') || lowerMessage.includes('توتر') || lowerMessage.includes('overwhelm');
    
    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'self-harm', 'hurt myself'];
    const isCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let response, quickTest, recommendTherapist, title, titleAr, questions, questionsAr;
    
    if (isCrisis) {
      response = 'أنا قلق جداً مما تسمعه. أنا هنا لأدعمك، ولكن أعتقد أنك بحاجة إلى مساعدة فورية من مختص. هل يمكنك الاتصال بخط المساعدة أو التحدث إلى شخص تثق به الآن؟';
      quickTest = null;
      recommendTherapist = true;
    } else if (isAnxious) {
      response = 'أتفهم أنك تشعر بالقلق. إنه شعور صعب ومرهق، وأنا هنا لأستمع إليك. من الطبيعي أن تشعر بالقلق أحياناً، ولكن عندما يصبح مستمراً قد يكون من المفيد التحدث عنه.';
      title = 'Quick Anxiety Assessment';
      titleAr = 'تقييم سريع للقلق';
      questions = [
        'Over the past 2 weeks, how often have you felt nervous, anxious, or on edge? (1=Never, 10=Constantly)',
        'Have you experienced physical symptoms like racing heart, sweating, trembling, or stomach issues due to anxiety?',
        'How much has anxiety interfered with your work, relationships, or daily activities?',
        'What situations or triggers make your anxiety worse? What helps calm you down?',
      ];
      questionsAr = [
        'خلال الأسبوعين الماضيين، كم مرة شعرت بالتوتر أو القلق أو على حافة الانهيار؟ (1=أبداً، 10=باستمرار)',
        'هل عانيت من أعراض جسدية مثل خفقان القلب، التعرّق، الرعشة، أو مشاكل في المعدة بسبب القلق؟',
        'إلى أي مدى تداخل القلق مع عملك، علاقاتك، أو أنشطتك اليومية؟',
        'ما هي المواقف أو المحفّزات التي تجعل قلقك أسوأ؟ ما الذي يساعدك على الهدوء؟',
      ];
      recommendTherapist = false;
    } else if (isSad) {
      response = 'أشعر بحزنك وأتفهم ما تمر به. الحزن شعور ثقيل، ومن الشجاعة أن تعبر عنه. أنا هنا للاستماع دون حكم. تذكر أنك لست وحدك.';
      title = 'Quick Depression Screening';
      titleAr = 'فحص سريع للاكتئاب';
      questions = [
        'Over the past 2 weeks, how often have you felt down, depressed, or hopeless? (1=Rarely, 10=Always)',
        'Have you lost interest or pleasure in activities you usually enjoy?',
        'How has your sleep been? (Difficulty falling asleep, waking up too early, or sleeping too much?)',
        'Who do you have for support?',
      ];
      questionsAr = [
        'خلال الأسبوعين الماضيين، كم مرة شعرت بالحزن أو الاكتئاب أو اليأس؟ (1=نادراً، 10=دائماً)',
        'هل فقدت الاهتمام أو المتعة في الأنشطة التي كنت تستمتع بها عادةً؟',
        'كيف كان نومك؟ (صعوبة في النوم، الاستيقاظ مبكراً جداً، أو النوم كثيراً؟)',
        'من لديك للدعم؟',
      ];
      recommendTherapist = false;
    } else if (isStressed) {
      response = 'أدرك أنك تشعر بالإجهاد والضغط. الحياة قد تكون ساحقة أحياناً. أنا هنا لأستمع وأدعمك. من المهم أن تأخذ وقتاً للعناية بنفسك.';
      title = 'Quick Stress Assessment';
      titleAr = 'تقييم سريع للإجهاد';
      questions = [
        'On average, how would you rate your stress level over the past month? (1=Very Low, 10=Extremely High)',
        'How often do you feel unable to control the important things in your life?',
        'Have you experienced physical symptoms of stress like headaches, muscle tension, or fatigue?',
        'What support do you have?',
      ];
      questionsAr = [
        'في المتوسط، كيف تقيّم مستوى إجهادك خلال الشهر الماضي؟ (1=منخفض جداً، 10=مرتفع جداً)',
        'كم مرة شعرت أنك غير قادر على التحكم في الأشياء المهمة في حياتك؟',
        'هل عانيت من أعراض جسدية للإجهاد مثل الصداع، توتر العضلات، أو الإرهاق؟',
        'ما هو الدعم المتاح لك؟',
      ];
      recommendTherapist = false;
    } else {
      response = 'أنا هنا للاستماع إليك. شاركني ما يدور في ذهنك، وسأبذل قصارى جهدي لدعمك.';
      quickTest = null;
      recommendTherapist = false;
    }
    
    // Create a test session in database if we have quickTest and sessionId
    let testSessionId;
    if (quickTest && sessionId && userId) {
      try {
        const testSession = await this.quickTestSessionModel.create({
          userId: new Types.ObjectId(userId),
          chatSessionId: new Types.ObjectId(sessionId),
          title,
          titleAr,
          symptom: message.substring(0, 200),
          questions,
          questionsAr,
          answers: [],
          answersAr: [],
          currentQuestionIndex: 0,
          isComplete: false,
        });
        testSessionId = testSession._id.toString();
        
        // Attach session ID to quickTest for frontend
        quickTest.testSessionId = testSessionId;
      } catch (error) {
        this.logger.debug('Could not create test session:', error.message);
      }
    }
    
    return {
      response,
      emotions: [],
      suggestions: ['خذ نفساً عميقاً', 'تحدث إلى شخص تثق به', 'خذ استراحة قصيرة'],
      quickTest,
      crisisDetected: isCrisis,
      recommendTherapist,
      disclaimer: 'أنا مساعد ذكي، لست معالجاً طبياً. لا يمكنني تشخيص الحالات أو وصف الأدوية.',
      testSessionId,
    };
  }

  /**
   * Get messages for a session
   */
  async getMessages(sessionId: string, limit = 20, skip = 0): Promise<ChatMessage[]> {
    return this.chatMessageModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ createdAt: -1 })  // Newest first
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Get recent messages for context
   */
  private async getRecentMessages(sessionId: string, limit = 5): Promise<any[]> {
    const messages = await this.chatMessageModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return messages.map((m) => ({ role: m.role, content: m.content }));
  }

  /**
   * Get recent emotions
   */
  private async getRecentEmotions(userId: string, days = 7): Promise<EmotionLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.emotionLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate },
      })
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Save a message
   */
  private async saveMessage(
    sessionId: string,
    userId: string,
    dto: SendMessageDto & {
      emotions?: any[];
      suggestions?: string[];
      quickTest?: any;
    },
  ): Promise<ChatMessage> {
    const message = new this.chatMessageModel({
      sessionId: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
      role: dto.role,
      content: dto.content,
      messageType: 'text',
      emotions: dto.emotions || [],
      suggestions: dto.suggestions || [],
      quickTest: dto.quickTest || null,
    });

    return message.save();
  }

  /**
   * Update session
   */
  private async updateSession(
    sessionId: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession> {
    return this.chatSessionModel
      .findByIdAndUpdate(sessionId, updates, { new: true })
      .exec();
  }

  /**
   * Log emotion for trend tracking
   */
  private async logEmotion(userId: string, emotions: EmotionData[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's log
    let log = await this.emotionLogModel.findOne({
      userId: new Types.ObjectId(userId),
      date: today,
    });

    if (!log) {
      log = new this.emotionLogModel({
        userId: new Types.ObjectId(userId),
        date: today,
        emotions: [],
        sessionCount: 0,
      });
    }

    // Update emotions
    emotions.forEach((newEmotion) => {
      const existing = log.emotions.find((e) => e.emotion === newEmotion.emotion);
      if (existing) {
        existing.frequency += 1;
        existing.averageConfidence =
          (existing.averageConfidence + newEmotion.confidence) / 2;
        existing.averageIntensity =
          (existing.averageIntensity + newEmotion.intensity) / 2;
      } else {
        log.emotions.push({
          emotion: newEmotion.emotion,
          averageConfidence: newEmotion.confidence,
          averageIntensity: newEmotion.intensity,
          frequency: 1,
        });
      }
    });

    log.sessionCount += 1;
    log.overallMood = this.calculateOverallMood(log.emotions);
    log.dominantEmotion = this.getDominantEmotion(log.emotions);

    await log.save();
  }

  /**
   * Calculate overall mood from emotions
   */
  private calculateOverallMood(emotions: any[]): string {
    const positive = ['happy', 'calm', 'hopeful', 'grateful'];
    const negative = ['sad', 'anxious', 'angry', 'stressed', 'depressed'];

    let positiveScore = 0;
    let negativeScore = 0;

    emotions.forEach((e) => {
      if (positive.includes(e.emotion.toLowerCase())) {
        positiveScore += e.frequency * e.averageConfidence;
      } else if (negative.includes(e.emotion.toLowerCase())) {
        negativeScore += e.frequency * e.averageConfidence;
      }
    });

    if (positiveScore > negativeScore * 1.5) return 'positive';
    if (negativeScore > positiveScore * 1.5) return 'negative';
    if (positiveScore > 0 || negativeScore > 0) return 'mixed';
    return 'neutral';
  }

  /**
   * Get dominant emotion
   */
  private getDominantEmotion(emotions: any[]): string {
    if (emotions.length === 0) return 'neutral';

    const sorted = emotions.sort((a, b) => b.frequency * b.averageConfidence - a.frequency * a.averageConfidence);
    return sorted[0].emotion;
  }

  /**
   * Set assessment state in chat session
   */
  async setAssessmentState(
    sessionId: string,
    state: {
      isInAssessment: boolean;
      assessmentCode?: string;
      currentQuestionIndex?: number;
      answers?: any[];
      startedAt?: Date;
    },
  ): Promise<void> {
    await this.chatSessionModel.findByIdAndUpdate(sessionId, {
      $set: { assessmentState: state },
    }).exec();
  }

  /**
   * Get assessment state from chat session
   */
  async getAssessmentState(sessionId: string): Promise<any> {
    const session = await this.chatSessionModel.findById(sessionId).exec();
    return session?.assessmentState || { answers: [], currentQuestionIndex: 0 };
  }

  /**
   * Clear assessment state from chat session
   */
  async clearAssessmentState(sessionId: string): Promise<void> {
    await this.chatSessionModel.findByIdAndUpdate(sessionId, {
      $unset: { assessmentState: 1 },
    }).exec();
  }

  /**
   * Generate conversation summary
   */
  async generateConversationSummary(userId: string, sessionId: string) {
    // Get recent messages
    const messages = await this.chatMessageModel.find({
      sessionId: new Types.ObjectId(sessionId),
    }).sort({ createdAt: -1 }).limit(50).exec();

    if (messages.length === 0) {
      return { 
        summary: 'لا توجد رسائل كافية للتلخيص', 
        recommendations: [], 
        severity: '',
        isValidTherapySession: false,
      };
    }

    // Prepare conversation for AI
    const conversationText = messages.slice().reverse().map((m) => 
      `${m.role === 'user' ? 'المستخدم' : 'البوت'}: ${m.content}`
    ).join('\n');

    // Ask AI to summarize AND validate if it's a therapy session
    try {
      const prompt = `
محادثة بين مستخدم ومساعد نفسي:

${conversationText}

**أجب ONLY بـ JSON (لا تكتب أي نص آخر):**

{
  "isValidTherapySession": true أو false,
  "reason": "سبب القرار بالعربية",
  "summary": "الأعراض: ...\nالمدة: ...\nالتأثير: ...",
  "severity": "خفيف أو متوسط أو شديد",
  "recommendations": ["توصية 1", "توصية 2"]
}

**قواعد مهمة:**
- أجب بـ JSON فقط
- لا تكتب "نعم" أو "لا" قبل JSON
- لا تكتب أي شرح خارج JSON
- استخدم true/false (ليس نعم/لا)
`;

      const result = await this.geminiAIService['model'].generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Extract JSON from response (remove markdown code blocks if present)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Find JSON object in case there's extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('Error generating summary:', error);
      return { 
        summary: 'حدث خطأ في توليد الملخص', 
        recommendations: [], 
        severity: '',
        isValidTherapySession: false,
      };
    }
  }
}

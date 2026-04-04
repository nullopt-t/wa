import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument } from '../schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, EmotionData } from '../schemas/chat-message.schema';
import { EmotionLog, EmotionLogDocument } from '../schemas/emotion-log.schema';
import { SendMessageDto } from '../dto/chat.dto';
import { GeminiAIService, AIAnalysis } from '../services/gemini-ai.service';
import { Article } from '../../article/schemas/article.schema';
import { Video } from '../../video/schemas/video.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(EmotionLog.name) private emotionLogModel: Model<EmotionLogDocument>,
    @InjectModel(Article.name) private articleModel: Model<any>,
    @InjectModel(Video.name) private videoModel: Model<any>,
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

        // Find related resources from AI keywords
        let relatedResources: any[] = [];
        if (analysis.resourceKeywords?.length > 0) {
          relatedResources = await this.findRelatedResources(analysis.resourceKeywords);
        }

        // Check if this is a report request
        const isReportRequest = analysis.isReportRequest || false;
        const reportData = analysis.reportData || null;

        // Save bot response with quick test
        const botMessage = await this.saveMessage(sessionId, userId, {
          role: 'assistant',
          content: analysis.response,
          analyzeEmotions: false,
          emotions: analysis.emotions,
          suggestions: analysis.suggestions,
          relatedResources,
          reportData: isReportRequest ? reportData : null,
          messageType: isReportRequest ? 'clinical-report' : 'text',
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
    _sessionId?: string,
    _userId?: string,
  ): Promise<{
    response: string;
    emotions: any[];
    suggestions: string[];
    crisisDetected: boolean;
    recommendTherapist: boolean;
    disclaimer: string;
  }> {
    const lowerMessage = message.toLowerCase();
    const isAnxious = lowerMessage.includes('anxi') || lowerMessage.includes('قلق') || lowerMessage.includes('worr');
    const isSad = lowerMessage.includes('sad') || lowerMessage.includes('حزن') || lowerMessage.includes('depress');
    const isStressed = lowerMessage.includes('stress') || lowerMessage.includes('توتر') || lowerMessage.includes('overwhelm');

    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'self-harm', 'hurt myself'];
    const isCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));

    let response: string;
    let recommendTherapist: boolean;

    if (isCrisis) {
      response = 'أنا قلق جداً مما تسمعه. أنا هنا لأدعمك، ولكن أعتقد أنك بحاجة إلى مساعدة فورية من مختص. هل يمكنك الاتصال بخط المساعدة أو التحدث إلى شخص تثق به الآن؟';
      recommendTherapist = true;
    } else if (isAnxious) {
      response = 'أتفهم أنك تشعر بالقلق. إنه شعور صعب ومرهق، وأنا هنا لأستمع إليك.';
      recommendTherapist = false;
    } else if (isSad) {
      response = 'أشعر بحزنك وأتفهم ما تمر به. الحزن شعور ثقيل، وأنا هنا للاستماع دون حكم.';
      recommendTherapist = false;
    } else if (isStressed) {
      response = 'أدرك أنك تشعر بالإجهاد والضغط. أنا هنا لأستمع وأدعمك.';
      recommendTherapist = false;
    } else {
      response = 'أنا هنا للاستماع إليك. شاركني ما يدور في ذهنك، وسأبذل قصارى جهدي لدعمك.';
      recommendTherapist = false;
    }

    return {
      response,
      emotions: [],
      suggestions: ['خذ نفساً عميقاً', 'تحدث إلى شخص تثق به', 'خذ استراحة قصيرة'],
      crisisDetected: isCrisis,
      recommendTherapist,
      disclaimer: 'أنا مساعد ذكي، لست معالجاً طبياً. لا يمكنني تشخيص الحالات أو وصف الأدوية.',
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
      relatedResources?: any[];
      reportData?: any;
      messageType?: string;
    },
  ): Promise<ChatMessage> {
    const message = new this.chatMessageModel({
      sessionId: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
      role: dto.role,
      content: dto.content,
      messageType: dto.messageType || 'text',
      emotions: dto.emotions || [],
      suggestions: dto.suggestions || [],
      relatedResources: dto.relatedResources || [],
      reportData: dto.reportData || null,
    });

    return message.save();
  }

  /**
   * Find related articles and videos for given keywords using full-text search
   */
  private async findRelatedResources(keywords: string[]): Promise<any[]> {
    const resources: any[] = [];
    const seen = new Set<string>();

    // Search articles using $text index with each keyword
    for (const keyword of keywords.slice(0, 3)) {
      const articles = await this.articleModel
        .find({
          status: 'published',
          $text: { $search: keyword },
        }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(2)
        .lean();

      for (const article of articles) {
        if (!seen.has(article._id.toString())) {
          seen.add(article._id.toString());
          resources.push({
            _id: article._id.toString(),
            type: 'article',
            title: article.title,
            excerpt: article.excerpt?.substring(0, 120) || '',
            url: `/articles/${article._id}`,
          });
        }
      }

      // Search videos using $text index
      const videos = await this.videoModel
        .find({
          isActive: true,
          $text: { $search: keyword },
        }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(1)
        .lean();

      for (const video of videos) {
        if (!seen.has(video._id.toString())) {
          seen.add(video._id.toString());
          resources.push({
            _id: video._id.toString(),
            type: 'video',
            title: video.title,
            excerpt: video.description?.substring(0, 120) || '',
            url: '/videos',
          });
        }
      }
    }

    return resources.slice(0, 3);
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

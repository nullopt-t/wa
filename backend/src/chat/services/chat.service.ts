import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument } from '../schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, EmotionData } from '../schemas/chat-message.schema';
import { EmotionLog, EmotionLogDocument } from '../schemas/emotion-log.schema';
import { SendMessageDto } from '../dto/chat.dto';
import { GeminiAIService, AIAnalysis } from '../services/gemini-ai.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(EmotionLog.name) private emotionLogModel: Model<EmotionLogDocument>,
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

        // Save bot response
        const botMessage = await this.saveMessage(sessionId, userId, {
          role: 'assistant',
          content: analysis.response,
          analyzeEmotions: false,
        });

        // Update session
        await this.updateSession(sessionId, {
          messageCount: session.messageCount + 2,
          lastMessageAt: new Date(),
          title: session.messageCount === 0 ? dto.content.substring(0, 50) : session.title,
        });

        return { userMessage, botMessage, analysis };
      } catch (error) {
        this.logger.error('Error in AI analysis:', error);
        
        // Set user-friendly error message
        errorMessage = 'عذراً، هناك مشكلة تقنية في المساعد الذكي حالياً. نحن نعمل على حلها. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني إذا استمرت المشكلة.';
        
        this.logger.warn('Returning error instead of fallback response');

        return { userMessage, botMessage: undefined, error: errorMessage };
      }
    }

    return { userMessage, botMessage: undefined };
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
    dto: SendMessageDto,
  ): Promise<ChatMessage> {
    const message = new this.chatMessageModel({
      sessionId: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
      role: dto.role,
      content: dto.content,
      messageType: 'text',
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
}

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from '../schemas/assessment.schema';
import { AssessmentQuestion, AssessmentQuestionDocument } from '../schemas/assessment-question.schema';
import { AssessmentResult, AssessmentResultDocument } from '../schemas/assessment-result.schema';
import { ChatService } from '../../chat/services/chat.service';
import { GeminiAIService, AIAnalysis } from '../../chat/services/gemini-ai.service';

export interface AssessmentInterpretation {
  interpretation: string;
  interpretationAr: string;
  recommendations: string[];
  recommendationsAr: string[];
  recommendTherapist: boolean;
  disclaimer: string;
  disclaimerAr: string;
}

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectModel('Assessment') private assessmentModel: Model<AssessmentDocument>,
    @InjectModel('AssessmentQuestion') private questionModel: Model<AssessmentQuestionDocument>,
    @InjectModel('AssessmentResult') private resultModel: Model<AssessmentResultDocument>,
    private chatService: ChatService,
    private geminiAIService: GeminiAIService,
  ) {}

  /**
   * Get all active assessments
   */
  async getAllAssessments(): Promise<Assessment[]> {
    return this.assessmentModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  /**
   * Get assessment by code
   */
  async getAssessmentByCode(code: string): Promise<AssessmentDocument> {
    const assessment = await this.assessmentModel.findOne({ code }).lean(false).exec();
    if (!assessment) {
      throw new NotFoundException(`Assessment ${code} not found`);
    }
    return assessment;
  }

  /**
   * Get questions for an assessment
   */
  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestionDocument[]> {
    return this.questionModel
      .find({ assessment: new Types.ObjectId(assessmentId) })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Start an assessment - returns first question
   */
  async startAssessment(userId: string, assessmentCode: string, sessionId?: string): Promise<{
    assessment: AssessmentDocument;
    question: AssessmentQuestionDocument;
    totalQuestions: number;
  }> {
    const assessment = await this.getAssessmentByCode(assessmentCode);
    const questions = await this.getAssessmentQuestions(assessment._id.toString());

    if (questions.length === 0) {
      throw new BadRequestException('No questions found for this assessment');
    }

    // If sessionId provided, update chat session state
    if (sessionId) {
      await this.chatService.setAssessmentState(sessionId, {
        isInAssessment: true,
        assessmentCode,
        currentQuestionIndex: 0,
        answers: [],
        startedAt: new Date(),
      });
    }

    return {
      assessment,
      question: questions[0],
      totalQuestions: questions.length,
    };
  }

  /**
   * Submit an answer and get next question or results
   */
  async submitAnswer(
    userId: string,
    assessmentCode: string,
    questionId: string,
    selectedValue: number,
    sessionId?: string,
  ): Promise<{
    nextQuestion?: AssessmentQuestion;
    currentQuestionIndex?: number;
    totalQuestions?: number;
    isComplete?: boolean;
    result?: AssessmentResult;
  }> {
    const assessment = await this.getAssessmentByCode(assessmentCode);
    const questions = await this.getAssessmentQuestions(assessment._id.toString());
    const currentQuestion = questions.find(q => q._id.toString() === questionId);

    if (!currentQuestion) {
      throw new NotFoundException('Question not found');
    }

    // Get or create assessment state from chat session
    let assessmentState: any = { answers: [], currentQuestionIndex: 0 };
    if (sessionId) {
      assessmentState = await this.chatService.getAssessmentState(sessionId);
    }

    // Find the selected option text
    const selectedOption = currentQuestion.options.find(opt => opt.value === selectedValue);
    if (!selectedOption) {
      throw new BadRequestException('Invalid option value');
    }

    // Add answer to state
    assessmentState.answers.push({
      questionId: currentQuestion._id,
      questionOrder: currentQuestion.order,
      selectedValue,
      selectedText: selectedOption.text,
      selectedTextAr: selectedOption.textAr,
    });

    const currentIndex = assessmentState.currentQuestionIndex || 0;
    const nextIndex = currentIndex + 1;

    // Check if there are more questions
    if (nextIndex < questions.length) {
      // Update state
      assessmentState.currentQuestionIndex = nextIndex;
      if (sessionId) {
        await this.chatService.setAssessmentState(sessionId, assessmentState);
      }

      return {
        nextQuestion: questions[nextIndex],
        currentQuestionIndex: nextIndex,
        totalQuestions: questions.length,
        isComplete: false,
      };
    }

    // Assessment complete - calculate results
    const result = await this.completeAssessment(
      userId,
      assessment,
      assessmentState.answers,
      sessionId,
    );

    // Clear assessment state
    if (sessionId) {
      await this.chatService.clearAssessmentState(sessionId);
    }

    return {
      isComplete: true,
      result,
    };
  }

  /**
   * Complete assessment and generate results with AI interpretation
   */
  private async completeAssessment(
    userId: string,
    assessment: AssessmentDocument,
    answers: Array<{
      questionId: Types.ObjectId;
      questionOrder: number;
      selectedValue: number;
      selectedText: string;
      selectedTextAr: string;
    }>,
    sessionId?: string,
  ): Promise<AssessmentResultDocument> {
    // Calculate total score
    const totalScore = answers.reduce((sum, answer) => sum + answer.selectedValue, 0);
    const maxScore = assessment.maxScore;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Determine severity level
    const severityLevel = assessment.severityLevels.find(
      level => totalScore >= level.minScore && totalScore <= level.maxScore,
    );

    if (!severityLevel) {
      throw new BadRequestException('Could not determine severity level');
    }

    // Generate AI interpretation
    const aiInterpretation = await this.generateAIInterpretation(
      assessment.code,
      assessment.name,
      totalScore,
      maxScore,
      severityLevel.severity,
      answers,
    );

    // Create result document
    const result = new this.resultModel({
      userId: new Types.ObjectId(userId),
      assessment: assessment._id,
      answers,
      totalScore,
      maxScore,
      percentage,
      severity: severityLevel.severity,
      severityAr: severityLevel.severityAr,
      severityLevel: severityLevel.severity.toLowerCase(),
      aiInterpretation,
      sessionId: sessionId ? new Types.ObjectId(sessionId) : undefined,
      isFromChat: !!sessionId,
    });

    await result.save();

    // Increment assessment times taken
    await this.assessmentModel.findByIdAndUpdate(assessment._id, {
      $inc: { timesTaken: 1 },
    });

    this.logger.log(`Assessment ${assessment.code} completed by user ${userId} with score ${totalScore}/${maxScore}`);

    return result;
  }

  /**
   * Generate AI interpretation of results
   */
  private async generateAIInterpretation(
    assessmentCode: string,
    assessmentName: string,
    totalScore: number,
    maxScore: number,
    severity: string,
    answers: any[],
  ): Promise<any> {
    try {
      const interpretation = await this.geminiAIService.interpretAssessmentResults(
        assessmentCode,
        assessmentName,
        totalScore,
        maxScore,
        severity,
        answers.map(a => ({ question: a.questionOrder, answer: a.selectedValue })),
      );

      return {
        interpretation: interpretation.interpretation || '',
        interpretationAr: interpretation.interpretationAr || interpretation.interpretation || '',
        recommendations: interpretation.recommendations || interpretation.suggestions || [],
        recommendationsAr: interpretation.recommendationsAr || interpretation.recommendations || [],
        recommendTherapist: interpretation.recommendTherapist || false,
        disclaimer: interpretation.disclaimer || 'This is not a medical diagnosis.',
        disclaimerAr: interpretation.disclaimerAr || 'هذا ليس تشخيصاً طبياً.',
      };
    } catch (error) {
      this.logger.error('Error generating AI interpretation:', error);
      
      // Fallback interpretation
      return this.getFallbackInterpretation(assessmentCode, assessmentName, totalScore, maxScore, severity);
    }
  }

  /**
   * Fallback interpretation if AI fails
   */
  private getFallbackInterpretation(
    assessmentCode: string,
    assessmentName: string,
    totalScore: number,
    maxScore: number,
    severity: string,
  ): any {
    const percentage = Math.round((totalScore / maxScore) * 100);
    return {
      interpretation: `Your score of ${totalScore}/${maxScore} (${percentage}%) indicates ${severity.toLowerCase()} symptoms.`,
      interpretationAr: `نتيجتك ${totalScore} من ${maxScore} (${percentage}%) تشير إلى أعراض ${severity}.`,
      recommendations: [
        'Consider speaking with a mental health professional',
        'Practice self-care activities',
        'Maintain a healthy sleep schedule',
      ],
      recommendationsAr: [
        'فكر في التحدث إلى أخصائي صحة نفسية',
        'مارس أنشطة العناية بالنفس',
        'حافظ على جدول نوم صحي',
      ],
      recommendTherapist: severity.toLowerCase() === 'severe' || severity.toLowerCase() === 'moderate',
      disclaimer: 'This is not a medical diagnosis. Please consult a healthcare professional.',
      disclaimerAr: 'هذا ليس تشخيصاً طبياً. يرجى استشارة أخصائي رعاية صحية.',
    };
  }

  /**
   * Get user's assessment history
   */
  async getUserAssessmentHistory(
    userId: string,
    assessmentCode?: string,
    limit = 10,
  ): Promise<any[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    
    if (assessmentCode) {
      const assessment = await this.getAssessmentByCode(assessmentCode);
      query.assessment = assessment._id;
    }

    const results = await this.resultModel
      .find(query)
      .populate('assessment')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return results;
  }

  /**
   * Get specific assessment result
   */
  async getAssessmentResult(userId: string, resultId: string): Promise<any> {
    const result = await this.resultModel
      .findOne({
        _id: resultId,
        userId: new Types.ObjectId(userId),
      })
      .populate('assessment')
      .lean()
      .exec();

    if (!result) {
      throw new NotFoundException('Assessment result not found');
    }

    return result;
  }

  /**
   * Get assessment statistics for user
   */
  async getUserAssessmentStats(userId: string): Promise<{
    totalAssessments: number;
    byCategory: Record<string, number>;
    recentTrends: any[];
  }> {
    const results = await this.resultModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('assessment')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    const byCategory: Record<string, number> = {};
    const trends: any[] = [];

    results.forEach((result: any) => {
      const assessment = result.assessment;
      const category = assessment.category;
      byCategory[category] = (byCategory[category] || 0) + 1;

      trends.push({
        date: result.createdAt,
        assessmentCode: assessment.code,
        score: result.totalScore,
        maxScore: result.maxScore,
        severity: result.severity,
        percentage: result.percentage,
      });
    });

    return {
      totalAssessments: results.length,
      byCategory,
      recentTrends: trends,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { SendMessageDto, CreateChatSessionDto } from '../dto/chat.dto';
import { QuickTestService } from '../services/quick-test.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuickTestSession, QuickTestSessionDocument } from '../schemas/quick-test-session.schema';
import { PDFGeneratorService } from '../../modules/pdf/pdf-generator.service';
import { Response } from 'express';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  
  constructor(
    private readonly chatService: ChatService,
    private readonly quickTestService: QuickTestService,
    private readonly pdfGeneratorService: PDFGeneratorService,
    @InjectModel(QuickTestSession.name) private quickTestModel: Model<QuickTestSessionDocument>,
  ) {}

  /**
   * Create a new chat session
   */
  @Post('sessions')
  async createSession(
    @Request() req,
    @Body() dto: CreateChatSessionDto,
  ) {
    const userId = req.user.userId;
    return this.chatService.createSession(userId, dto.title);
  }

  /**
   * Get all user's chat sessions
   */
  @Get('sessions')
  async getSessions(@Request() req) {
    const userId = req.user.userId;
    return this.chatService.getSessions(userId);
  }

  /**
   * Get active chat session
   */
  @Get('sessions/active')
  async getActiveSession(@Request() req) {
    const userId = req.user.userId;
    const session = await this.chatService.getActiveSession(userId);
    return session || null;
  }

  /**
   * Get specific session
   */
  @Get('sessions/:id')
  async getSession(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.chatService.getSessionById(userId, id);
  }

  /**
   * Delete session
   */
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.chatService.deleteSession(userId, id);
  }

  /**
   * Send message to chat
   */
  @Post('sessions/:id/messages')
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    const userId = req.user.userId;
    const result = await this.chatService.sendMessage(userId, id, dto);

    // Return both messages and analysis, or error
    return {
      userMessage: result.userMessage,
      botMessage: result.botMessage || null,
      analysis: result.analysis ? {
        emotions: result.analysis.emotions,
        crisisDetected: result.analysis.crisisDetected,
        suggestions: result.analysis.suggestions,
        quickTest: result.analysis.quickTest || null,
        recommendTherapist: result.analysis.recommendTherapist,
        disclaimer: result.analysis.disclaimer,
      } : null,
      error: result.error || null,
    };
  }

  /**
   * Get messages for a session
   */
  @Get('sessions/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit: number = 20,
    @Query('skip') skip: number = 0,
  ) {
    const userId = req.user.userId;
    // Verify session belongs to user
    await this.chatService.getSessionById(userId, id);
    return this.chatService.getMessages(id, limit, skip);
  }

  /**
   * Get emotion history
   */
  @Get('emotions/history')
  async getEmotionHistory(
    @Request() req,
    @Query('days') days: number = 7,
  ) {
    const userId = req.user.userId;
    return this.chatService['getRecentEmotions'](userId, days);
  }

  /**
   * Start a quick test
   */
  @Post('quick-test/start')
  async startQuickTest(
    @Request() req,
    @Body() body: { symptom: string; emotions?: any[]; sessionId: string },
  ) {
    const userId = req.user.userId;
    
    // Generate personalized questions
    const test = await this.quickTestService.generateQuickTest(body.symptom, body.emotions);
    
    // Create test session
    const testSession = await this.quickTestModel.create({
      userId: new Types.ObjectId(userId),
      chatSessionId: new Types.ObjectId(body.sessionId),
      title: test.title,
      titleAr: test.titleAr,
      symptom: body.symptom,
      questions: test.questions,
      questionsAr: test.questionsAr,
      answers: [],
      answersAr: [],
      currentQuestionIndex: 0,
      isComplete: false,
    });
    
    return {
      testSessionId: testSession._id,
      title: test.titleAr,
      currentQuestion: test.questionsAr[0],
      currentQuestionIndex: 0,
      totalQuestions: test.questionsAr.length,
    };
  }

  /**
   * Submit quick test answer
   */
  @Post('quick-test/:id/answer')
  async submitQuickTestAnswer(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { answer: string },
  ) {
    const userId = req.user.userId;
    
    const testSession = await this.quickTestModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    
    if (!testSession) {
      return { error: 'Test session not found' };
    }
    
    if (testSession.isComplete) {
      return { error: 'Test already complete' };
    }
    
    // Save answer
    testSession.answers.push(body.answer);
    testSession.currentQuestionIndex += 1;
    
    // Check if more questions
    if (testSession.currentQuestionIndex >= testSession.questionsAr.length) {
      // Test complete - analyze results
      const result = await this.quickTestService.analyzeTestResults(
        testSession.title,
        testSession.questionsAr,
        testSession.answers,
        testSession.symptom,
      );

      testSession.result = result;
      testSession.isComplete = true;
      testSession.completedAt = new Date();
      await testSession.save();

      return {
        isComplete: true,
        result: {
          title: testSession.titleAr,
          analysis: result.analysis,
          recommendations: result.recommendations,
          severity: result.severity,
          recommendTherapist: result.recommendTherapist,
          disclaimer: result.disclaimer,
        },
      };
    } else {
      // More questions
      await testSession.save();

      return {
        isComplete: false,
        currentQuestion: testSession.questionsAr[testSession.currentQuestionIndex],
        currentQuestionIndex: testSession.currentQuestionIndex,
        totalQuestions: testSession.questionsAr.length,
      };
    }
  }

  /**
   * Get quick test result for PDF export
   */
  @Get('quick-test/:id/result')
  async getQuickTestResult(
    @Request() req,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    
    const testSession = await this.quickTestModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      isComplete: true,
    }).lean();
    
    if (!testSession) {
      return { error: 'Test result not found' };
    }
    
    return {
      title: testSession.titleAr,
      symptom: testSession.symptom,
      completedAt: testSession.completedAt,
      questions: testSession.questionsAr,
      answers: testSession.answers,
      result: testSession.result,
    };
  }

  /**
   * Export quick test result as PDF
   */
  @Get('quick-test/:id/pdf')
  async exportQuickTestPDF(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    
    const testSession = await this.quickTestModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      isComplete: true,
    });
    
    if (!testSession) {
      return res.status(404).json({ error: 'Test result not found' });
    }
    
    try {
      const pdfBuffer = await this.pdfGeneratorService.generateClinicalReportPDF({
        title: testSession.titleAr,
        symptom: testSession.symptom,
        completedAt: testSession.completedAt,
        questions: testSession.questionsAr,
        answers: testSession.answers,
        result: testSession.result,
      }, {
        chiefComplaint: testSession.symptom,
        symptoms: testSession.questionsAr,
        duration: '',
        functionalImpact: {},
        riskFactors: { severity: testSession.result?.severity || '' },
        preliminaryDiagnosis: '',
        clinicalRecommendations: testSession.result?.recommendations || [],
      });

      // Encode filename properly for Arabic support
      const filename = `تقرير-الصحة-النفسية-${Date.now()}.pdf`;
      const encodedFilename = encodeURIComponent(filename);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': pdfBuffer.length,
      });

      return res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      return res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  /**
   * Generate conversation summary
   */
  @Post('sessions/:id/summary')
  async generateSummary(
    @Request() req,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    const summary = await this.chatService.generateConversationSummary(userId, id);
    return summary;
  }
}

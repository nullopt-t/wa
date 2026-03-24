import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssessmentService } from '../services/assessment.service';
import { StartAssessmentDto } from '../dto/start-assessment.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';

@Controller('assessments')
@UseGuards(AuthGuard('jwt'))
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  /**
   * Get all available assessments
   */
  @Get()
  async getAllAssessments() {
    return this.assessmentService.getAllAssessments();
  }

  /**
   * Get assessment by code with questions
   */
  @Get(':code')
  async getAssessment(@Param('code') code: string) {
    const assessment = await this.assessmentService.getAssessmentByCode(code);
    const questions = await this.assessmentService.getAssessmentQuestions(assessment._id.toString());
    return {
      ...assessment.toObject(),
      questions,
    };
  }

  /**
   * Start an assessment
   */
  @Post('start')
  async startAssessment(
    @Request() req,
    @Body() dto: StartAssessmentDto,
  ) {
    const userId = req.user.userId;
    const result = await this.assessmentService.startAssessment(
      userId,
      dto.assessmentCode,
      dto.sessionId,
    );

    return {
      assessment: {
        code: result.assessment.code,
        name: result.assessment.name,
        nameAr: result.assessment.nameAr,
        description: result.assessment.description,
        descriptionAr: result.assessment.descriptionAr,
        totalQuestions: result.totalQuestions,
      },
      question: {
        id: result.question._id.toString(),
        order: result.question.order,
        text: result.question.text,
        textAr: result.question.textAr,
        options: result.question.options,
      },
      currentQuestionIndex: 0,
      totalQuestions: result.totalQuestions,
    };
  }

  /**
   * Submit an answer
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitAnswer(
    @Request() req,
    @Body() dto: SubmitAnswerDto,
  ) {
    const userId = req.user.userId;
    const result = await this.assessmentService.submitAnswer(
      userId,
      dto.assessmentCode,
      dto.questionId,
      dto.selectedValue,
      dto.sessionId,
    );

    if (result.isComplete) {
      // Assessment complete - return results
      const assessmentDoc = result.result.assessment as any;
      const resultJson = JSON.parse(JSON.stringify(result.result));
      return {
        isComplete: true,
        result: {
          id: resultJson._id,
          assessmentCode: assessmentDoc.code,
          assessmentName: assessmentDoc.name,
          assessmentNameAr: assessmentDoc.nameAr,
          totalScore: resultJson.totalScore,
          maxScore: resultJson.maxScore,
          percentage: resultJson.percentage,
          severity: resultJson.severity,
          severityAr: resultJson.severityAr,
          severityLevel: resultJson.severityLevel,
          aiInterpretation: resultJson.aiInterpretation,
          createdAt: resultJson.createdAt,
        },
      };
    }

    // More questions - return next question
    const questionJson = JSON.parse(JSON.stringify(result.nextQuestion));
    return {
      isComplete: false,
      question: {
        id: questionJson._id,
        order: questionJson.order,
        text: questionJson.text,
        textAr: questionJson.textAr,
        options: questionJson.options,
      },
      currentQuestionIndex: result.currentQuestionIndex,
      totalQuestions: result.totalQuestions,
    };
  }

  /**
   * Get user's assessment history
   */
  @Get('history/all')
  async getHistory(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req.user.userId;
    return this.assessmentService.getUserAssessmentHistory(userId, undefined, limit);
  }

  /**
   * Get assessment history by type
   */
  @Get('history/:code')
  async getHistoryByType(
    @Request() req,
    @Param('code') code: string,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req.user.userId;
    return this.assessmentService.getUserAssessmentHistory(userId, code, limit);
  }

  /**
   * Get specific assessment result
   */
  @Get('result/:id')
  async getResult(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.assessmentService.getAssessmentResult(userId, id);
  }

  /**
   * Get assessment statistics
   */
  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.userId;
    return this.assessmentService.getUserAssessmentStats(userId);
  }
}

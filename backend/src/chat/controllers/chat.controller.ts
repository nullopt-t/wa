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
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { SendMessageDto, CreateChatSessionDto } from '../dto/chat.dto';

@ApiTags('المحادثة')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
  ) {}

  /**
   * Create a new chat session
   */
  @ApiOperation({ summary: 'إنشاء جلسة محادثة' })
  @ApiOkResponse({ description: 'تم إنشاء الجلسة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post('sessions')
  async createSession(@Request() req, @Body() dto: CreateChatSessionDto) {
    return this.chatService.createSession(req.user.userId, dto.title);
  }

  /**
   * Get all user's chat sessions
   */
  @ApiOperation({ summary: 'عرض جلسات المحادثة' })
  @ApiOkResponse({ description: 'قائمة الجلسات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('sessions')
  async getSessions(@Request() req) {
    return this.chatService.getSessions(req.user.userId);
  }

  /**
   * Get active chat session
   */
  @ApiOperation({ summary: 'عرض الجلسة النشطة' })
  @ApiOkResponse({ description: 'النشط' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('sessions/active')
  async getActiveSession(@Request() req) {
    const session = await this.chatService.getActiveSession(req.user.userId);
    return session || null;
  }

  /**
   * Get specific session
   */
  @ApiOperation({ summary: 'عرض جلسة محادثة محددة' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الجلسة غير موجودة' })
  @Get('sessions/:id')
  async getSession(@Request() req, @Param('id') id: string) {
    return this.chatService.getSessionById(req.user.userId, id);
  }

  /**
   * Delete session
   */
  @ApiOperation({ summary: 'حذف جلسة محادثة' })
  @ApiOkResponse({ description: 'تم حذف الجلسة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الجلسة غير موجودة' })
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Request() req, @Param('id') id: string) {
    await this.chatService.deleteSession(req.user.userId, id);
  }

  /**
   * Send message to chat
   */
  @ApiOperation({ summary: 'إرسال رسالة في المحادثة' })
  @ApiOkResponse({ description: 'تم الإرسال' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الجلسة غير موجودة' })
  @Post('sessions/:id/messages')
  async sendMessage(@Request() req, @Param('id') id: string, @Body() dto: SendMessageDto) {
    const result = await this.chatService.sendMessage(req.user.userId, id, dto);
    return {
      userMessage: result.userMessage,
      botMessage: result.botMessage || null,
      analysis: result.analysis ? {
        emotions: result.analysis.emotions,
        crisisDetected: result.analysis.crisisDetected,
        suggestions: result.analysis.suggestions,
        resourceKeywords: result.analysis.resourceKeywords,
        isReportRequest: result.analysis.isReportRequest,
        reportData: result.analysis.reportData,
        recommendTherapist: result.analysis.recommendTherapist,
        disclaimer: result.analysis.disclaimer,
      } : null,
      error: result.error || null,
    };
  }

  /**
   * Get messages for a session
   */
  @ApiOperation({ summary: 'عرض رسائل الجلسة' })
  @ApiOkResponse({ description: 'قائمة الرسائل', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الجلسة غير موجودة' })
  @Get('sessions/:id/messages')
  async getMessages(@Request() req, @Param('id') id: string, @Query('limit') limit: number = 20, @Query('skip') skip: number = 0) {
    await this.chatService.getSessionById(req.user.userId, id);
    return this.chatService.getMessages(id, limit, skip);
  }

  /**
   * Generate conversation summary
   */
  @ApiOperation({ summary: 'إنشاء ملخص المحادثة' })
  @ApiOkResponse({ description: 'ملخص المحادثة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الجلسة غير موجودة' })
  @Post('sessions/:id/summary')
  async generateSummary(@Request() req, @Param('id') id: string) {
    return this.chatService.generateConversationSummary(req.user.userId, id);
  }
}

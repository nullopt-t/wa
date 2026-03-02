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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { SendMessageDto, CreateChatSessionDto } from '../dto/chat.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from '../dto/update-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Submit feedback (authenticated users only, not admins)
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Prevent admins from submitting public feedback
    if (userRole === 'admin') {
      return {
        success: false,
        message: 'المسؤولين لديهم قنوات أخرى لإرسال الملاحظات',
      };
    }
    
    // Get user info from token and add to feedback
    const feedback = await this.feedbackService.create(createFeedbackDto, userId);
    return {
      success: true,
      message: 'تم إرسال ملاحظاتك بنجاح، شكراً لمشاركتك!',
      data: feedback,
    };
  }

  /**
   * Get approved public feedback (for website display)
   */
  @Get('public')
  async getPublicFeedback(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const result = await this.feedbackService.getPublicFeedback(page, limit);
    return {
      success: true,
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        total: result.total,
      },
    };
  }

  /**
   * Get all feedback (admin only)
   */
  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  async getAllFeedback(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }
    
    const result = await this.feedbackService.getAllFeedback(page, limit, status as any, category);
    return {
      success: true,
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        total: result.total,
      },
    };
  }

  /**
   * Get feedback statistics (admin dashboard)
   */
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStatistics(@Request() req) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }
    
    const stats = await this.feedbackService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get feedback by ID (admin)
   */
  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  async getFeedbackById(@Request() req, @Param('id') id: string) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }
    
    const feedback = await this.feedbackService.findById(id);
    return {
      success: true,
      data: feedback,
    };
  }

  /**
   * Update feedback status (admin)
   */
  @Patch('admin/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeedbackStatusDto,
    @Request() req,
  ) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }
    
    const adminUserId = req.user.userId;
    const feedback = await this.feedbackService.updateStatusWithNotification(id, updateDto, adminUserId);
    return {
      success: true,
      message: 'تم تحديث حالة الملاحظة بنجاح',
      data: feedback,
    };
  }

  /**
   * Delete feedback (admin)
   */
  @Delete('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteFeedback(@Request() req, @Param('id') id: string) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }
    
    await this.feedbackService.delete(id);
    return {
      success: true,
      message: 'تم حذف الملاحظة بنجاح',
    };
  }

  /**
   * Get user's own feedback
   */
  @Get('my-feedback')
  @UseGuards(AuthGuard('jwt'))
  async getUserFeedback(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const userId = req.user.userId;
    const result = await this.feedbackService.getUserFeedback(userId, page, limit);
    return {
      success: true,
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        total: result.total,
      },
    };
  }
}

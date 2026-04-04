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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from '../dto/update-feedback.dto';

export class FeedbackStatsDto {
  @ApiProperty({ description: 'إجمالي الملاحظات' })
  total: number;

  @ApiProperty({ description: 'قيد المراجعة' })
  pending: number;

  @ApiProperty({ description: 'الموافق عليها' })
  approved: number;

  @ApiProperty({ description: 'المرفوضة' })
  rejected: number;

  @ApiProperty({ description: 'متوسط التقييم' })
  averageRating: number;

  @ApiProperty({ description: 'حسب الفئة', additionalProperties: { type: 'number' } })
  byCategory: Record<string, number>;
}

@ApiTags('التغذية الراجعة')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Submit feedback (authenticated users only, not admins)
   */
  @ApiOperation({ summary: 'إرسال ملاحظة' })
  @ApiOkResponse({ description: 'تم الإرسال' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس للمسؤولين' })
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
  @ApiOperation({ summary: 'عرض الملاحظات العامة' })
  @ApiOkResponse({ description: 'البيانات العامة', schema: { type: 'array', items: { type: 'object' } } })
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
  @ApiOperation({ summary: 'عرض جميع الملاحظات (إدارة)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'إحصائيات الملاحظات' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: FeedbackStatsDto, description: 'إحصائيات الملاحظات' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'عرض ملاحظة بالرقم (إدارة)' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @ApiResponse({ status: 404, description: 'الملاحظة غير موجودة' })
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
  @ApiOperation({ summary: 'تحديث حالة الملاحظة (إدارة)' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'حذف ملاحظة (إدارة)' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @ApiResponse({ status: 404, description: 'الملاحظة غير موجودة' })
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
  @ApiOperation({ summary: 'عرض ملاحظاتي' })
  @ApiOkResponse({ description: 'ملاحظاتي', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
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

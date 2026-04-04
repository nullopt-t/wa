import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../services/notification.service';

@ApiTags('الإشعارات')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get user notifications
   */
  @ApiOperation({ summary: 'عرض الإشعارات' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get()
  async getNotifications(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('unread') unread?: string,
  ) {
    const userId = req.user.userId;
    const result = await this.notificationService.getUserNotifications(
      userId,
      page,
      limit,
      unread === 'true',
    );

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
   * Get unread count
   */
  @ApiOperation({ summary: 'عدد الإشعارات غير المقروءة' })
  @ApiOkResponse({ description: 'عدد غير المقروءة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const count = await this.notificationService.getUnreadCount(userId);

    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Mark as read
   */
  @ApiOperation({ summary: 'تحديد إشعار كمقروء' })
  @ApiOkResponse({ description: 'تم تحديد كمقروء' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الإشعار غير موجود' })
  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const notification = await this.notificationService.markAsRead(id, userId);

    return {
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: notification,
    };
  }

  /**
   * Mark all as read
   */
  @ApiOperation({ summary: 'تحديد جميع الإشعارات كمقروءة' })
  @ApiOkResponse({ description: 'تم تحديد الكل كمقروء' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    const result = await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة',
      data: result,
    };
  }

  /**
   * Delete notification
   */
  @ApiOperation({ summary: 'حذف إشعار' })
  @ApiOkResponse({ description: 'تم حذف الإشعار' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الإشعار غير موجود' })
  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.notificationService.delete(id, userId);

    return {
      success: true,
      message: 'تم حذف الإشعار',
    };
  }
}

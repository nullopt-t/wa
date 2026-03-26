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
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../services/notification.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get user notifications
   */
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

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationPriority, NotificationType } from '../schemas/notification.schema';
import { NotificationsGateway } from '../gateways/notifications.gateway';

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  relatedModel?: string;
  relatedId?: string;
  senderId?: string;
  senderName?: string;
  priority?: NotificationPriority;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private gateway: NotificationsGateway,
  ) {}

  /**
   * Create notification
   */
  async create(data: CreateNotificationDTO): Promise<Notification> {
    try {
      const notification = await this.notificationModel.create({
        userId: new Types.ObjectId(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        relatedModel: data.relatedModel,
        relatedId: data.relatedId ? new Types.ObjectId(data.relatedId) : undefined,
        senderId: data.senderId ? new Types.ObjectId(data.senderId) : undefined,
        senderName: data.senderName,
        isRead: false,
        isDeleted: false,
        priority: data.priority || 'medium',
      });

      this.logger.debug(`Notification created for user ${data.userId}: ${data.type}`);
      
      // Send real-time notification via Socket.io
      this.gateway.sendNewNotification(data.userId, notification.toObject());
      
      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ): Promise<{ data: Notification[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {
        isDeleted: false,
      };

      // Handle both ObjectId and string userId
      try {
        query.userId = new Types.ObjectId(userId);
      } catch {
        query.userId = userId;
      }

      if (unreadOnly) {
        query.isRead = false;
      }

      const [data, total] = await Promise.all([
        this.notificationModel.find(query)
          .sort({ createdAt: -1, priority: -1 })
          .skip(skip)
          .limit(limit)
          .populate('senderId', 'firstName lastName avatar')
          .exec(),
        this.notificationModel.countDocuments(query),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
        isDeleted: false,
      });
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      return this.notificationModel.findOneAndUpdate(
        {
          _id: notificationId,
          userId: new Types.ObjectId(userId),
        },
        {
          isRead: true,
          readAt: new Date(),
        },
        { new: true },
      ).exec();
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<{ modified: number }> {
    try {
      const result = await this.notificationModel.updateMany(
        {
          userId: new Types.ObjectId(userId),
          isRead: false,
          isDeleted: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
      ).exec();

      return { modified: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification (soft delete)
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    try {
      await this.notificationModel.updateOne(
        {
          _id: notificationId,
          userId: new Types.ObjectId(userId),
        },
        {
          isDeleted: true,
        },
      ).exec();

      this.logger.debug(`Notification ${notificationId} deleted for user ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Cleanup old notifications (keep last N days)
   */
  async cleanupOldNotifications(userId: string, daysToKeep = 90): Promise<{ deleted: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.notificationModel.updateMany(
        {
          userId: new Types.ObjectId(userId),
          createdAt: { $lt: cutoffDate },
        },
        {
          isDeleted: true,
        },
      ).exec();

      this.logger.debug(`Cleaned up ${result.modifiedCount} old notifications for user ${userId}`);
      return { deleted: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcast(
    userIds: string[],
    data: Omit<CreateNotificationDTO, 'userId'>,
  ): Promise<{ created: number }> {
    try {
      const notifications = userIds.map(userId => ({
        ...data,
        userId: new Types.ObjectId(userId),
        isRead: false,
        isDeleted: false,
      }));

      const result = await this.notificationModel.insertMany(notifications);
      this.logger.debug(`Broadcast notification to ${result.length} users`);
      return { created: result.length };
    } catch (error) {
      this.logger.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  /**
   * Create feedback response notification (helper method)
   */
  async createFeedbackResponseNotification(
    userId: string,
    feedbackId: string,
    adminName: string = 'الإدارة',
    adminResponse?: string,
  ): Promise<Notification> {
    const message = adminResponse 
      ? `قام ${adminName} بالرد: "${adminResponse}"`
      : `قام ${adminName} بالرد على تغذيتك الراجعة`;
    
    return this.create({
      userId,
      type: 'feedback_response',
      title: 'رد على تغذيتك الراجعة',
      message,
      actionUrl: `/feedback?highlight=${feedbackId}`,
      relatedModel: 'Feedback',
      relatedId: feedbackId,
      senderName: adminName,
      priority: 'medium',
    });
  }

  /**
   * Create post approved notification (helper method)
   */
  async createPostApprovedNotification(
    userId: string,
    postId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'post_approved',
      title: 'تم نشر منشورك',
      message: 'تم اعتماد منشورك ونشره في المجتمع',
      actionUrl: `/community/post/${postId}`,
      relatedModel: 'Post',
      relatedId: postId,
      priority: 'high',
    });
  }

  /**
   * Create story approved notification (helper method)
   */
  async createStoryApprovedNotification(
    userId: string,
    storyId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'story_approved',
      title: 'تم نشر قصتك',
      message: 'تم اعتماد قصتك ونشرها في المكتبة',
      actionUrl: `/stories/${storyId}`,
      relatedModel: 'Story',
      relatedId: storyId,
      priority: 'high',
    });
  }

  /**
   * Create account activated notification (helper method)
   */
  async createAccountActivatedNotification(
    userId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'account_activated',
      title: 'تم تفعيل حسابك',
      message: 'تم تفعيل حسابك في منصة وعي، يمكنك الآن استخدام جميع الميزات',
      actionUrl: '/dashboard',
      relatedModel: 'User',
      relatedId: userId,
      priority: 'high',
    });
  }
}

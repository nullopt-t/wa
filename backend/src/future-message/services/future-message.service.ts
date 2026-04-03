import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { FutureMessage, FutureMessageDocument } from '../schemas/future-message.schema';
import { CreateFutureMessageDto, UpdateFutureMessageDto } from '../dto/future-message.dto';
import { EmailService } from '../../modules/email/email.service';
import { NotificationService } from '../../notification/services/notification.service';

@Injectable()
export class FutureMessageService {
  constructor(
    @InjectModel(FutureMessage.name) private futureMessageModel: Model<FutureMessageDocument>,
    private emailService: EmailService,
    private notificationService: NotificationService,
  ) {}

  // Create future message
  async create(userId: string, createDto: CreateFutureMessageDto): Promise<FutureMessage> {
    try {
      const deliverDate = new Date(createDto.deliverAt);
      
      // Validate deliver date is in the future
      if (deliverDate <= new Date()) {
        throw new ForbiddenException('يجب أن يكون تاريخ التسليم في المستقبل');
      }

      // Don't allow messages more than 10 years in the future
      const maxFuture = new Date();
      maxFuture.setFullYear(maxFuture.getFullYear() + 10);
      if (deliverDate > maxFuture) {
        throw new ForbiddenException('لا يمكن جدولة رسائل لأكثر من 10 سنوات في المستقبل');
      }

      const createdMessage = new this.futureMessageModel({
        ...createDto,
        userId: new Types.ObjectId(userId),
        isDelivered: false,
      });

      return createdMessage.save();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error creating future message:', error);
      throw error;
    }
  }

  // Get all future messages for user
  async findAll(userId: string, includeDelivered = false): Promise<FutureMessage[]> {
    try {
      console.log('[FutureMessageService.findAll] userId:', userId, 'includeDelivered:', includeDelivered);
      const filter: any = { userId: new Types.ObjectId(userId) };
      if (!includeDelivered) {
        filter.isDelivered = false;
      }

      console.log('[FutureMessageService.findAll] filter:', filter);
      const messages = await this.futureMessageModel
        .find(filter)
        .sort({ deliverAt: -1 })
        .exec();
      console.log('[FutureMessageService.findAll] found:', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('Error fetching future messages:', error);
      throw error;
    }
  }

  // Get single future message
  async findOne(userId: string, id: string): Promise<FutureMessage> {
    try {
      const message = await this.futureMessageModel.findById(id).exec();

      if (!message) {
        throw new NotFoundException('الرسالة غير موجودة');
      }

      // Check ownership
      if (message.userId.toString() !== userId) {
        throw new ForbiddenException('لا يمكنك الوصول إلى هذه الرسالة');
      }

      return message;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error fetching future message:', error);
      throw error;
    }
  }

  // Update future message
  async update(userId: string, id: string, updateDto: UpdateFutureMessageDto): Promise<FutureMessage> {
    try {
      const message = await this.futureMessageModel.findById(id).exec();

      if (!message) {
        throw new NotFoundException('الرسالة غير موجودة');
      }

      // Check ownership
      if (message.userId.toString() !== userId) {
        throw new ForbiddenException('لا يمكنك تعديل هذه الرسالة');
      }

      // Can't update delivered messages
      if (message.isDelivered) {
        throw new ForbiddenException('لا يمكن تعديل الرسالة بعد تسليمها');
      }

      // Validate deliver date if being updated
      if (updateDto.deliverAt) {
        const deliverDate = new Date(updateDto.deliverAt);
        if (deliverDate <= new Date()) {
          throw new ForbiddenException('يجب أن يكون تاريخ التسليم في المستقبل');
        }
      }

      const updated = await this.futureMessageModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error updating future message:', error);
      throw error;
    }
  }

  // Delete future message
  async remove(userId: string, id: string): Promise<void> {
    try {
      const message = await this.futureMessageModel.findById(id).exec();

      if (!message) {
        throw new NotFoundException('الرسالة غير موجودة');
      }

      // Check ownership
      if (message.userId.toString() !== userId) {
        throw new ForbiddenException('لا يمكنك حذف هذه الرسالة');
      }

      await this.futureMessageModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error deleting future message:', error);
      throw error;
    }
  }

  // Get messages ready for delivery
  async getMessagesForDelivery(): Promise<FutureMessage[]> {
    try {
      return this.futureMessageModel
        .find({
          isDelivered: false,
          deliverAt: { $lte: new Date() },
        })
        .populate('userId', 'email firstName lastName')
        .exec();
    } catch (error) {
      console.error('Error fetching messages for delivery:', error);
      throw error;
    }
  }

  // Mark message as delivered
  async markAsDelivered(id: string): Promise<void> {
    try {
      const message = await this.futureMessageModel.findById(id).populate('userId').exec();

      if (!message) {
        throw new NotFoundException('الرسالة غير موجودة');
      }

      // Mark as delivered
      await this.futureMessageModel.findByIdAndUpdate(id, {
        isDelivered: true,
        deliveredAt: new Date(),
      }).exec();

      // Extract userId (populated or raw ObjectId)
      const userId = (message.userId as any)?._id?.toString() || message.userId?.toString();
      Logger.log(`Marking message ${id} as delivered, userId=${userId}`, 'FutureMessageService');

      // 1. Send in-app notification
      if (userId) {
        try {
          await this.notificationService.create({
            userId,
            type: 'future_message',
            title: '📬 رسالة من المستقبل!',
            message: `رسالتك "${message.title || 'بدون عنوان'}" حانت الآن. اذهب لقراءتها!`,
            actionUrl: `/future-messages?view=${id}`,
            relatedModel: 'FutureMessage',
            relatedId: id,
            priority: 'high',
          });
          Logger.log(`In-app notification sent to user ${userId}`, 'FutureMessageService');
        } catch (notifError) {
          Logger.error(`Failed to send notification: ${notifError.message}`, notifError.stack, 'FutureMessageService');
        }
      } else {
        Logger.warn(`No userId for message ${id}, skipping notification`, 'FutureMessageService');
      }

      // 2. Send email notification using user's account email
      if (message.isEmailNotification && message.userId) {
        try {
          const user = message.userId as any;
          const recipientEmail = user.email;

          await this.emailService.sendFutureMessageEmail(
            recipientEmail,
            user.firstName || 'عزيزي',
            message.title || 'رسالة من الماضي',
            message.message,
            (message as any).createdAt,
            message.deliverAt,
            new Date(),
          );
        } catch (emailError) {
          console.error('Failed to send future message email:', emailError);
        }
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  }

  /**
   * Cron job: Run every minute to deliver pending messages
   */
  @Cron('0 * * * * *') // Every minute
  async processPendingMessages() {
    try {
      const now = new Date();
      const pendingMessages = await this.futureMessageModel.find({
        isDelivered: false,
        deliverAt: { $lte: now },
      }).populate('userId').exec();

      for (const msg of pendingMessages) {
        try {
          await this.markAsDelivered(msg._id.toString());
          Logger.log(`Delivered future message: ${msg._id} to ${(msg.userId as any)?.email}`, 'FutureMessageService');
        } catch (err) {
          Logger.error(`Failed to deliver message ${msg._id}: ${err.message}`, err.stack, 'FutureMessageService');
        }
      }

      if (pendingMessages.length > 0) {
        Logger.log(`Processed ${pendingMessages.length} pending future messages`, 'FutureMessageService');
      }
    } catch (error) {
      Logger.error('Error in processPendingMessages cron:', error.stack, 'FutureMessageService');
    }
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FutureMessage, FutureMessageDocument } from '../schemas/future-message.schema';
import { CreateFutureMessageDto, UpdateFutureMessageDto } from '../dto/future-message.dto';

@Injectable()
export class FutureMessageService {
  constructor(
    @InjectModel(FutureMessage.name) private futureMessageModel: Model<FutureMessageDocument>,
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
      await this.futureMessageModel.findByIdAndUpdate(id, {
        isDelivered: true,
        deliveredAt: new Date(),
      }).exec();
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  }
}

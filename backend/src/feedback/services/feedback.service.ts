import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument, FeedbackStatus } from '../schemas/feedback.schema';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from '../dto/update-feedback.dto';
import { NotificationService } from '../../notification/services/notification.service';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Submit new feedback
   */
  async create(createFeedbackDto: CreateFeedbackDto, userId?: string): Promise<Feedback> {
    // If userId provided, get user's name and email
    let name = createFeedbackDto.name;
    let email = createFeedbackDto.email;
    
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (user) {
        name = `${user.firstName} ${user.lastName}`.trim();
        email = user.email;
      }
    }
    
    const feedback = await this.feedbackModel.create({
      ...createFeedbackDto,
      name,
      email,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      status: 'pending', // All feedback starts as pending
      isPublic: false,   // Must be approved before showing publicly
    });

    // Notify all admins about new feedback
    await this.notifyAdminsAboutNewFeedback(feedback._id.toString(), name);

    return feedback;
  }

  /**
   * Notify all admins about new feedback
   */
  private async notifyAdminsAboutNewFeedback(feedbackId: string, userName: string) {
    try {
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin._id.toString(),
          type: 'system',
          title: 'تغذية راجعة جديدة',
          message: `قدم ${userName} تغذية راجعة جديدة`,
          actionUrl: `/admin/feedback?highlight=${feedbackId}`,
          relatedModel: 'Feedback',
          relatedId: feedbackId,
          priority: 'medium',
        });
      }
    } catch (error) {
      console.error('Error notifying admins about feedback:', error);
      // Don't throw - notification failure shouldn't break feedback creation
    }
  }

  /**
   * Submit new feedback with user info
   */
  async createWithUserInfo(feedbackData: any): Promise<Feedback> {
    const feedback = await this.feedbackModel.create(feedbackData);
    return feedback;
  }

  /**
   * Get approved public feedback (for displaying on website)
   */
  async getPublicFeedback(page = 1, limit = 10): Promise<{ data: Feedback[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.feedbackModel.find({ status: 'approved', isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName avatar')
        .exec(),
      this.feedbackModel.countDocuments({ status: 'approved', isPublic: true }),
    ]);

    return { data, total };
  }

  /**
   * Get all feedback (admin only)
   */
  async getAllFeedback(
    page = 1,
    limit = 20,
    status?: FeedbackStatus,
    category?: string,
  ): Promise<{ data: Feedback[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const [data, total] = await Promise.all([
      this.feedbackModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email avatar')
        .populate('respondedBy', 'firstName lastName')
        .exec(),
      this.feedbackModel.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Get feedback by ID
   */
  async findById(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id)
      .populate('userId', 'firstName lastName email avatar')
      .populate('respondedBy', 'firstName lastName')
      .exec();

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  /**
   * Update feedback status (admin)
   */
  async updateStatus(
    id: string,
    updateDto: UpdateFeedbackStatusDto,
    adminUserId: string,
  ): Promise<Feedback> {
    const feedback = await this.findById(id);

    feedback.status = updateDto.status;

    // Auto-set isPublic based on status
    if (updateDto.status === 'approved') {
      feedback.isPublic = true;
    } else if (updateDto.status === 'rejected') {
      feedback.isPublic = false;
    }

    // Add admin response if provided
    if (updateDto.adminResponse) {
      feedback.adminResponse = updateDto.adminResponse;
      feedback.adminResponseAt = new Date();
      feedback.respondedBy = new Types.ObjectId(adminUserId);
    }

    return this.feedbackModel.findByIdAndUpdate(
      id,
      feedback,
      { new: true },
    ).exec();
  }

  /**
   * Update feedback status and create notification if admin responds
   */
  async updateStatusWithNotification(
    id: string,
    updateDto: UpdateFeedbackStatusDto,
    adminUserId: string,
  ): Promise<Feedback> {
    const feedback = await this.updateStatus(id, updateDto, adminUserId);

    // Prevent editing if admin already responded
    if (feedback.adminResponse && updateDto.adminResponse && feedback.adminResponse !== updateDto.adminResponse) {
      throw new BadRequestException('لا يمكن تعديل رد الإدارة بعد الإرسال');
    }

    // Create notification if admin added a response AND feedback has userId
    if (updateDto.adminResponse && feedback.userId) {
      // Get admin name
      const admin = await this.userModel.findById(adminUserId).exec();
      const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'الإدارة';
      
      await this.notificationService.createFeedbackResponseNotification(
        feedback.userId.toString(),
        id,
        adminName,
        updateDto.adminResponse,
      );
    }

    // Notify all admins about status change (approve/reject)
    if (updateDto.status && updateDto.status !== feedback.status) {
      await this.notifyAdminsAboutStatusChange(
        id,
        updateDto.status,
        feedback.name,
        adminUserId,
      );
    }

    return feedback;
  }

  /**
   * Notify all admins about feedback status change
   */
  private async notifyAdminsAboutStatusChange(
    feedbackId: string,
    status: string,
    userName: string,
    adminUserId: string,
  ) {
    try {
      const admin = await this.userModel.findById(adminUserId).exec();
      const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'أحد المسؤولين';
      
      const admins = await this.userModel.find({ 
        role: 'admin',
        _id: { $ne: adminUserId }, // Don't notify the admin who made the change
      }).exec();
      
      const statusText = status === 'approved' ? 'موافقة' : 'رفض';
      const statusAr = status === 'approved' ? 'معتمدة' : 'مرفوضة';
      
      for (const otherAdmin of admins) {
        await this.notificationService.create({
          userId: otherAdmin._id.toString(),
          type: 'system',
          title: `تم ${statusText} تغذية راجعة`,
          message: `قام ${adminName} ب${statusText === 'موافقة' ? 'اعتماد' : 'رفض'} تغذية راجعة من ${userName} (${statusAr})`,
          actionUrl: `/admin/feedback?highlight=${feedbackId}`,
          relatedModel: 'Feedback',
          relatedId: feedbackId,
          priority: 'low',
        });
      }
    } catch (error) {
      console.error('Error notifying admins about status change:', error);
      // Don't throw - notification failure shouldn't break status update
    }
  }

  /**
   * Delete feedback (admin)
   */
  async delete(id: string): Promise<void> {
    const result = await this.feedbackModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
  }

  /**
   * Get feedback statistics (admin dashboard)
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageRating: number;
    byCategory: Record<string, number>;
  }> {
    const total = await this.feedbackModel.countDocuments();
    const pending = await this.feedbackModel.countDocuments({ status: 'pending' });
    const approved = await this.feedbackModel.countDocuments({ status: 'approved' });
    const rejected = await this.feedbackModel.countDocuments({ status: 'rejected' });

    // Average rating
    const ratingStats = await this.feedbackModel.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const averageRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;

    // By category
    const categoryStats = await this.feedbackModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat._id || 'other'] = stat.count;
      return acc;
    }, {});

    return {
      total,
      pending,
      approved,
      rejected,
      averageRating: Math.round(averageRating * 10) / 10,
      byCategory,
    };
  }

  /**
   * Get user's own feedback
   */
  async getUserFeedback(userId: string, page = 1, limit = 10): Promise<{ data: Feedback[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.feedbackModel.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.feedbackModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return { data, total };
  }
}

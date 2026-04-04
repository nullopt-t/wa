import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportStatus } from '../schemas/report.schema';
import { Post, PostDocument } from '../schemas/post.schema';
import { Comment, CommentDocument } from '../../comment/schemas/comment.schema';
import { CreateReportDto, UpdateReportDto } from '../dto/report.dto';
import { NotificationService } from '../../notification/services/notification.service';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  // Create report (authenticated users)
  async create(userId: string, createReportDto: CreateReportDto): Promise<Report> {
    const { targetType, targetId, reason, description } = createReportDto;

    let contentSnapshot = '';

    // Verify target exists and get content snapshot
    if (targetType === 'post') {
      const post = await this.postModel.findById(targetId).exec();
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      contentSnapshot = post.content?.substring(0, 5000) || '';
    } else if (targetType === 'comment') {
      const comment = await this.commentModel.findById(targetId).exec();
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      contentSnapshot = comment.content?.substring(0, 5000) || '';
    }

    // Check if user already reported this target
    const existingReport = await this.reportModel
      .findOne({
        reporterId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
      })
      .exec();

    if (existingReport) {
      // If existing report has no contentSnapshot, update it
      if (!existingReport.contentSnapshot && contentSnapshot) {
        existingReport.contentSnapshot = contentSnapshot;
        await existingReport.save();
      }
      throw new BadRequestException('You have already reported this content');
    }

    const createdReport = new this.reportModel({
      reporterId: new Types.ObjectId(userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      reason,
      description,
      status: ReportStatus.PENDING,
      contentSnapshot, // Save content snapshot
    });

    const savedReport = await createdReport.save();

    // Auto-hide reported content
    if (targetType === 'comment') {
      await this.commentModel.findByIdAndUpdate(targetId, {
        status: 'reported',
      });
    } else if (targetType === 'post') {
      await this.postModel.findByIdAndUpdate(targetId, {
        status: 'reported',
      });
    }

    // Notify all admins about new report
    await this.notifyAdminsAboutNewReport(savedReport._id.toString(), targetType, reason);

    return savedReport;
  }

  /**
   * Notify all admins about new report
   */
  private async notifyAdminsAboutNewReport(reportId: string, targetType: string, reason: string) {
    try {
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      
      const targetTypeAr = targetType === 'post' ? 'منشور' : 'تعليق';
      
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin._id.toString(),
          type: 'system',
          title: 'بلاغ جديد',
          message: `تم الإبلاغ عن ${targetTypeAr} بسبب ${reason}`,
          actionUrl: '/admin/reports',
          relatedModel: 'Report',
          relatedId: reportId,
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Error notifying admins about report:', error);
      // Don't throw - notification failure shouldn't break report creation
    }
  }

  // Get reports for a target (for admins/moderators)
  async getReportsForTarget(targetType: string, targetId: string): Promise<Report[]> {
    return this.reportModel
      .find({ targetType, targetId: new Types.ObjectId(targetId) })
      .populate('reporterId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get all reports (for admins)
  async findAll(page = 1, limit = 20, status?: string): Promise<any> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const reports = await this.reportModel
      .find(filter)
      .populate('reporterId', 'firstName lastName avatar')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.reportModel.countDocuments(filter);

    return {
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Update report (for admins/moderators)
  async update(userId: string, id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.reportModel.findById(id).exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.reportModel
      .findByIdAndUpdate(
        id,
        {
          ...updateReportDto,
          reviewedBy: new Types.ObjectId(userId),
          reviewedAt: new Date(),
        },
        { new: true },
      )
      .populate('reviewedBy', 'firstName lastName')
      .exec();

    // If resolved or dismissed, send notification to content author
    if (updateReportDto.status === 'resolved' || updateReportDto.status === 'dismissed') {
      await this.notifyContentAuthor(report, updateReportDto.status);
    }

    // If resolved, take action on the reported content
    if (updateReportDto.status === 'resolved') {
      await this.takeActionOnReport(report);
    }

    return updated;
  }

  // Notify content author about report decision
  private async notifyContentAuthor(report: ReportDocument, status: string) {
    try {
      let authorId: Types.ObjectId | null = null;
      let targetType = '';
      let targetId = '';

      if (report.targetType === 'post') {
        const post = await this.postModel.findById(report.targetId).exec();
        if (post && post.authorId) {
          authorId = post.authorId as Types.ObjectId;
          targetType = 'Post';
          targetId = report.targetId.toString();
        }
      } else if (report.targetType === 'comment') {
        const comment = await this.commentModel.findById(report.targetId).exec();
        if (comment && comment.authorId) {
          authorId = comment.authorId as Types.ObjectId;
          targetType = 'Comment';
          targetId = report.targetId.toString();
        }
      }

      if (authorId) {
        const message = status === 'resolved'
          ? `تم اتخاذ إجراء بشأن ${targetType} المبلغ عنه: تم إخفاؤه`
          : `تم مراجعة ${targetType} المبلغ عنه: تم رفض البلاغ`;

        await this.notificationService.create({
          userId: authorId.toString(),
          type: 'system',
          title: status === 'resolved' ? 'إجراء على محتوى تم الإبلاغ عنه' : 'مراجعة بلاغ',
          message,
          actionUrl: report.targetType === 'post' ? `/community/post/${targetId}` : undefined,
          relatedModel: 'Report',
          relatedId: report._id.toString(),
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Error sending report notification:', error);
      // Don't throw - notification failure shouldn't break report update
    }
  }

  // Take action on resolved report (hide/delete content)
  private async takeActionOnReport(report: ReportDocument) {
    if (report.targetType === 'post') {
      await this.postModel.findByIdAndUpdate(report.targetId, {
        status: 'hidden',
      }).exec();
    } else if (report.targetType === 'comment') {
      await this.commentModel.findByIdAndUpdate(report.targetId, {
        status: 'hidden',
      }).exec();
    }
  }

  // Get report statistics (for admins)
  async getStatistics(): Promise<any> {
    const total = await this.reportModel.countDocuments();
    const pending = await this.reportModel.countDocuments({ status: ReportStatus.PENDING });
    const reviewed = await this.reportModel.countDocuments({ status: ReportStatus.REVIEWED });
    const resolved = await this.reportModel.countDocuments({ status: ReportStatus.RESOLVED });
    const dismissed = await this.reportModel.countDocuments({ status: ReportStatus.DISMISSED });

    // Group by reason
    const byReason = await this.reportModel.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      pending,
      reviewed,
      resolved,
      dismissed,
      byReason,
    };
  }
}

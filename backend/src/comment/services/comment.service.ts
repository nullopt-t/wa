import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { CreateCommentDto, UpdateCommentDto, AdminUpdateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  // Get all comments (admin) - includes both article and post comments
  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
      status,
      sort = 'createdAt',
    } = query;

    const filter: any = {};

    // Filter by status (support both systems)
    if (status && status !== 'all') {
      if (status === 'reported') {
        // Show reported comments from both systems
        filter.status = { $in: ['reported', 'deleted'] };
      } else if (status === 'active') {
        // Show active/approved comments
        filter.status = { $in: ['active', 'approved'] };
      }
    }

    const comments = await this.commentModel
      .find(filter)
      .populate('authorId', 'firstName lastName avatar email')
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.commentModel.countDocuments(filter);

    return {
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get comments by article (public)
  async findByArticle(articleId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ articleId, status: 'active' })
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get comments by post (public)
  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ postId, status: 'active' })
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Create comment
  async create(userId: string, createDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel({
      ...createDto,
      authorId: new Types.ObjectId(userId),
    });

    return createdComment.save();
  }

  // Update comment (user can edit own comment)
  async update(userId: string, id: string, updateDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('التعليق غير موجود');
    }

    // Check if user owns the comment
    if (comment.authorId.toString() !== userId) {
      throw new ForbiddenException('لا يمكنك تعديل تعليقات الآخرين');
    }

    const updated = await this.commentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('authorId', 'firstName lastName avatar')
      .exec();

    return updated;
  }

  // Admin update comment (change status, etc.)
  async adminUpdate(id: string, updateDto: AdminUpdateCommentDto): Promise<Comment> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('authorId', 'firstName lastName avatar')
      .exec();

    if (!updated) {
      throw new NotFoundException('التعليق غير موجود');
    }

    return updated;
  }

  // Delete comment
  async delete(id: string): Promise<void> {
    const result = await this.commentModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('التعليق غير موجود');
    }
  }

  // Report comment
  async report(userId: string, id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('التعليق غير موجود');
    }

    // Check if user already reported
    if (comment.reportedBy.some(id => id.toString() === userId)) {
      throw new ForbiddenException('لقد أبلغت عن هذا التعليق بالفعل');
    }

    comment.reportedBy.push(new Types.ObjectId(userId));
    comment.reports += 1;

    // Auto-hide if reported (for testing, show after 1 report)
    if (comment.reports >= 1) {
      comment.status = 'reported';
    }

    return comment.save();
  }

  // Like comment
  async like(userId: string, id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('التعليق غير موجود');
    }

    // Check if user already liked
    const alreadyLiked = comment.likedBy.some(id => id.toString() === userId);

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
      comment.likes -= 1;
    } else {
      comment.likedBy.push(new Types.ObjectId(userId));
      comment.likes += 1;
    }

    return comment.save();
  }
}

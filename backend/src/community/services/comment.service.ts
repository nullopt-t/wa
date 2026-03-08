import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  // Create comment
  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      authorId: new Types.ObjectId(userId),
      status: 'approved',
    });

    const savedComment = await createdComment.save();

    // Increment post's commentsCount
    await this.postModel.findByIdAndUpdate(createCommentDto.postId, {
      $inc: { commentsCount: 1 },
    }).exec();

    // If it's a reply, increment parent comment's replies count
    if (createCommentDto.parentId) {
      await this.commentModel.findByIdAndUpdate(createCommentDto.parentId, {
        $inc: { repliesCount: 1 },
      }).exec();
    }

    return savedComment.populate('authorId', 'firstName lastName avatar');
  }

  // Get comments for a post (with nested replies)
  async findByPost(postId: string, page = 1, limit = 50): Promise<any> {
    const comments = await this.commentModel
      .find({ postId: postId, status: 'approved', parentId: { $exists: false } })
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    console.log(`Found ${comments.length} top-level comments`);

    // Get nested replies for each comment recursively
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.getNestedReplies(comment._id.toString());
        console.log(`Comment ${comment._id} has ${replies.length} nested replies`);

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    const total = await this.commentModel.countDocuments({
      postId: postId,
      status: 'approved',
      parentId: { $exists: false },
    });

    return {
      comments: commentsWithReplies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Recursively fetch nested replies
  async getNestedReplies(parentId: string): Promise<any[]> {
    const replies = await this.commentModel
      .find({ 
        parentId: parentId, 
        status: 'approved' 
      })
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .exec();

    // Recursively get replies for each reply
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await this.getNestedReplies(reply._id.toString());
        return {
          ...reply.toObject(),
          replies: nestedReplies,
        };
      })
    );

    return repliesWithNested;
  }

  // Update comment
  async update(userId: string, id: string, updateCommentDto: UpdateCommentDto, postId?: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment OR owns the post
    const isCommentAuthor = comment.authorId.toString() === userId;
    
    let isPostAuthor = false;
    if (postId) {
      const postModel = this.commentModel.db.model('Post');
      const post = await postModel.findById(postId).exec();
      isPostAuthor = post && post.authorId.toString() === userId;
    }

    if (!isCommentAuthor && !isPostAuthor) {
      throw new ForbiddenException('You can only edit your own comments or comments on your posts');
    }

    return this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .populate('authorId', 'firstName lastName avatar')
      .exec();
  }

  // Delete comment (soft delete - just hide it)
  async delete(userId: string, id: string): Promise<void> {
    const comment = await this.commentModel.findById(id).exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment (admins can delete any comment)
    if (comment.authorId.toString() !== userId) {
      // Check if user is admin using direct connection
      const userModel = this.connection.model('User');
      const user = await userModel.findById(userId).exec();
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('You can only delete your own comments');
      }
    }

    // Soft delete: Just hide the comment by changing status
    // Don't actually remove from database (preserves reports and context)
    const updateResult = await this.commentModel.findByIdAndUpdate(id, {
      status: 'deleted',
      content: '[تم حذف هذا التعليق]', // Replace content with placeholder
    }).exec();

    // Only decrement count if comment wasn't already deleted
    if (updateResult && comment.status !== 'deleted') {
      // Decrement post's commentsCount
      try {
        const countUpdate = await this.postModel.findByIdAndUpdate(comment.postId, {
          $inc: { commentsCount: -1 },
        }).exec();
        console.log(`Updated post ${comment.postId} commentsCount:`, countUpdate);
      } catch (err) {
        console.error('Failed to decrement commentsCount:', err);
      }

      // If it's a reply, decrement parent comment's replies count
      if (comment.parentId) {
        try {
          await this.commentModel.findByIdAndUpdate(comment.parentId, {
            $inc: { repliesCount: -1 },
          }).exec();
        } catch (err) {
          console.error('Failed to decrement repliesCount:', err);
        }
      }
    } else if (comment.status === 'deleted') {
      console.log(`Comment ${id} already deleted, skipping count decrement`);
    }
  }

  // Like comment
  async like(userId: string, commentId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId).exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if already liked
    const isLiked = comment.likes?.some(id => id.toString() === userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      if (!comment.likes) comment.likes = [];
      comment.likes.push(userObjectId);
    }

    await comment.save();
    
    // Return populated comment
    return this.commentModel.findById(commentId)
      .populate('authorId', 'firstName lastName avatar')
      .exec();
  }
}

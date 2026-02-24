import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  // Create new post
  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel({
      ...createPostDto,
      authorId: new Types.ObjectId(userId),
      status: 'approved', // Auto-approve posts for now
    });
    
    return createdPost.save();
  }

  // Get all posts (approved only, for public)
  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
      category,
      tag,
      sort = 'createdAt',
    } = query;

    const filter: any = { status: 'approved' };

    if (category) {
      console.log('Filtering by category:', category);
      // Handle both string and ObjectId formats
      filter.categoryId = category;
      console.log('Category filter:', filter.categoryId);
    }
    
    if (tag) {
      // Filter by tag (exact match in tags array)
      filter.tags = tag;
      console.log('Tag filter:', filter.tags);
    }

    console.log('Final filter:', JSON.stringify(filter));

    const posts = await this.postModel
      .find(filter)
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId')
      .sort({ [sort]: -1, isPinned: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.postModel.countDocuments(filter);

    return {
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get single post
  async findOne(id: string): Promise<Post> {
    const post = await this.postModel
      .findById(id)
      .populate('authorId', 'firstName lastName avatar role')
      .populate('categoryId')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // Get single post with full data (including comments)
  async findOneWithComments(id: string, page = 1, limit = 50): Promise<any> {
    const post = await this.postModel
      .findById(id)
      .populate('authorId', 'firstName lastName avatar role')
      .populate('categoryId')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commentsData = await this.commentModel
      .find({ postId: id, status: 'approved', parentId: { $exists: false } })
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      commentsData.map(async (comment) => {
        const replies = await this.commentModel
          .find({ parentId: comment._id, status: 'approved' })
          .populate('authorId', 'firstName lastName avatar')
          .sort({ createdAt: 1 })
          .exec();

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    const totalComments = await this.commentModel.countDocuments({
      postId: id,
      status: 'approved',
      parentId: { $exists: false },
    });

    return {
      post,
      comments: commentsWithReplies,
      commentsPagination: {
        totalPages: Math.ceil(totalComments / limit),
        currentPage: page,
        total: totalComments,
      },
    };
  }

  // Update post
  async update(userId: string, id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user owns the post
    if (post.authorId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('authorId')
      .populate('categoryId')
      .exec();

    return updated;
  }

  // Delete post
  async remove(userId: string, id: string): Promise<void> {
    const post = await this.postModel.findById(id).exec();
    
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user owns the post (or is admin)
    if (post.authorId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(id).exec();
  }

  // Like post
  async like(userId: string, postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId).exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if already liked
    const isLiked = post.likes?.some(id => id.toString() === userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      if (!post.likes) post.likes = [];
      post.likes.push(userObjectId);
    }

    await post.save();
    
    // Return populated post
    return this.postModel.findById(postId)
      .populate('authorId', 'firstName lastName avatar role')
      .populate('categoryId')
      .exec();
  }

  // Track view with deduplication (one view per user per post)
  async trackView(id: string, userId?: string): Promise<{ views: number; uniqueViews: number }> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = userId ? new Types.ObjectId(userId) : null;
    let updatedPost;

    if (userId) {
      // Check if user already viewed this post
      const alreadyViewed = post.viewers?.some(
        viewerId => viewerId.toString() === userId,
      );

      if (!alreadyViewed) {
        // First view from this user - increment count and add to viewers
        updatedPost = await this.postModel.findByIdAndUpdate(id, {
          $inc: { views: 1 },
          $push: { viewers: userObjectId },
          lastActivityAt: new Date(),
        }, { new: true }).exec();
      } else {
        // User already viewed - just update last activity (no count increment)
        updatedPost = await this.postModel.findByIdAndUpdate(id, {
          lastActivityAt: new Date(),
        }, { new: true }).exec();
      }
    } else {
      // Anonymous user - always increment (no deduplication possible)
      updatedPost = await this.postModel.findByIdAndUpdate(id, {
        $inc: { views: 1 },
        lastActivityAt: new Date(),
      }, { new: true }).exec();
    }

    return {
      views: updatedPost.views,
      uniqueViews: updatedPost.viewers?.length || 0,
    };
  }

  // Search posts
  async findByUser(userId: string, page = 1, limit = 20): Promise<any> {
    const posts = await this.postModel
      .find({ authorId: new Types.ObjectId(userId) })
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.postModel.countDocuments({ 
      authorId: new Types.ObjectId(userId) 
    });

    return {
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get trending posts (most likes in last 7 days)
  async findTrending(limit = 10): Promise<Post[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.postModel
      .find({ 
        status: 'approved',
        createdAt: { $gte: sevenDaysAgo },
      })
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId')
      .sort({ likes: -1, views: -1 })
      .limit(limit)
      .exec();
  }

  // Search posts
  async search(query: string, page = 1, limit = 20): Promise<any> {
    const posts = await this.postModel
      .find({
        status: 'approved',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
      })
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.postModel.countDocuments({
      status: 'approved',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    });

    return {
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Save/Unsave post (bookmark)
  async save(userId: string, postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId).exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if already saved
    const isSaved = post.savedBy?.some(id => id.toString() === userId);

    if (isSaved) {
      // Unsave
      post.savedBy = post.savedBy.filter(id => id.toString() !== userId);
    } else {
      // Save
      if (!post.savedBy) post.savedBy = [];
      post.savedBy.push(userObjectId);
    }

    await post.save();
    
    // Return populated post
    return this.postModel.findById(postId)
      .populate('authorId', 'firstName lastName avatar role')
      .populate('categoryId')
      .exec();
  }

  // Get user's saved posts
  async getSavedPosts(userId: string, page = 1, limit = 20): Promise<any> {
    const posts = await this.postModel
      .find({
        status: 'approved',
        savedBy: new Types.ObjectId(userId),
      })
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.postModel.countDocuments({
      status: 'approved',
      savedBy: new Types.ObjectId(userId),
    });

    return {
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get trending tags (most used in approved posts)
  async getTrendingTags(limit = 10): Promise<any[]> {
    const tags = await this.postModel.aggregate([
      { $match: { status: 'approved' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]).exec();

    return tags.map(tag => ({
      tag: tag._id,
      count: tag.count,
    }));
  }
}

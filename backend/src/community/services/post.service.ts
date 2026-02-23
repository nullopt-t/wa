import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
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
    if (tag) filter.tags = tag;

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
    return post;
  }

  // Track view
  async trackView(id: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
      lastActivityAt: new Date(),
    }).exec();
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
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story, StoryDocument } from '../schemas/story.schema';
import { CreateStoryDto, UpdateStoryDto, StoryFilterDto } from '../dto/story.dto';
import { NotificationService } from '../../notification/services/notification.service';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  // Create story
  async create(userId: string, createDto: CreateStoryDto): Promise<Story> {
    try {
      // Calculate read time (average 200 words per minute)
      const wordCount = createDto.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200) || 1;

      const story = new this.storyModel({
        ...createDto,
        authorId: new Types.ObjectId(userId),
        isAnonymous: createDto.isAnonymous || false,
        status: 'pending', // Stories need approval
        readTime,
      });

      const savedStory = await story.save();

      // Notify all admins about new story
      await this.notifyAdminsAboutNewStory(savedStory._id.toString(), userId);

      return savedStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  /**
   * Notify all admins about new story
   */
  private async notifyAdminsAboutNewStory(storyId: string, userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      const userName = user ? `${user.firstName} ${user.lastName}` : 'مستخدم';
      
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin._id.toString(),
          type: 'system',
          title: 'قصة جديدة',
          message: `نشر ${userName} قصة جديدة وتحتاج مراجعة`,
          actionUrl: '/admin/stories',
          relatedModel: 'Story',
          relatedId: storyId,
          priority: 'medium',
        });
      }
    } catch (error) {
      console.error('Error notifying admins about story:', error);
      // Don't throw - notification failure shouldn't break story creation
    }
  }

  // Get all stories with filters
  async findAll(filters: StoryFilterDto, userId?: string): Promise<any> {
    try {
      const { category, sort = 'newest', page = 1, limit = 12 } = filters;
      
      const filter: any = { status: 'approved' };
      
      if (category && category !== 'all') {
        filter.category = category;
      }

      // Build sort object
      let sortOption: any = { createdAt: -1 };
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'most-viewed':
          sortOption = { views: -1 };
          break;
        case 'most-liked':
          sortOption = { likes: -1 };
          break;
      }

      const skip = (page - 1) * limit;

      const stories = await this.storyModel
        .find(filter)
        .populate('authorId', 'firstName lastName avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.storyModel.countDocuments(filter);

      // Transform stories to include isLiked
      const transformedStories = stories.map(story => {
        const storyObj = story.toObject();
        if (userId) {
          (storyObj as any).isLiked = story.likes?.some(id => id.toString() === userId) || false;
        }
        return storyObj;
      });

      return {
        stories: transformedStories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  // Get single story
  async findOne(id: string, userId?: string): Promise<Story> {
    try {
      const story = await this.storyModel
        .findById(id)
        .populate('authorId', 'firstName lastName avatar')
        .exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      // Increment view count
      await this.storyModel.findByIdAndUpdate(id, {
        $inc: { views: 1 },
        $addToSet: { viewers: new Types.ObjectId(userId) },
      });

      const storyObj = story.toObject();
      if (userId) {
        (storyObj as any).isLiked = story.likes?.some(id => id.toString() === userId) || false;
      }
      
      return storyObj;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching story:', error);
      throw error;
    }
  }

  // Get user's stories
  async findByUser(userId: string, page = 1, limit = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const stories = await this.storyModel
        .find({ authorId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.storyModel.countDocuments({ 
        authorId: new Types.ObjectId(userId) 
      });

      return {
        stories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  // Update story
  async update(userId: string, id: string, updateDto: UpdateStoryDto): Promise<Story> {
    try {
      const story = await this.storyModel.findById(id).exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      // Check ownership (unless admin)
      if (story.authorId.toString() !== userId) {
        throw new ForbiddenException('لا يمكنك تعديل هذه القصة');
      }

      // Can't update approved stories without re-approval
      if (story.status === 'approved' && !updateDto.isFeatured) {
        updateDto.status = 'pending';
      }

      // Recalculate read time if content changed
      if (updateDto.content) {
        const wordCount = updateDto.content.split(/\s+/).length;
        updateDto.readTime = Math.ceil(wordCount / 200) || 1;
      }

      return await this.storyModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error updating story:', error);
      throw error;
    }
  }

  // Delete story
  async remove(userId: string, id: string): Promise<void> {
    try {
      const story = await this.storyModel.findById(id).exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      // Check ownership (unless admin)
      if (story.authorId.toString() !== userId) {
        throw new ForbiddenException('لا يمكنك حذف هذه القصة');
      }

      await this.storyModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  // Like/Unlike story
  async like(userId: string, id: string): Promise<any> {
    try {
      const story = await this.storyModel.findById(id).exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      const userObjectId = new Types.ObjectId(userId);
      const isLiked = story.likes?.some(id => id.toString() === userId);

      if (isLiked) {
        // Unlike
        await this.storyModel.findByIdAndUpdate(id, {
          $pull: { likes: userObjectId },
        });
      } else {
        // Like
        await this.storyModel.findByIdAndUpdate(id, {
          $addToSet: { likes: userObjectId },
        });
      }

      return { 
        liked: !isLiked,
        likes: isLiked ? story.likes.length - 1 : story.likes.length + 1,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error liking story:', error);
      throw error;
    }
  }

  // Save/Unsave story
  async save(userId: string, id: string): Promise<any> {
    try {
      const story = await this.storyModel.findById(id).exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      const userObjectId = new Types.ObjectId(userId);
      const isSaved = story.savedBy?.some(id => id.toString() === userId);

      if (isSaved) {
        await this.storyModel.findByIdAndUpdate(id, {
          $pull: { savedBy: userObjectId },
        });
      } else {
        await this.storyModel.findByIdAndUpdate(id, {
          $addToSet: { savedBy: userObjectId },
        });
      }

      return { saved: !isSaved };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error saving story:', error);
      throw error;
    }
  }

  // Get user's saved stories
  async getSavedStories(userId: string, page = 1, limit = 12): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const stories = await this.storyModel
        .find({ 
          savedBy: { $in: [new Types.ObjectId(userId)] },
          status: 'approved'
        })
        .populate('authorId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.storyModel.countDocuments({
        savedBy: { $in: [new Types.ObjectId(userId)] },
        status: 'approved',
      });

      return {
        stories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error('Error fetching saved stories:', error);
      throw error;
    }
  }

  // Admin: Get all stories (including pending)
  async findAllForAdmin(filters: StoryFilterDto, page = 1, limit = 20): Promise<any> {
    try {
      const { category, sort = 'newest', status } = filters as any;
      const skip = (page - 1) * limit;
      
      const filter: any = {};
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      if (status) {
        filter.status = status;
      }

      let sortOption: any = { createdAt: -1 };
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'most-viewed':
          sortOption = { views: -1 };
          break;
        case 'most-liked':
          sortOption = { likes: -1 };
          break;
      }

      const stories = await this.storyModel
        .find(filter)
        .populate('authorId', 'firstName lastName email avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.storyModel.countDocuments(filter);

      return {
        stories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error('Error fetching admin stories:', error);
      throw error;
    }
  }

  // Admin: Approve/Reject story
  async moderateStory(adminId: string, id: string, status: 'approved' | 'rejected' | 'hidden'): Promise<Story> {
    try {
      const story = await this.storyModel.findById(id).exec();

      if (!story) {
        throw new NotFoundException('القصة غير موجودة');
      }

      const updatedStory = await this.storyModel
        .findByIdAndUpdate(id, {
          status,
          reviewedAt: new Date(),
          reviewedBy: new Types.ObjectId(adminId),
        }, { new: true })
        .exec();

      // Send notification if story is approved
      if (status === 'approved' && story.authorId) {
        await this.notificationService.createStoryApprovedNotification(
          story.authorId.toString(),
          id,
        );
      }

      return updatedStory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error moderating story:', error);
      throw error;
    }
  }

  // Get story statistics
  async getStats(): Promise<any> {
    try {
      const totalStories = await this.storyModel.countDocuments();
      const approvedStories = await this.storyModel.countDocuments({ status: 'approved' });
      const pendingStories = await this.storyModel.countDocuments({ status: 'pending' });
      
      const totalViews = await this.storyModel.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]);

      const totalLikes = await this.storyModel.aggregate([
        { $group: { _id: null, total: { $sum: { $size: '$likes' } } } },
      ]);

      return {
        totalStories,
        approvedStories,
        pendingStories,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching story stats:', error);
      throw error;
    }
  }
}

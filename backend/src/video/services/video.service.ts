import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument } from '../schemas/video.schema';
import { CreateVideoDto, UpdateVideoDto } from '../dto/video.dto';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  // Create video (admin only)
  async create(userId: string, createDto: CreateVideoDto): Promise<Video> {
    const createdVideo = new this.videoModel({
      ...createDto,
      addedBy: new Types.ObjectId(userId),
    });

    return createdVideo.save();
  }

  // Get all active videos (public)
  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 12,
      featured,
      excludeFeatured,
      category,
    } = query;

    const filter: any = { isActive: true };

    // Exclude featured videos if requested (for main list when featured section is shown)
    if (excludeFeatured === 'true') {
      filter.isFeatured = { $ne: true };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (category) {
      filter.category = category;
    }

    const videos = await this.videoModel
      .find(filter)
      .populate('addedBy', 'firstName lastName avatar')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.videoModel.countDocuments(filter);

    return {
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get all videos (admin)
  async findAllForAdmin(query: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
    } = query;

    const videos = await this.videoModel
      .find({})
      .populate('addedBy', 'firstName lastName avatar')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.videoModel.countDocuments({});

    return {
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get featured videos (public)
  async findFeatured(limit = 6): Promise<Video[]> {
    return this.videoModel
      .find({ isActive: true, isFeatured: true })
      .populate('addedBy', 'firstName lastName avatar')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // Get single video (public)
  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel
      .findById(id)
      .populate('addedBy', 'firstName lastName avatar')
      .exec();

    if (!video) {
      throw new NotFoundException('الفيديو غير موجود');
    }

    // Increment views
    await this.videoModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });

    return video;
  }

  // Update video (admin only)
  async update(id: string, updateDto: UpdateVideoDto): Promise<Video> {
    const updated = await this.videoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('addedBy', 'firstName lastName avatar')
      .exec();

    if (!updated) {
      throw new NotFoundException('الفيديو غير موجود');
    }

    return updated;
  }

  // Delete video (admin only)
  async remove(id: string): Promise<void> {
    const result = await this.videoModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('الفيديو غير موجود');
    }
  }

  // Track view
  async trackView(id: string): Promise<void> {
    await this.videoModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });
  }
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { TherapistProfile, TherapistProfileDocument } from './schemas/therapist-profile.schema';

@Injectable()
export class TherapistService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TherapistProfile.name) private therapistProfileModel: Model<TherapistProfileDocument>,
  ) {}

  /**
   * Create therapist profile
   */
  async createProfile(userId: string, profileData: any): Promise<TherapistProfile> {
    // Verify user exists and is a therapist
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'therapist') {
      throw new ForbiddenException('Only users with therapist role can create therapist profiles');
    }

    // Check if profile already exists
    const existingProfile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (existingProfile) {
      throw new BadRequestException('Therapist profile already exists');
    }

    // Create profile
    const profile = await this.therapistProfileModel.create({
      ...profileData,
      userId: new Types.ObjectId(userId),
    });

    return profile;
  }

  /**
   * Get all therapists (with filters)
   */
  async findAll(filters: any, isAdminQuery = false): Promise<{ therapists: any[]; total: number }> {
    const {
      city,
      country,
      language,
      isOnline,
      minPrice,
      maxPrice,
      isVerified,
      page = 1,
      limit = 12,
      sort = 'averageRating',
    } = filters;

    const skip = (page - 1) * limit;
    const query: any = {};

    // For admin queries, don't filter by verification status unless explicitly requested
    if (isAdminQuery) {
      // Admin can optionally filter by verification status
      if (isVerified !== undefined && isVerified !== '') {
        query.isVerified = isVerified === true || isVerified === 'true';
      }
      // Admin always sees active therapists
      query.isActive = true;
    } else {
      // For public queries, only show verified and approved therapists
      query.isVerified = true;
      query.isApproved = true;
      query.isActive = true;
    }

    if (city) query.city = city;
    if (country) query.country = country;
    if (isOnline === 'true') query.isOnline = true;
    if (minPrice) query.pricePerSession = { $gte: Number(minPrice) };
    if (maxPrice) query.pricePerSession = { ...query.pricePerSession, $lte: Number(maxPrice) };

    const sortStage: any = {};
    if (sort === 'averageRating') {
      sortStage.averageRating = -1;
    } else if (sort === 'experience') {
      sortStage.experience = -1;
    } else if (sort === 'price') {
      sortStage.pricePerSession = 1;
    } else if (sort === 'name') {
      sortStage['userId.firstName'] = 1;
    } else {
      sortStage.createdAt = -1;
    }

    const [therapists, total] = await Promise.all([
      this.therapistProfileModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        { $unwind: '$userId' },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            __v: 0,
            'userId.password': 0,
            'userId.__v': 0,
          },
        },
      ]).exec(),
      this.therapistProfileModel.countDocuments(query).exec(),
    ]);

    return { therapists, total };
  }

  /**
   * Get therapist by ID
   */
  async findById(id: string): Promise<any> {
    const therapist = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(id) })
      .populate('userId', 'firstName lastName avatar email phone')
      .exec();

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // For public view, check if therapist is available
    if (!therapist.isVerified || !therapist.isApproved || !therapist.isActive) {
      throw new ForbiddenException('Therapist profile is not available');
    }

    return therapist;
  }

  /**
   * Update therapist profile
   */
  async update(userId: string, updateData: any): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    // If updating availability, validate it
    if (updateData.availability) {
      for (const slot of updateData.availability) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          throw new BadRequestException('Invalid availability format');
        }
      }
    }

    Object.assign(profile, updateData);
    return profile.save();
  }

  /**
   * Submit verification documents
   */
  async submitVerification(userId: string, licenseImage: string): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    profile.licenseImage = licenseImage;
    profile.verificationSubmittedAt = new Date();
    profile.isVerified = false; // Reset verification status for re-verification
    profile.isApproved = false;

    return profile.save();
  }

  /**
   * Admin: Verify therapist
   */
  async verifyTherapist(adminId: string, therapistId: string): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    profile.isVerified = true;
    profile.verifiedAt = new Date();
    profile.verifiedBy = new Types.ObjectId(adminId);

    return profile.save();
  }

  /**
   * Admin: Approve therapist
   */
  async approveTherapist(adminId: string, therapistId: string): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    profile.isApproved = true;
    await profile.save();

    // Also update the User document to set isApproved: true
    await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(therapistId),
      { $set: { isApproved: true } }
    ).exec();

    return profile;
  }

  /**
   * Get therapist dashboard data
   */
  async getDashboardData(therapistId: string) {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    // Stats (will be updated when booking system is implemented)
    const stats = {
      totalSessions: profile.totalSessions,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      pendingRequests: 0,
      activeClients: 0,
    };

    return {
      profile,
      stats,
      todaySessions: [],
      recentClients: [],
    };
  }

  /**
   * Get therapist availability
   */
  async getAvailability(therapistId: string) {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    return profile.availability;
  }

  /**
   * Update availability
   */
  async updateAvailability(userId: string, availability: any[]): Promise<TherapistProfile> {
    return this.update(userId, { availability });
  }

  /**
   * Delete therapist profile
   */
  async delete(userId: string): Promise<void> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    await this.therapistProfileModel.deleteOne({ userId: new Types.ObjectId(userId) }).exec();
  }
}

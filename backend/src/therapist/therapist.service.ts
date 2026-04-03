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
      search,
      isVerified,
      page = 1,
      limit = 12,
      sort = 'experience',
    } = filters;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;
    const query: any = {};

    // For admin queries, don't filter by verification status unless explicitly requested
    if (isAdminQuery) {
      if (isVerified !== undefined && isVerified !== '') {
        query.isVerified = isVerified === true || isVerified === 'true';
      }
      query.isActive = true;
    } else {
      query.isVerified = true;
      query.isActive = true;
      // Public: trusted filter
      if (filters.trusted === 'all') {
        // Show all verified therapists regardless of trusted status
      } else if (filters.trusted === 'pending') {
        // Show only non-trusted (pending) therapists
        query.isTrusted = false;
      } else {
        // Default: trusted only
        query.isTrusted = true;
      }
    }

    if (city) query.city = new RegExp(city, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (language) query.languages = language;

    // Text search across specialty, bio, city, and user name
    const matchStage: any = { $match: query };
    if (search) {
      const regex = new RegExp(search, 'i');
      matchStage.$expr = {
        $or: [
          { $regexMatch: { input: { $ifNull: ['$specialty', ''] }, regex: search, options: 'i' } },
          { $regexMatch: { input: { $ifNull: ['$bio', ''] }, regex: search, options: 'i' } },
          { $regexMatch: { input: { $ifNull: ['$city', ''] }, regex: search, options: 'i' } },
          { $regexMatch: { input: { $ifNull: ['$userId.firstName', ''] }, regex: search, options: 'i' } },
          { $regexMatch: { input: { $ifNull: ['$userId.lastName', ''] }, regex: search, options: 'i' } },
        ],
      };
    }

    const sortStage: any = {};
    if (sort === 'experience') {
      sortStage.experience = -1;
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
        ...(search ? [matchStage] : []),
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            __v: 0,
            'userId.password': 0,
            'userId.__v': 0,
          },
        },
      ]).exec(),
      search
        ? this.therapistProfileModel.countDocuments(query).exec()
        : this.therapistProfileModel.countDocuments(query).exec(),
    ]);

    return { therapists, total };
  }

  /**
   * Get therapist by ID
   */
  async findById(id: string): Promise<any> {
    const therapist = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(id) })
      .populate('userId', 'firstName lastName avatar email phone countryCode')
      .exec();

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // For public view, check if therapist is available
    if (!therapist.isVerified || !therapist.isTrusted || !therapist.isActive) {
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
    profile.isVerified = false;
    profile.isTrusted = false;

    return profile.save();
  }

  /**
   * Admin: Verify therapist license (adds trusted badge)
   */
  async verifyTherapist(adminId: string, therapistId: string): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    profile.isVerified = true;
    profile.isTrusted = true;
    profile.verifiedAt = new Date();
    profile.verifiedBy = new Types.ObjectId(adminId);

    return profile.save();
  }

  /**
   * Admin: Approve therapist (legacy - now same as verify)
   */
  async approveTherapist(adminId: string, therapistId: string): Promise<TherapistProfile> {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    profile.isVerified = true;
    profile.isTrusted = true;
    await profile.save();

    return profile;
  }

  /**
   * Admin: Get pending therapists (not yet verified/trusted)
   */
  async findPendingTherapists(): Promise<any[]> {
    const therapists = await this.therapistProfileModel.aggregate([
      {
        $match: {
          isVerified: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          // User fields
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          phone: '$user.phone',
          countryCode: '$user.countryCode',
          birthDate: '$user.birthDate',
          gender: '$user.gender',
          avatar: '$user.avatar',
          // Profile fields
          licenseNumber: 1,
          specialty: 1,
          bio: 1,
          licenseImage: 1,
          experience: 1,
          languages: 1,
          country: 1,
          city: 1,
          clinicAddress: 1,
          // Status fields
          isVerified: 1,
          isTrusted: 1,
          isActive: 1,
          verificationSubmittedAt: 1,
          verifiedAt: 1,
          // Meta
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec();

    return therapists;
  }

  /**
   * Get therapist dashboard data
   */
  async getDashboardData(therapistId: string) {
    const profile = await this.therapistProfileModel.findOne({ userId: new Types.ObjectId(therapistId) }).exec();
    if (!profile) {
      throw new NotFoundException('Therapist profile not found');
    }

    // Stats
    const stats = {
      totalSessions: 0,
      averageRating: 0,
      totalReviews: 0,
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

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class TherapistService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getDashboardData(therapistId: string) {
    // Verify therapist exists and has correct role
    const therapist = await this.getTherapistProfile(therapistId);

    if (therapist.role !== 'therapist') {
      throw new ForbiddenException('User is not a therapist');
    }

    // Simplified stats for now (will be updated when community module is complete)
    const stats = {
      sessionsToday: 0,
      pendingRequests: 0,
      activeClients: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    return {
      therapist,
      stats,
      todaySessions: [],
      recentClients: [],
      lastUpdated: new Date(),
    };
  }

  async getTherapistProfile(therapistId: string) {
    const therapist = await this.userModel.findById(therapistId).select('-password').exec();
    
    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return {
      id: therapist._id,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      email: therapist.email,
      specialty: therapist.specialty,
      licenseNumber: therapist.licenseNumber,
      yearsOfExperience: therapist.yearsOfExperience,
      education: therapist.education,
      certifications: therapist.certifications,
      clinicAddress: therapist.clinicAddress,
      avatar: therapist.avatar,
      role: therapist.role,
      isVerified: therapist.isVerified,
      isApproved: therapist.isApproved,
    };
  }

  async getTherapistStats(therapistId: string) {
    // Simplified stats for now (sessions module removed)
    return {
      sessionsToday: 0,
      pendingRequests: 0,
      activeClients: 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Session, SessionDocument } from '../sessions/schemas/session.schema';

@Injectable()
export class TherapistService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Session') private sessionModel: Model<SessionDocument>,
  ) {}

  async getDashboardData(therapistId: string) {
    // Verify therapist exists and has correct role
    const therapist = await this.getTherapistProfile(therapistId);
    
    if (therapist.role !== 'therapist') {
      throw new ForbiddenException('User is not a therapist');
    }

    const stats = await this.getTherapistStats(therapistId);
    const todaySessions = await this.getTodaySessions(therapistId);
    const recentClients = await this.getRecentClients(therapistId);

    return {
      therapist,
      stats,
      todaySessions,
      recentClients,
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sessions count
    const todaySessionsCount = await this.sessionModel.countDocuments({
      therapistId,
      dateTime: {
        $gte: today,
        $lt: tomorrow,
      },
    }).exec();

    // Get pending requests count
    const pendingRequestsCount = await this.sessionModel.countDocuments({
      therapistId,
      status: 'pending',
    }).exec();

    // Get total active clients (clients with at least one session)
    const activeClientsCount = await this.sessionModel.distinct('clientId', {
      therapistId,
      status: { $in: ['completed', 'confirmed'] },
    }).exec();

    // Get average rating from reviews (placeholder - will implement reviews later)
    const averageRating = 0; // TODO: Implement when reviews are added
    const totalReviews = 0; // TODO: Implement when reviews are added

    return {
      sessionsToday: todaySessionsCount,
      pendingRequests: pendingRequestsCount,
      activeClients: activeClientsCount.length,
      averageRating,
      totalReviews,
    };
  }

  async getTodaySessions(therapistId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await this.sessionModel
      .find({
        therapistId,
        dateTime: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .populate('clientId', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .exec();

    return sessions.map(session => {
      const clientDoc = session.clientId as any;
      return {
        id: session._id,
        dateTime: session.dateTime,
        duration: session.duration,
        type: session.type,
        status: session.status,
        client: clientDoc ? {
          id: clientDoc._id,
          firstName: clientDoc.firstName,
          lastName: clientDoc.lastName,
          email: clientDoc.email,
        } : null,
        price: session.price,
        notes: session.notes,
      };
    });
  }

  async getRecentClients(therapistId: string, limit: number = 5) {
    // Get distinct clients with their most recent session
    const sessions = await this.sessionModel
      .find({ therapistId, status: { $in: ['completed', 'confirmed'] } })
      .populate('clientId', 'firstName lastName email avatar')
      .sort({ dateTime: -1 })
      .limit(limit)
      .exec();

    return sessions.map(session => {
      const clientDoc = session.clientId as any;
      return {
        id: clientDoc?._id,
        firstName: clientDoc?.firstName,
        lastName: clientDoc?.lastName,
        email: clientDoc?.email,
        avatar: clientDoc?.avatar,
        lastSessionDate: session.dateTime,
        totalSessions: 0, // TODO: Calculate total sessions per client
        progress: 'good', // TODO: Get from client progress tracking
      };
    });
  }

  async updateProfile(therapistId: string, updateData: Partial<User>) {
    const updatedTherapist = await this.userModel
      .findByIdAndUpdate(therapistId, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedTherapist) {
      throw new NotFoundException('Therapist not found');
    }

    return {
      id: updatedTherapist._id,
      firstName: updatedTherapist.firstName,
      lastName: updatedTherapist.lastName,
      email: updatedTherapist.email,
      specialty: updatedTherapist.specialty,
      licenseNumber: updatedTherapist.licenseNumber,
      yearsOfExperience: updatedTherapist.yearsOfExperience,
      education: updatedTherapist.education,
      certifications: updatedTherapist.certifications,
      clinicAddress: updatedTherapist.clinicAddress,
      avatar: updatedTherapist.avatar,
    };
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TherapistProfileDocument = TherapistProfile & Document;

@Schema({ timestamps: true })
export class TherapistProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 500 })
  bio: string;

  @Prop({ required: true, maxlength: 50 })
  licenseNumber: string;

  @Prop()
  licenseImage?: string;

  @Prop({ min: 0, max: 50 })
  experience: number; // Years of experience

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ default: 0, min: 0 })
  pricePerSession: number;

  @Prop({ default: 'EGP' })
  currency: string;

  // Location
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: false })
  isInPerson: boolean;

  @Prop()
  clinicAddress?: string;

  // Availability
  @Prop({
    type: [{
      day: { type: String, enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] },
      startTime: String,
      endTime: String,
      isAvailable: Boolean,
    }],
    default: [],
  })
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;

  // Status
  @Prop({ default: false })
  isVerified: boolean; // Admin verified license

  @Prop({ default: false })
  isApproved: boolean; // Can receive bookings

  @Prop({ default: true })
  isActive: boolean;

  // Stats
  @Prop({ default: 0 })
  totalSessions: number;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  // Verification
  @Prop()
  verificationSubmittedAt?: Date;

  @Prop()
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;
}

export const TherapistProfileSchema = SchemaFactory.createForClass(TherapistProfile);

// Indexes for efficient querying
TherapistProfileSchema.index({ userId: 1 });
TherapistProfileSchema.index({ isVerified: 1, isApproved: 1, isActive: 1 });
TherapistProfileSchema.index({ specialty: 1, city: 1, languages: 1 });
TherapistProfileSchema.index({ averageRating: -1 });
TherapistProfileSchema.index({ country: 1, city: 1 });

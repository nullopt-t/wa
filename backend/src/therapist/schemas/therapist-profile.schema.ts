import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TherapistProfileDocument = TherapistProfile & Document;

@Schema({ timestamps: true })
export class TherapistProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ maxlength: 500 })
  bio: string;

  @Prop({ required: true, maxlength: 50 })
  licenseNumber: string;

  @Prop()
  specialty?: string;

  @Prop()
  licenseImage?: string;

  @Prop({ min: 0, max: 50 })
  experience: number; // Years of experience

  @Prop({ type: [String], default: [] })
  languages: string[];

  // Location
  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop()
  clinicAddress?: string;

  // Status
  @Prop({ default: false })
  isVerified: boolean; // Admin verified license

  @Prop({ default: false })
  isTrusted: boolean; // Trusted badge from admin

  @Prop({ default: true })
  isActive: boolean;

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
TherapistProfileSchema.index({ country: 1, city: 1 });

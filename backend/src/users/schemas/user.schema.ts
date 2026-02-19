import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' }) // 'user' or 'therapist'
  role: string;

  @Prop()
  phone?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  gender?: string;

  @Prop()
  licenseNumber?: string; // For therapists

  @Prop()
  specialty?: string; // For therapists

  @Prop()
  yearsOfExperience?: number; // For therapists

  @Prop([String])
  education?: string[]; // For therapists

  @Prop([String])
  certifications?: string[]; // For therapists

  @Prop()
  clinicAddress?: string; // For therapists

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  // Privacy settings
  @Prop({ default: true })
  isProfilePublic: boolean;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: false })
  shareDataForResearch: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
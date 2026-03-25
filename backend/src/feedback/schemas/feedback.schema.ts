import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

export type FeedbackCategory = 'suggestion' | 'complaint' | 'praise' | 'technical' | 'other';
export type FeedbackStatus = 'pending' | 'approved' | 'rejected';

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, minlength: 10, maxlength: 2000 })
  content: string;

  @Prop({ 
    type: String, 
    enum: ['suggestion', 'complaint', 'praise', 'technical', 'other'],
    default: 'other' 
  })
  category: FeedbackCategory;

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  })
  status: FeedbackStatus;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop()
  adminResponse?: string;

  @Prop({ type: Date })
  adminResponseAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  respondedBy?: Types.ObjectId;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  views: number;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Indexes for efficient querying
FeedbackSchema.index({ status: 1, isPublic: 1, createdAt: -1 });
FeedbackSchema.index({ category: 1, status: 1 });
FeedbackSchema.index({ rating: -1 });
FeedbackSchema.index({ userId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 5000 })
  content: string;

  @Prop({ 
    type: String,
    enum: ['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'],
    required: true,
    default: 'other'
  })
  category: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  })
  status: string;

  // Engagement
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likes?: Types.ObjectId[];

  @Prop({ default: 0 })
  views: number;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  viewers?: Types.ObjectId[];

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  savedBy?: Types.ObjectId[];

  // Metadata
  @Prop({ default: 0 })
  readTime: number;

  @Prop()
  featuredImage?: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);

// Indexes for efficient queries
StorySchema.index({ status: 1, createdAt: -1 });
StorySchema.index({ authorId: 1, createdAt: -1 });
StorySchema.index({ category: 1, status: 1 });
StorySchema.index({ likes: -1 });
StorySchema.index({ views: -1 });

// Virtual for checking if current user liked
StorySchema.virtual('isLiked').get(function() {
  return (this as any)._isLiked || false;
});

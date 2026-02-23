import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 5000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop([String])
  tags?: string[];

  @Prop([String])
  images?: string[]; // URLs to uploaded images

  // Engagement
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likes?: Types.ObjectId[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  commentsCount: number;

  // Moderation
  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  })
  status: string;

  @Prop([{ type: Types.ObjectId, ref: 'Report' }])
  reports?: Types.ObjectId[];

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: false })
  isClosed: boolean; // Closed for comments

  @Prop({ default: false })
  isAnonymous: boolean; // Hide author identity

  // Metadata
  @Prop()
  lastActivityAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for efficient queries
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ categoryId: 1, status: 1 });
PostSchema.index({ likes: -1 });
PostSchema.index({ views: -1 });

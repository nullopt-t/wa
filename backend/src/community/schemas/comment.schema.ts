import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentId?: Types.ObjectId; // For nested replies

  @Prop({ required: true, maxlength: 2000 })
  content: string;

  // Engagement
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likes?: Types.ObjectId[];

  // Moderation
  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'hidden'],
    default: 'approved'
  })
  status: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  // Metadata
  @Prop({ default: 0 })
  repliesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes for efficient queries
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1 });
CommentSchema.index({ parentId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Article' })
  articleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentId?: Types.ObjectId; // For nested replies (alias for parentCommentId)

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentCommentId?: Types.ObjectId; // Alias for parentId (legacy support)

  // Engagement
  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[];

  // Moderation
  @Prop({
    type: String,
    enum: ['active', 'deleted', 'reported', 'pending', 'approved', 'hidden'],
    default: 'active',
  })
  status: string;

  @Prop({ default: 0 })
  reports: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reportedBy: Types.ObjectId[];

  // Community-specific fields
  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ default: 0 })
  repliesCount: number;

  @Prop({ default: false })
  isEdited: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes for efficient querying (article + post + community)
CommentSchema.index({ articleId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ status: 1, reports: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ parentCommentId: 1 });

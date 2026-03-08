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

  @Prop({ default: 'active' })
  status: string; // 'active', 'deleted', 'reported'

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  reports: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reportedBy: Types.ObjectId[];

  @Prop()
  parentCommentId?: Types.ObjectId; // For nested comments

  @Prop({ default: false })
  isEdited: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes for efficient querying
CommentSchema.index({ articleId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ status: 1, reports: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });

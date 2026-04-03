import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
  | 'feedback_response'
  | 'comment_reply'
  | 'post_approved'
  | 'story_approved'
  | 'account_activated'
  | 'future_message'
  | 'new_comment'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'feedback_response',
      'comment_reply',
      'post_approved',
      'story_approved',
      'account_activated',
      'future_message',
      'new_comment',
      'system',
    ],
    required: true,
    index: true,
  })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String })
  message: string;

  @Prop()
  actionUrl?: string;

  @Prop({ type: String, enum: ['Feedback', 'Comment', 'Post', 'Story', 'User', 'FutureMessage'] })
  relatedModel?: string;

  @Prop({ type: Types.ObjectId })
  relatedId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId?: Types.ObjectId;

  @Prop()
  senderName?: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true,
  })
  priority: NotificationPriority;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isDeleted: 1 });

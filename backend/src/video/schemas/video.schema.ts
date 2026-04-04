import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  videoUrl: string; // YouTube/Vimeo URL or uploaded file path

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  addedBy: Types.ObjectId;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  duration: number; // in seconds

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  category?: string;

  @Prop()
  tags?: string[];

  @Prop({ default: 0 })
  order: number;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

// Indexes
VideoSchema.index({ isFeatured: 1, createdAt: -1 });
VideoSchema.index({ isActive: 1, createdAt: -1 });
VideoSchema.index({ category: 1, isActive: 1 });
// Full-text search index
VideoSchema.index({ title: 'text', description: 'text', tags: 'text' });

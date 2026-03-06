import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string; // URL-friendly title

  @Prop({ required: true })
  excerpt: string; // Short description

  @Prop({ required: true })
  content: string; // Full article content (markdown or HTML)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  // Engagement
  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: 0 })
  bookmarks: number;

  // Publishing
  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  })
  status: string;

  @Prop()
  publishedAt?: Date;

  // Metadata
  @Prop({ default: 0 })
  readTime: number; // Estimated reading time in minutes

  @Prop({ default: false })
  isFeatured: boolean; // Show on homepage

  @Prop({ default: 0 })
  order: number; // For sorting
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Indexes
ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ isFeatured: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ categoryId: 1, status: 1, publishedAt: -1 });

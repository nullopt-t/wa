import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string; // English name

  @Prop({ required: true })
  nameAr: string; // Arabic name

  @Prop({ required: true })
  icon: string; // FontAwesome icon class

  @Prop({ required: true })
  color: string; // Hex color code

  @Prop({ default: 0 })
  order: number; // Display order

  @Prop({ default: true })
  isActive: boolean; // Active/inactive status

  @Prop({ default: 0 })
  articlesCount: number; // Number of articles in this category

  @Prop({ default: 0 })
  videosCount: number; // Number of videos in this category
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Index for efficient querying
CategorySchema.index({ order: 1, isActive: 1 });

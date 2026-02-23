import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  nameAr: string; // Arabic name

  @Prop()
  description?: string;

  @Prop()
  icon?: string; // FontAwesome icon class

  @Prop()
  color?: string; // Hex color for UI

  @Prop({ default: 0 })
  order: number; // For sorting

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Index for efficient queries
CategorySchema.index({ order: 1, isActive: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  coverImage?: string;

  @Prop()
  fileUrl?: string; // PDF or reader link

  @Prop({ required: true })
  description: string;

  @Prop()
  pages?: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ slug: 1 }, { unique: true });
BookSchema.index({ isFeatured: 1, isActive: 1 });
BookSchema.index({ title: 'text', author: 'text', description: 'text' });

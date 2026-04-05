import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string; // الاسم بالعربية

  @Prop()
  description?: string; // الوصف (اختياري)

  @Prop({ required: true })
  icon: string; // كلاس أيقونة FontAwesome

  @Prop({ required: true })
  color: string; // كود اللون

  @Prop({ default: 0 })
  order: number; // ترتيب العرض

  @Prop({ default: true })
  isActive: boolean; // نشط/غير نشط

  @Prop({ default: 0 })
  articlesCount: number; // عدد المقالات

  @Prop({ default: 0 })
  videosCount: number; // عدد الفيديوهات

  @Prop({ default: 0 })
  booksCount: number; // عدد الكتب
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Index for efficient querying
CategorySchema.index({ order: 1, isActive: 1 });

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  // Create category (admin only)
  async create(createDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(createDto);
    return createdCategory.save();
  }

  // Get all categories (public)
  async findAll(activeOnly = false): Promise<Category[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.categoryModel
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  // Get single category (public)
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('القسم غير موجود');
    }

    return category;
  }

  // Update category (admin only)
  async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('القسم غير موجود');
    }

    return updated;
  }

  // Delete category (admin only)
  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('القسم غير موجود');
    }
  }

  // Update category counts
  async updateCounts(id: string, type: 'articles' | 'videos' | 'books', increment: number): Promise<void> {
    const fieldMap = { articles: 'articlesCount', videos: 'videosCount', books: 'booksCount' };
    const field = fieldMap[type];
    await this.categoryModel.findByIdAndUpdate(id, {
      $inc: { [field]: increment },
    });
  }
}

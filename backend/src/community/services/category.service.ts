import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  // Create new category
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  // Get all active categories with post count
  async findAll(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .exec();

    // Calculate actual post count for each category using aggregation
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await this.postModel.countDocuments({
          categoryId: category._id.toString(),
          status: 'approved',
        }).exec();

        return {
          ...category.toObject(),
          postCount,
        };
      })
    );

    // Sort by post count (DESC)
    return categoriesWithCount.sort((a, b) => b.postCount - a.postCount);
  }

  // Get all categories (including inactive, for admin)
  async findAllForAdmin(): Promise<Category[]> {
    return this.categoryModel.find().sort({ order: 1 }).exec();
  }

  // Get single category
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  // Update category
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  // Delete category
  async remove(id: string): Promise<void> {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from '../schemas/article.schema';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  // Create new article
  async create(userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
    try {
      const createdArticle = new this.articleModel({
        ...createArticleDto,
        authorId: new Types.ObjectId(userId),
        status: createArticleDto.status || 'draft',
      });

      if (createdArticle.status === 'published' && !createdArticle.publishedAt) {
        createdArticle.publishedAt = new Date();
      }

      return createdArticle.save();
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  // Get all articles (published by default)
  async findAll(query: any, userId?: string): Promise<any> {
    const {
      page = 1,
      limit = 12,
      tag,
      category,
      featured,
      status,
      sort = 'publishedAt',
      myArticles,
    } = query;

    const filter: any = {};

    // If user is requesting their own articles
    if (myArticles === 'true' && userId) {
      filter.authorId = new Types.ObjectId(userId);
      // For 'my articles' view:
      // - If specific status provided, filter by it
      // - Otherwise show all statuses (draft + published + archived)
      if (status && status !== 'all') {
        // Validate status value
        const validStatuses = ['draft', 'published', 'archived'];
        if (validStatuses.includes(status)) {
          filter.status = status;
        }
      }
    } else {
      // Public view - only show published articles
      // Allow filtering by specific published status if provided
      if (status && status !== 'all') {
        // Validate status value
        const validStatuses = ['draft', 'published', 'archived'];
        if (validStatuses.includes(status)) {
          filter.status = status;
        } else {
          filter.status = 'published';
        }
      } else {
        filter.status = 'published';
      }
    }

    // Handle multiple tags (comma-separated)
    if (tag) {
      const tagsArray = tag.includes(',') ? tag.split(',').map(t => t.trim()) : [tag];
      filter.tags = { $in: tagsArray };
    }

    // Handle category filter with validation
    if (category) {
      try {
        filter.categoryId = new Types.ObjectId(category);
      } catch (error) {
        // Invalid ObjectId, ignore category filter
        console.warn('Invalid category ObjectId:', category);
      }
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const articles = await this.articleModel
      .find(filter)
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId', 'name nameAr')
      .sort({ [sort]: -1, order: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.articleModel.countDocuments(filter);

    return {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  // Get featured articles
  async findFeatured(limit = 3): Promise<Article[]> {
    try {
      return this.articleModel
        .find({ status: 'published', isFeatured: true })
        .populate('authorId', 'firstName lastName avatar')
        .sort({ publishedAt: -1, order: 1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      throw error;
    }
  }

  // Get single article by slug
  async findBySlug(slug: string): Promise<Article> {
    try {
      const article = await this.articleModel
        .findOne({ slug })
        .populate('authorId', 'firstName lastName avatar bio')
        .populate('categoryId', 'name nameAr')
        .exec();

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching article by slug:', error);
      throw error;
    }
  }

  // Get single article by ID
  async findOne(id: string): Promise<Article> {
    try {
      const article = await this.articleModel
        .findById(id)
        .populate('authorId', 'firstName lastName avatar bio')
        .populate('categoryId', 'name nameAr')
        .exec();

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching article by ID:', error);
      throw error;
    }
  }

  // Update article
  async update(userId: string, id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    try {
      const article = await this.articleModel.findById(id).exec();

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // Check if user owns the article
      if (article.authorId.toString() !== userId) {
        throw new ForbiddenException('You can only edit your own articles');
      }

      // Update publishedAt if status changes to published
      if (updateArticleDto.status === 'published' && article.status !== 'published') {
        updateArticleDto.publishedAt = new Date();
      }

      const updated = await this.articleModel
        .findByIdAndUpdate(id, updateArticleDto, { new: true })
        .populate('authorId', 'firstName lastName avatar')
        .populate('categoryId', 'name nameAr')
        .exec();

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error updating article:', error);
      throw error;
    }
  }

  // Delete article
  async remove(userId: string, id: string): Promise<void> {
    try {
      const article = await this.articleModel.findById(id).exec();

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // Check if user owns the article
      if (article.authorId.toString() !== userId) {
        throw new ForbiddenException('You can only delete your own articles');
      }

      await this.articleModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  // Track view
  async trackView(id: string): Promise<void> {
    try {
      await this.articleModel.findByIdAndUpdate(id, {
        $inc: { views: 1 },
      }).exec();
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw - view tracking is not critical
    }
  }

  // Get related articles
  async findRelated(articleId: string, tags: string[], limit = 3): Promise<Article[]> {
    try {
      return await this.articleModel
        .find({
          _id: { $ne: articleId },
          status: 'published',
          tags: { $in: tags },
        })
        .populate('authorId', 'firstName lastName avatar')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  }

  // Like article
  async like(userId: string, articleId: string): Promise<Article> {
    try {
      const article = await this.articleModel.findById(articleId).exec();

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const userObjectId = new Types.ObjectId(userId);

      // Check if already liked
      const isLiked = article.likes?.some(id => id.toString() === userId);

      if (isLiked) {
        // Unlike
        article.likes = article.likes.filter(id => id.toString() !== userId);
      } else {
        // Like
        if (!article.likes) article.likes = [];
        article.likes.push(userObjectId);
      }

      await article.save();
      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error liking article:', error);
      throw error;
    }
  }
}

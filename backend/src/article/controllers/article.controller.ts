import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

// Helper to extract userId from JWT token (works even without AuthGuard)
const getUserIdFromRequest = (req: any): string | undefined => {
  try {
    // Check if user is already authenticated via AuthGuard
    if (req.user?.userId) {
      return req.user.userId;
    }
    
    // Try to extract from JWT token manually
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        return payload.sub || payload.userId;
      }
    }
  } catch (error) {
    // Silently fail - user is not authenticated
  }
  return undefined;
};

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // Get all articles (public)
  @Get()
  async findAll(@Query() query: any, @Request() req) {
    // Extract userId from JWT token (works for both authenticated and public requests)
    const userId = getUserIdFromRequest(req);

    // Only pass userId to service if user is requesting their own articles
    const effectiveUserId = (query.myArticles === 'true' && userId) ? userId : undefined;

    return this.articleService.findAll(query, effectiveUserId);
  }

  // Get featured articles (public)
  @Get('featured')
  async findFeatured(@Query('limit') limit = '3') {
    // Validate and sanitize limit parameter
    const limitNum = parseInt(limit, 10);
    const validLimit = (isNaN(limitNum) || limitNum < 1) ? 3 : Math.min(limitNum, 50);
    return this.articleService.findFeatured(validLimit);
  }

  // Get article by slug (public)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Request() req) {
    const article: any = await this.articleService.findBySlug(slug);

    // Track view if not the author (fire and forget for analytics)
    const userId = req.user?.userId;
    const authorId = article.authorId?._id?.toString();
    if (!userId || authorId !== userId) {
      this.articleService.trackView(article._id).catch(() => {
        // Silently ignore view tracking errors (analytics)
      });
    }

    return article;
  }

  // Get single article (public)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const article: any = await this.articleService.findOne(id);

    // Track view if not the author (fire and forget for analytics)
    const userId = req.user?.userId;
    const authorId = article.authorId?._id?.toString();
    if (!userId || authorId !== userId) {
      this.articleService.trackView(article._id).catch(() => {
        // Silently ignore view tracking errors (analytics)
      });
    }

    return article;
  }

  // Create article (authenticated)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    const userId = req.user.userId;
    return this.articleService.create(userId, createArticleDto);
  }

  // Update article (author only)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const userId = req.user.userId;
    return this.articleService.update(userId, id, updateArticleDto);
  }

  // Delete article (author only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.articleService.remove(userId, id);
  }

  // Like article
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.articleService.like(userId, id);
  }
}

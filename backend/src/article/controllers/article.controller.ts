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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
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

@ApiTags('المقالات')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // Get all articles (public)
  @ApiOperation({ summary: 'عرض جميع المقالات' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async findAll(@Query() query: any, @Request() req) {
    // Extract userId from JWT token (works for both authenticated and public requests)
    const userId = getUserIdFromRequest(req);

    // Only pass userId to service if user is requesting their own articles
    const effectiveUserId = (query.myArticles === 'true' && userId) ? userId : undefined;

    return this.articleService.findAll(query, effectiveUserId);
  }

  // Get featured articles (public)
  @ApiOperation({ summary: 'عرض المقالات المميزة' })
  @ApiOkResponse({ description: 'المميز', schema: { type: 'array', items: { type: 'object' } } })
  @Get('featured')
  async findFeatured(@Query('limit') limit = '3') {
    // Validate and sanitize limit parameter
    const limitNum = parseInt(limit, 10);
    const validLimit = (isNaN(limitNum) || limitNum < 1) ? 3 : Math.min(limitNum, 50);
    return this.articleService.findFeatured(validLimit);
  }

  // Get article by slug (public)
  @ApiOperation({ summary: 'عرض مقال بالرابط' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
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
  @ApiOperation({ summary: 'عرض مقال واحد' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
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

  // Create article (admins and therapists only)
  @ApiOperation({ summary: 'إنشاء مقال جديد' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين والمعالجين فقط' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Only admins and therapists can create articles
    if (userRole !== 'admin' && userRole !== 'therapist') {
      throw new ForbiddenException('نشر المقالات متاح للمسؤولين والمعالجين فقط');
    }
    
    return this.articleService.create(userId, createArticleDto);
  }

  // Update article (author only)
  @ApiOperation({ summary: 'تحديث مقال' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
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
  @ApiOperation({ summary: 'حذف مقال' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.articleService.remove(userId, id);
  }

  // Like article
  @ApiOperation({ summary: 'الإعجاب بمقال' })
  @ApiOkResponse({ description: 'تم الإعجاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.articleService.like(userId, id);
  }
}

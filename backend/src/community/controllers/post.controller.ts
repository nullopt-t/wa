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
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@ApiTags('المجتمع')
@Controller('community/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Get all posts (public)
  @ApiOperation({ summary: 'عرض جميع المنشورات' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async findAll(@Query() query: any) {
    return this.postService.findAll(query);
  }

  // Get trending posts (public)
  @ApiOperation({ summary: 'عرض المنشورات الرائجة' })
  @ApiOkResponse({ description: 'الأكثر رواجاً', schema: { type: 'array', items: { type: 'object' } } })
  @Get('trending')
  async findTrending() {
    return this.postService.findTrending(10);
  }

  // Search posts (public)
  @ApiOperation({ summary: 'البحث في المنشورات' })
  @ApiOkResponse({ description: 'نتائج البحث', schema: { type: 'array', items: { type: 'object' } } })
  @Get('search')
  async search(@Query('q') query: string, @Query('page') page = 1) {
    return this.postService.search(query, page);
  }

  // Get user's posts (public)
  @ApiOperation({ summary: 'عرض منشورات مستخدم' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Query('page') page = 1) {
    return this.postService.findByUser(userId, page);
  }

  // Get single post (public)
  @ApiOperation({ summary: 'عرض منشور واحد' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Track view with user ID if authenticated
    const userId = req.user?.userId;
    const viewData = await this.postService.trackView(id, userId);
    const post = await this.postService.findOne(id);
    
    // Return post with updated view count
    return {
      ...JSON.parse(JSON.stringify(post)),
      views: viewData.views,
      uniqueViews: viewData.uniqueViews,
    };
  }

  // Get single post with full data including comments (for post detail page)
  @ApiOperation({ summary: 'عرض منشور مع التعليقات' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Get('detail/:id')
  async findOneWithComments(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Request() req
  ) {
    // Track view with user ID if authenticated
    const userId = req.user?.userId;
    if (userId) {
      await this.postService.trackView(id, userId);
    }
    
    return this.postService.findOneWithComments(id, Number(page), Number(limit));
  }

  // Create post (authenticated users)
  @ApiOperation({ summary: 'إنشاء منشور جديد' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postService.create(userId, createPostDto);
  }

  // Update post (author only)
  @ApiOperation({ summary: 'تحديث منشور' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const userId = req.user.userId;
    return this.postService.update(userId, id, updatePostDto);
  }

  // Delete post (author only)
  @ApiOperation({ summary: 'حذف منشور' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.remove(userId, id);
  }

  // Like/Unlike post (authenticated users)
  @ApiOperation({ summary: 'الإعجاب بمنشور' })
  @ApiOkResponse({ description: 'تم الإعجاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.like(userId, id);
  }

  // Track view (public) - returns updated view count
  @ApiOperation({ summary: 'تسجيل مشاهدة منشور' })
  @ApiOkResponse({ description: 'تمت المشاهدة' })
  @Post(':id/view')
  async trackView(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.postService.trackView(id, userId);
  }

  // Save/Unsave post (authenticated users)
  @ApiOperation({ summary: 'حفظ منشور' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المنشور غير موجود' })
  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async save(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.save(userId, id);
  }

  // Get user's saved posts
  @ApiOperation({ summary: 'عرض المنشورات المحفوظة' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('saved/list')
  @UseGuards(AuthGuard('jwt'))
  async getSavedPosts(@Request() req, @Query('page') page = 1) {
    const userId = req.user.userId;
    return this.postService.getSavedPosts(userId, page);
  }

  // Get trending tags
  @ApiOperation({ summary: 'عرض الوسوم الرائجة' })
  @ApiOkResponse({ description: 'الأكثر رواجاً', schema: { type: 'array', items: { type: 'object' } } })
  @Get('trending/tags')
  async getTrendingTags(@Query('limit') limit = 10) {
    return this.postService.getTrendingTags(Number(limit));
  }
}

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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StoryService } from '../services/story.service';
import { CreateStoryDto, UpdateStoryDto, StoryFilterDto } from '../dto/story.dto';

export class StoryStatsDto {
  @ApiProperty({ description: 'إجمالي القصص' })
  totalStories: number;

  @ApiProperty({ description: 'القصص الموافق عليها' })
  approvedStories: number;

  @ApiProperty({ description: 'القصص قيد المراجعة' })
  pendingStories: number;

  @ApiProperty({ description: 'القصص المرفوضة' })
  rejectedStories: number;

  @ApiProperty({ description: 'إجمالي المشاهدات' })
  totalViews: number;

  @ApiProperty({ description: 'إجمالي الإعجابات' })
  totalLikes: number;
}

@ApiTags('القصص')
@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  // Get all stories (public)
  @ApiOperation({ summary: 'عرض جميع القصص' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async findAll(@Query() query: StoryFilterDto, @Request() req) {
    const userId = req.user?.userId;
    return this.storyService.findAll(query, userId);
  }

  // Get single story (public)
  @ApiOperation({ summary: 'عرض قصة واحدة' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'القصة غير موجودة' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.storyService.findOne(id, userId);
  }

  // Create story (authenticated users)
  @ApiOperation({ summary: 'إنشاء قصة جديدة' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createStoryDto: CreateStoryDto) {
    const userId = req.user.userId;
    return this.storyService.create(userId, createStoryDto);
  }

  // Get user's stories
  @ApiOperation({ summary: 'عرض قصص مستخدم معين' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.storyService.findByUser(userId, Number(page), Number(limit));
  }

  // Update story (author only)
  @ApiOperation({ summary: 'تحديث قصة' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'القصة غير موجودة' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStoryDto: UpdateStoryDto,
  ) {
    const userId = req.user.userId;
    return this.storyService.update(userId, id, updateStoryDto);
  }

  // Delete story (author only)
  @ApiOperation({ summary: 'حذف قصة' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - ليس الكاتب' })
  @ApiResponse({ status: 404, description: 'القصة غير موجودة' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.remove(userId, id);
  }

  // Like/Unlike story (authenticated users)
  @ApiOperation({ summary: 'الإعجاب بقصة' })
  @ApiOkResponse({ description: 'تم الإعجاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'القصة غير موجودة' })
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.like(userId, id);
  }

  // Save/Unsave story (authenticated users)
  @ApiOperation({ summary: 'حفظ قصة' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'القصة غير موجودة' })
  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async save(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.save(userId, id);
  }

  // Get user's saved stories
  @ApiOperation({ summary: 'عرض القصص المحفوظة' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('saved/list')
  @UseGuards(AuthGuard('jwt'))
  async getSavedStories(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    const userId = req.user.userId;
    return this.storyService.getSavedStories(userId, Number(page), Number(limit));
  }

  // Admin: Get all stories for moderation
  @ApiOperation({ summary: 'عرض جميع القصص (إدارة)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  async findAllForAdmin(
    @Query() query: StoryFilterDto,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storyService.findAllForAdmin(query, Number(page), Number(limit));
  }

  // Admin: Approve/Reject story
  @ApiOperation({ summary: 'مراجعة قصة (موافقة/رفض)' })
  @ApiOkResponse({ description: 'تمت المراجعة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'حالة غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Patch('admin/:id/moderate')
  @UseGuards(AuthGuard('jwt'))
  async moderateStory(
    @Request() req,
    @Param('id') id: string,
    @Query('status') status: 'approved' | 'rejected' | 'hidden',
  ) {
    const adminId = req.user.userId;
    return this.storyService.moderateStory(adminId, id, status);
  }

  // Admin: Get statistics
  @ApiOperation({ summary: 'إحصائيات القصص' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: StoryStatsDto, description: 'إحصائيات القصص' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats() {
    return this.storyService.getStats();
  }
}

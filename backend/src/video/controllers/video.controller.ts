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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from '../services/video.service';
import { CreateVideoDto, UpdateVideoDto } from '../dto/video.dto';

@ApiTags('الفيديوهات')
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // Get all videos (public)
  @ApiOperation({ summary: 'عرض جميع الفيديوهات' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async findAll(@Query() query: any) {
    return this.videoService.findAll(query);
  }

  // Get featured videos (public)
  @ApiOperation({ summary: 'عرض الفيديوهات المميزة' })
  @ApiOkResponse({ description: 'المميز', schema: { type: 'array', items: { type: 'object' } } })
  @Get('featured')
  async findFeatured(@Query('limit') limit = '6') {
    return this.videoService.findFeatured(parseInt(limit));
  }

  // Get single video (public)
  @ApiOperation({ summary: 'عرض فيديو واحد' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'الفيديو غير موجود' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  // Get all videos for admin
  @ApiOperation({ summary: 'عرض جميع الفيديوهات (إدارة)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  async findAllForAdmin(@Request() req, @Query() query: any) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new Error('غير مصرح لك بالوصول');
    }
    return this.videoService.findAllForAdmin(query);
  }

  // Create video (admin only)
  @ApiOperation({ summary: 'إنشاء فيديو جديد' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createDto: CreateVideoDto) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new Error('غير مصرح لك بإضافة فيديوهات');
    }
    const userId = req.user.userId;
    return this.videoService.create(userId, createDto);
  }

  // Update video (admin only)
  @ApiOperation({ summary: 'تحديث فيديو' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateVideoDto,
  ) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new Error('غير مصرح لك بتعديل الفيديوهات');
    }
    return this.videoService.update(id, updateDto);
  }

  // Delete video (admin only)
  @ApiOperation({ summary: 'حذف فيديو' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @ApiResponse({ status: 404, description: 'الفيديو غير موجود' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new Error('غير مصرح لك بحذف الفيديوهات');
    }
    await this.videoService.remove(id);
  }
}

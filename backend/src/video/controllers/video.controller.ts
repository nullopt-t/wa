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
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from '../services/video.service';
import { CreateVideoDto, UpdateVideoDto } from '../dto/video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // Get all videos (public)
  @Get()
  async findAll(@Query() query: any) {
    return this.videoService.findAll(query);
  }

  // Get featured videos (public)
  @Get('featured')
  async findFeatured(@Query('limit') limit = '6') {
    return this.videoService.findFeatured(parseInt(limit));
  }

  // Get single video (public)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  // Get all videos for admin
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

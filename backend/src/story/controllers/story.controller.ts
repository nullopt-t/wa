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
import { AuthGuard } from '@nestjs/passport';
import { StoryService } from '../services/story.service';
import { CreateStoryDto, UpdateStoryDto, StoryFilterDto } from '../dto/story.dto';

@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  // Get all stories (public)
  @Get()
  async findAll(@Query() query: StoryFilterDto, @Request() req) {
    const userId = req.user?.userId;
    return this.storyService.findAll(query, userId);
  }

  // Get single story (public)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.storyService.findOne(id, userId);
  }

  // Create story (authenticated users)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createStoryDto: CreateStoryDto) {
    const userId = req.user.userId;
    return this.storyService.create(userId, createStoryDto);
  }

  // Get user's stories
  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.storyService.findByUser(userId, Number(page), Number(limit));
  }

  // Update story (author only)
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
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.remove(userId, id);
  }

  // Like/Unlike story (authenticated users)
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.like(userId, id);
  }

  // Save/Unsave story (authenticated users)
  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async save(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.storyService.save(userId, id);
  }

  // Get user's saved stories
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
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats() {
    return this.storyService.getStats();
  }
}

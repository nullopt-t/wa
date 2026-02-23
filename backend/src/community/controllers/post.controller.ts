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
import { AuthGuard } from '@nestjs/passport';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@Controller('community/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Get all posts (public)
  @Get()
  async findAll(@Query() query: any) {
    return this.postService.findAll(query);
  }

  // Get trending posts (public)
  @Get('trending')
  async findTrending() {
    return this.postService.findTrending(10);
  }

  // Search posts (public)
  @Get('search')
  async search(@Query('q') query: string, @Query('page') page = 1) {
    return this.postService.search(query, page);
  }

  // Get user's posts (public)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Query('page') page = 1) {
    return this.postService.findByUser(userId, page);
  }

  // Get single post (public)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Track view
    await this.postService.trackView(id);
    return this.postService.findOne(id);
  }

  // Create post (authenticated users)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postService.create(userId, createPostDto);
  }

  // Update post (author only)
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
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.remove(userId, id);
  }

  // Like/Unlike post (authenticated users)
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.like(userId, id);
  }

  // Track view (public)
  @Post(':id/view')
  async trackView(@Param('id') id: string) {
    return this.postService.trackView(id);
  }
}

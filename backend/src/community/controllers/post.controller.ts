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

  // Track view (public) - returns updated view count
  @Post(':id/view')
  async trackView(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.postService.trackView(id, userId);
  }

  // Save/Unsave post (authenticated users)
  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async save(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.postService.save(userId, id);
  }

  // Get user's saved posts
  @Get('saved/list')
  @UseGuards(AuthGuard('jwt'))
  async getSavedPosts(@Request() req, @Query('page') page = 1) {
    const userId = req.user.userId;
    return this.postService.getSavedPosts(userId, page);
  }
}

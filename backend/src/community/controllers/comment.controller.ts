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
import { CommentService } from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

@Controller('community/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Get comments for a post (public)
  @Get('post/:postId')
  async findByPost(
    @Param('postId') postId: string,
    @Query('page') page = 1,
  ) {
    return this.commentService.findByPost(postId, page);
  }

  // Create comment (authenticated users)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    const userId = req.user.userId;
    return this.commentService.create(userId, createCommentDto);
  }

  // Update comment (author or post owner)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Query('postId') postId?: string,
  ) {
    const userId = req.user.userId;
    return this.commentService.update(userId, id, updateCommentDto, postId);
  }

  // Delete comment (author only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.commentService.delete(userId, id);
  }

  // Like/Unlike comment (authenticated users)
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.commentService.like(userId, id);
  }
}

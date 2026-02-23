import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CategoryController } from './controllers/category.controller';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { CategoryService } from './services/category.service';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    CategoryController,
    PostController,
    CommentController,
  ],
  providers: [
    CategoryService,
    PostService,
    CommentService,
  ],
  exports: [
    CategoryService,
    PostService,
    CommentService,
  ],
})
export class CommunityModule {}

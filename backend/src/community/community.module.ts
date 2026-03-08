import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/user.module';
import { Category, CategorySchema } from './schemas/category.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Report, ReportSchema } from './schemas/report.schema';
import { CategoryController } from './controllers/category.controller';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { ReportController } from './controllers/report.controller';
import { CategoryService } from './services/category.service';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    UserModule, // Import UserModule for admin checks
  ],
  controllers: [
    CategoryController,
    PostController,
    CommentController,
    ReportController,
  ],
  providers: [
    CategoryService,
    PostService,
    CommentService,
    ReportService,
  ],
  exports: [
    CategoryService,
    PostService,
    CommentService,
    ReportService,
  ],
})
export class CommunityModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/user.module';
import { NotificationModule } from '../notification/notification.module';
import { CategoryModule } from '../category/category.module';
import { CommentModule } from '../comment/comment.module';
import { Comment, CommentSchema } from '../comment/schemas/comment.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { Report, ReportSchema } from './schemas/report.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PostController } from './controllers/post.controller';
import { ReportController } from './controllers/report.controller';
import { PostService } from './services/post.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Report.name, schema: ReportSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    UserModule, // Import UserModule for admin checks
    NotificationModule,
    CategoryModule,
    CommentModule,
  ],
  controllers: [
    PostController,
    ReportController,
  ],
  providers: [
    PostService,
    ReportService,
  ],
  exports: [
    PostService,
    ReportService,
  ],
})
export class CommunityModule {}

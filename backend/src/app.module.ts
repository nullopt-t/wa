import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { TherapistModule } from './therapist/therapist.module';
import { CommunityModule } from './community/community.module';
import { UploadModule } from './upload/upload.module';
import { ArticleModule } from './article/article.module';
import { FutureMessageModule } from './future-message/future-message.module';
import { ChatModule } from './chat/chat.module';
import { VideoModule } from './video/video.module';
import { CommentModule } from './comment/comment.module';
import { StoryModule } from './story/story.module';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  Logger.error('DATABASE_URL environment variable is not set', 'AppModule');
  process.exit(1);
}

Logger.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`, 'AppModule');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    // TODO: Move DATABASE_URL to Railway environment variables
    MongooseModule.forRoot(dbUrl, {
      // Connection retry options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute
    }]),
    UserModule,
    AuthModule,
    HealthModule,
    TherapistModule,
    CommunityModule,
    UploadModule,
    ArticleModule,
    FutureMessageModule,
    ChatModule,
    VideoModule,
    CommentModule,
    StoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
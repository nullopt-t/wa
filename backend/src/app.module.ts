import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RedisCacheModule } from './modules/redis-cache/redis-cache.module';
import { UserModule } from './users/user.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { TherapistModule } from './therapist/therapist.module';
import { CommunityModule } from './community/community.module';
import { UploadModule } from './upload/upload.module';
import { ArticleModule } from './article/article.module';
import { FutureMessageModule } from './future-message/future-message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://admin:password@mongo:27017/waey?authSource=admin'),
    RedisCacheModule,
    UserModule,
    AuthModule,
    HealthModule,
    TherapistModule,
    CommunityModule,
    UploadModule,
    ArticleModule,
    FutureMessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
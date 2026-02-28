import { Module, Global } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { UploadController } from './upload.controller';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: join(__dirname, '../../data/uploads/posts'),
          filename: (req, file, cb) => {
            const uniqueSuffix = randomUUID();
            const ext = file.originalname.split('.').pop();
            cb(null, `post-${uniqueSuffix}.${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed'), false);
            return;
          }
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
          if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid image type'), false);
            return;
          }
          cb(null, true);
        },
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
          files: 5,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}

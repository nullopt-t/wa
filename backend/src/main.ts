import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as cors from 'cors';
import * as compression from 'compression';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for all origins (graduation project)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Security middleware - disable for graduation project
  // app.use(helmet());

  app.use(compression());

  // Serve static files for uploads at both /uploads and /api/uploads
  const uploadsPath = join(__dirname, '..', 'data', 'uploads');
  app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
  }));
  app.use('/api/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
  }));

  // Validation pipe with transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // Convert empty strings to undefined
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Set global prefix (exclude uploads and upload routes)
  app.setGlobalPrefix('api', {
    exclude: ['uploads', 'uploads/*', 'upload', 'upload/*'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Server running on port ${port}`, 'Bootstrap');
}
bootstrap();

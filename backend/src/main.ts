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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: false, // Disable CORP to allow loading images from frontend
    crossOriginOpenerPolicy: false, // Disable COOP for static assets
  }));
  app.use(compression());

  // Serve static files for uploads (outside API prefix)
  app.useStaticAssets(join(__dirname, '..', 'data', 'uploads'), {
    prefix: '/uploads',
  });

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

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Server running on port ${port}`, 'Bootstrap');
}
bootstrap();
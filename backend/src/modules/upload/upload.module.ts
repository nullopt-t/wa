import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { FileUploadMiddleware } from './file-upload.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [FileUploadMiddleware],
  exports: [FileUploadMiddleware],
})
export class UploadModule {
  configure(consumer: MiddlewareConsumer) {
    // Configure middleware routes when needed
    // For now, we'll use it directly in the controller
  }
}

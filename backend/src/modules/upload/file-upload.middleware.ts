import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { multerConfig } from './multer.config';
import { MulterError } from 'multer';

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private upload: any;

  constructor() {
    this.upload = multer(multerConfig);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Use multer middleware for single file upload
    this.upload.single('avatar')(req, res, (err: any) => {
      if (err instanceof MulterError) {
        // Handle multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size is too large. Maximum size is 5MB',
            error_code: 'FILE_TOO_LARGE',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
          error_code: 'UPLOAD_ERROR',
        });
      } else if (err) {
        // Handle other errors
        return res.status(400).json({
          success: false,
          message: err.message,
          error_code: 'UPLOAD_ERROR',
        });
      }
      next();
    });
  }
}

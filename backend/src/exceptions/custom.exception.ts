import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  private readonly errorCode: string;

  constructor(message: string, status: HttpStatus, errorCode: string) {
    super(message, status);
    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpException } from '../exceptions/custom.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Prepare response based on exception type
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof CustomHttpException) {
      message = exception.message;
      errorCode = exception.getErrorCode();
    } else if (exception instanceof HttpException) {
      message = exception.message;
      // Map common HTTP errors to appropriate error codes
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          errorCode = 'BAD_REQUEST';
          break;
        case HttpStatus.UNAUTHORIZED:
          errorCode = 'UNAUTHORIZED';
          break;
        case HttpStatus.FORBIDDEN:
          errorCode = 'FORBIDDEN';
          break;
        case HttpStatus.NOT_FOUND:
          errorCode = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          errorCode = 'CONFLICT';
          break;
        case HttpStatus.UNPROCESSABLE_ENTITY:
          errorCode = 'VALIDATION_ERROR';
          break;
        default:
          errorCode = 'INTERNAL_ERROR';
      }
    } else if (exception instanceof Error) {
      // For other errors, we still provide a generic message
      message = 'Internal server error';
      errorCode = 'INTERNAL_ERROR';
    }

    // Log the full error details for internal debugging (after determining message)
    this.logger.error(
      `Error occurred: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : null,
      `Path: ${request.url}, Method: ${request.method}, Status: ${status}, Message: ${message}`
    );

    // Send sanitized response to client
    response.status(status).json({
      success: false,
      message: message, // This is in English for developers
      error_code: errorCode, // This is the code for frontend localization
      timestamp: new Date().toISOString(),
      // Stack trace is never sent to client - only logged internally
    });
  }
}
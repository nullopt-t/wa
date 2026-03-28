import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../exceptions/custom.exception';
import { ErrorCode } from '../enums/error-code.enum';

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class EmailExistsException extends CustomHttpException {
  constructor() {
    super('Email already exists', HttpStatus.CONFLICT, ErrorCode.EMAIL_EXISTS);
  }
}

export class AccountNotFoundException extends CustomHttpException {
  constructor() {
    super('Account not found', HttpStatus.NOT_FOUND, ErrorCode.ACCOUNT_NOT_FOUND);
  }
}

export class UnauthorizedAccessException extends CustomHttpException {
  constructor() {
    super('Unauthorized access', HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED_ACCESS);
  }
}

export class TokenExpiredException extends CustomHttpException {
  constructor() {
    super('Token has expired', HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED);
  }
}

export class TokenInvalidException extends CustomHttpException {
  constructor() {
    super('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_INVALID);
  }
}

export class ValidationException extends CustomHttpException {
  constructor(message?: string) {
    super(message || 'Validation failed', HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_ERROR);
  }
}

export class ResourceNotFoundException extends CustomHttpException {
  constructor(resource: string) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
  }
}

// New account state exceptions
export class EmailNotVerifiedException extends CustomHttpException {
  constructor(email: string) {
    super(
      `البريد الإلكتروني غير مؤكد: ${email}. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد. خطوات التسجيل: 1) التحقق من البريد الإلكتروني ⏳ 2) مراجعة الإدارة (للمعالجين)`,
      HttpStatus.UNAUTHORIZED,
      ErrorCode.EMAIL_NOT_VERIFIED
    );
  }
}

export class AccountDeactivatedException extends CustomHttpException {
  constructor() {
    super('Account has been deactivated', HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_DEACTIVATED);
  }
}

export class PasswordExpiredException extends CustomHttpException {
  constructor() {
    super('Password has expired', HttpStatus.UNAUTHORIZED, ErrorCode.PASSWORD_EXPIRED);
  }
}

export class TherapistPendingApprovalException extends CustomHttpException {
  constructor() {
    super(
      'حسابك كمعالج قيد المراجعة من قبل فريقنا. ستتلقى إشعاراً عبر البريد الإلكتروني عند الموافقة. خطوات التسجيل: 1) التحقق من البريد الإلكتروني ✅ 2) مراجعة الإدارة ⏳',
      HttpStatus.UNAUTHORIZED,
      ErrorCode.ACCOUNT_PENDING_APPROVAL
    );
  }
}
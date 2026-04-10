import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../exceptions/custom.exception';
import { ErrorCode } from '../enums/error-code.enum';

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class AccountDeactivatedException extends CustomHttpException {
  constructor() {
    super('Account has been deactivated', HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_DEACTIVATED);
  }
}

export class EmailNotVerifiedException extends CustomHttpException {
  constructor(email: string) {
    super(
      `البريد الإلكتروني غير مؤكد: ${email}. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد. خطوات التسجيل: 1) التحقق من البريد الإلكتروني ⏳ 2) مراجعة الإدارة (للمعالجين)`,
      HttpStatus.UNAUTHORIZED,
      ErrorCode.EMAIL_NOT_VERIFIED
    );
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

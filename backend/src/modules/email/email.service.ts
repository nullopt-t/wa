import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.logger.warn('Email service disabled — no emails will be sent');
  }

  private get fromName() {
    return this.configService.get('SMTP_FROM_NAME', 'Waey Platform');
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
  ) {
    this.logger.log(`[DISABLED] Would send verification email to ${email}`);
    return { success: true, skipped: true };
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    this.logger.log(`[DISABLED] Would send welcome email to ${email}`);
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ) {
    this.logger.log(`[DISABLED] Would send password reset email to ${email}`);
  }

  async sendFutureMessageEmail(
    recipientEmail: string,
    firstName: string,
    title: string,
    message: string,
    writtenDate: Date,
    scheduledDate: Date,
    deliveredDate: Date,
  ) {
    this.logger.log(`[DISABLED] Would send future message email to ${recipientEmail}`);
  }
}

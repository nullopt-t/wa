import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: any;
  private readonly logger = new Logger(EmailService.name);
  private templates: {
    verification: string;
    passwordReset: string;
    welcome: string;
  };

  constructor(private configService: ConfigService) {
    // Load email templates
    this.templates = {
      verification: this.loadTemplate('verification.template.html'),
      passwordReset: this.loadTemplate('password-reset.template.html'),
      welcome: this.loadTemplate('welcome.template.html'),
    };

    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error: any, success: any) => {
      if (error) {
        this.logger.error('Email service verification failed:', error);
      } else {
        this.logger.log('Email service ready to send messages');
      }
    });
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(__dirname, 'templates', templateName);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      return '';
    }
  }

  private renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('CLIENT_URL', 'http://localhost:3000')}/verify-email?token=${verificationToken}`;

    const html = this.renderTemplate(this.templates.verification, {
      firstName,
      verificationUrl,
      email,
    });

    const mailOptions = {
      from: `"Waey Platform" <${this.configService.get('SMTP_FROM_EMAIL', 'noreply@waey.com')}>`,
      to: email,
      subject: 'Verify Your Email - Waey Platform',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string) {
    const resetUrl = `${this.configService.get('CLIENT_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const html = this.renderTemplate(this.templates.passwordReset, {
      firstName,
      resetUrl,
    });

    const mailOptions = {
      from: `"Waey Platform" <${this.configService.get('SMTP_FROM_EMAIL', 'noreply@waey.com')}>`,
      to: email,
      subject: 'Password Reset Request - Waey Platform',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const dashboardUrl = `${this.configService.get('CLIENT_URL', 'http://localhost:3000')}/dashboard`;

    const html = this.renderTemplate(this.templates.welcome, {
      firstName,
      dashboardUrl,
    });

    const mailOptions = {
      from: `"Waey Platform" <${this.configService.get('SMTP_FROM_EMAIL', 'noreply@waey.com')}>`,
      to: email,
      subject: 'Welcome to Waey Platform! 🎉',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }
}

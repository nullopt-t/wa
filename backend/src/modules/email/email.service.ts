import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service initialized with Resend');
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will not be sent');
    }
  }

  private get fromEmail() {
    return this.configService.get(
      'SMTP_FROM_EMAIL',
      'noreply@waey.com',
    );
  }

  private get fromName() {
    return this.configService.get('SMTP_FROM_NAME', 'Waey Platform');
  }

  private get fromAddress() {
    return `${this.fromName} <${this.fromEmail}>`;
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.error('Resend not configured — email not sent');
      return null;
    }

    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    this.logger.log(`Email sent to ${to}: ${data.id}`);
    return data;
  }

  // ==================== Email Templates ====================

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
  ) {
    const verificationUrl = `${this.configService.get('CLIENT_URL', 'http://localhost:5173')}/verify-email?token=${verificationToken}`;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Waey Platform</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px; }
    .button { display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>مرحباً بك في منصة وعي!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">خطوة واحدة بعيداً عن البدء</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">أهلاً ${firstName}،</p>
      <p style="font-size: 16px; line-height: 1.6;">شكراً لتسجيلك في منصة وعي. يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك:</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">التحقق من البريد الإلكتروني</a>
      </div>
      <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">أو انسخ هذا الرابط في متصفحك:</p>
      <p style="font-size: 12px; color: #10b981; word-break: break-all;">${verificationUrl}</p>
      <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد بأمان.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} منصة وعي. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
    `;

    this.logger.log(`Sending verification email to ${email}`);
    return this.send(email, 'Verify Your Email - Waey Platform', html);
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Welcome - Waey Platform</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 10px;">
    <h1 style="color: #10b981;">مرحباً ${firstName}!</h1>
    <p>شكراً لانضمامك إلى منصة وعي.</p>
    <p>نحن متحمسون لوجودك معنا!</p>
  </div>
</body>
</html>
    `;

    return this.send(email, 'Welcome to Waey Platform!', html);
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ) {
    const resetUrl = `${this.configService.get('CLIENT_URL', 'http://localhost:5173')}/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Password Reset - Waey Platform</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 10px; }
    .button { display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #10b981;">إعادة تعيين كلمة المرور</h1>
    <p>أهلاً ${firstName}،</p>
    <p>تلقيت طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
    </div>
    <p>أو انسخ هذا الرابط:</p>
    <p style="color: #10b981; word-break: break-all;">${resetUrl}</p>
    <p style="color: #6c757d; font-size: 14px;">إذا لم تطلب هذا، يمكنك تجاهل هذا البريد.</p>
  </div>
</body>
</html>
    `;

    return this.send(email, 'Password Reset Request', html);
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
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Future Message - Waey Platform</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 10px; }
    .message { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #10b981;">رسالة من الماضي</h1>
    <p>أهلاً ${firstName}،</p>
    <p>هذه رسالة كتبتها في الماضي:</p>
    <div class="message">
      <h2 style="color: #10b981;">${title}</h2>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
    <p style="color: #6c757d; font-size: 14px;">
      كُتبت في: ${writtenDate.toLocaleDateString('ar-EG')}<br>
      أُرسلت في: ${deliveredDate.toLocaleDateString('ar-EG')}
    </p>
  </div>
</body>
</html>
    `;

    return this.send(recipientEmail, title, html);
  }
}

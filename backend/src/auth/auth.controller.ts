import { Controller, Post, Body, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterTherapistDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { UserService } from '../users/user.service';

@ApiTags('المصادقة')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @ApiOperation({ summary: 'تسجيل حساب جديد' })
  @ApiOkResponse({ description: 'تم التسجيل بنجاح' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الحساب بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto | RegisterTherapistDto) {
    const result = await this.authService.register(registerDto);

    // For security, we return a generic response for both cases
    // to prevent account enumeration
    if (typeof result === 'object' && 'emailSent' in result) {
      // Case where email already exists - return generic success
      return {
        success: true,
        message: 'Verification link has been sent to your email',
        emailSent: true
      };
    } else {
      // Case where new user was created - return user info
      return result;
    }
  }

  @ApiOperation({ summary: 'تسجيل الدخول' })
  @ApiOkResponse({ description: 'تم تسجيل الدخول' })
  @ApiResponse({ status: 200, description: 'تم تسجيل الدخول بنجاح' })
  @ApiResponse({ status: 401, description: 'بيانات غير صحيحة' })
  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // The validation is done in the strategy, so we can proceed directly
    // The LoginDto provides additional validation layer
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'عرض الملف الشخصي' })
  @ApiOkResponse({ description: 'الملف الشخصي' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    // Fetch full user profile from database (JWT only contains basic info)
    return this.userService.findById(req.user.userId);
  }

  @ApiOperation({ summary: 'تغيير كلمة المرور' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @ApiOperation({ summary: 'نسيت كلمة المرور' })
  @ApiOkResponse({ description: 'تم إرسال رابط إعادة التعيين' })
  @ApiResponse({ status: 200, description: 'تم إرسال رابط إعادة التعيين' })
  @ApiResponse({ status: 404, description: 'البريد غير موجود' })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: 'إعادة تعيين كلمة المرور' })
  @ApiOkResponse({ description: 'تم إعادة تعيين كلمة المرور' })
  @ApiResponse({ status: 200, description: 'تم إعادة تعيين كلمة المرور' })
  @ApiResponse({ status: 400, description: 'رمز غير صالح' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmNewPassword
    );
  }

  @ApiOperation({ summary: 'تأكيد البريد الإلكتروني' })
  @ApiOkResponse({ description: 'تم تأكيد البريد' })
  @ApiResponse({ status: 200, description: 'تم تأكيد البريد' })
  @ApiResponse({ status: 400, description: 'رمز غير صالح' })
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: { token: string }) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @ApiOperation({ summary: 'إعادة إرسال رابط التأكيد' })
  @ApiOkResponse({ description: 'تم إرسال رابط التأكيد' })
  @ApiResponse({ status: 200, description: 'تم إرسال رابط التأكيد' })
  @ApiResponse({ status: 404, description: 'البريد غير موجود' })
  @Post('resend-verification')
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @ApiOperation({ summary: 'تحديث إعدادات الخصوصية' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Patch('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  async updatePrivacySettings(
    @Request() req,
    @Body() privacySettings: { isProfilePublic?: boolean; emailNotifications?: boolean; shareDataForResearch?: boolean }
  ) {
    return this.userService.update(req.user.userId, privacySettings);
  }

  @ApiOperation({ summary: 'تحديث رمز الوصول' })
  @ApiOkResponse({ description: 'تم تحديث الرموز' })
  @ApiResponse({ status: 200, description: 'تم تحديث الرموز' })
  @ApiResponse({ status: 401, description: 'رمز غير صالح' })
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}